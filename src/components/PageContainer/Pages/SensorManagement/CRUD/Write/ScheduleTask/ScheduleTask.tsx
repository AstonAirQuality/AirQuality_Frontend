import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import CustomFadingAlert from '../../../../SharedComponents/CustomFadingAlert.tsx';
import CustomAlert from '../../../../SharedComponents/CustomAlert.tsx';
import { db } from '../../../../../../../firebaseConfig';
import { onValue, ref } from 'firebase/database';
import { RequestMethod } from '../FormContainer'
import { UserAuth } from '../../../../../../context/AuthContext.tsx'

interface ScheduleTaskProps {
    setMenuOpen: (value: string) => void;
    requestMethod: RequestMethod
    setSubmissionAlert: (alert: React.ReactNode) => void;
}

interface FormData {
    start: string;
    end: string;
    sensor_ids: string[];
}

const ScheduleTask: React.FC<ScheduleTaskProps> = ({
    setMenuOpen,
    requestMethod,
    setSubmissionAlert,
}) => {
    // Get the authenticated user from context
    const { user } = UserAuth() || {};
    const initialFormData: FormData = {
        start: new Date().toISOString().slice(0, 10),
        end: new Date().toISOString().slice(0, 10),
        sensor_ids: [],
    };

    const [state, setState] = useState<FormData>(initialFormData);
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState<string | [string, string] | ''>('');
    const [startDateTransition, setStartDateTransition] = useState(false);
    const [endDateTransition, setEndDateTransition] = useState(false);
    const [sensorIdTransition, setSensorIdTransition] = useState(false);
    const [dataIngestionTaskKey, setDataIngestionTaskKey] = useState<string | null>(null);

    function validateForm(): boolean {
        if (!state.start || !state.end || state.sensor_ids.length === 0) {
            setAlertMessage('Missing required fields');
            if (!state.start) {
                setStartDateTransition(true);
                return false;
            }
            if (!state.end) {
                setEndDateTransition(true);
                return false;
            }
            if (state.sensor_ids.length === 0) {
                setSensorIdTransition(true);
                return false;
            }
        }
        // check if sensor ids are valid integers
        for (let i = 0; i < state.sensor_ids.length; i++) {
            if (isNaN(Number(state.sensor_ids[i]))) {
                setAlertMessage('Sensor IDs must be integers');
                setSensorIdTransition(true);
                return false;
            }
        }
        return true;
    }

    function formatData() {
        let stateCopy = { ...state };

        // date format to dd-mm-yyyy
        const startDate = new Date(state.start);
        const startDay = startDate.getDate();
        const startMonth = startDate.getMonth() + 1;
        const startYear = startDate.getFullYear();
        const formattedStartDate = `${startDay}-${startMonth}-${startYear}`;

        const endDate = new Date(state.end);
        const endDay = endDate.getDate();
        const endMonth = endDate.getMonth() + 1;
        const endYear = endDate.getFullYear();
        const formattedEndDate = `${endDay}-${endMonth}-${endYear}`;

        stateCopy.start = formattedStartDate;
        stateCopy.end = formattedEndDate;

        return stateCopy;
    }

    async function submitForm(formState: FormData, request: RequestMethod) {
        setSubmissionAlert(
            <CustomAlert
                alertStyle="form-info-alert"
                status="Please wait! "
                message="Submitting your request. This may take a few seconds."
                responseBody=""
            />
        );
        await fetch(request.url, {
            method: request.method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user?.access_token}`,
            },
            body: JSON.stringify(formState),
        })
            .then((response) => response.json())
            .then((data) => {
                setDataIngestionTaskKey(data?.task_id ?? null);
            })
            .catch((error) => {
                setDataIngestionTaskKey(null);
                console.error('Error:', error);
            });
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (validateForm()) {
            setLoading(true);
            const formattedData = formatData();
            const request = { ...requestMethod };
            request.url = `${requestMethod.url}/${formattedData.start}/${formattedData.end}?sensor_ids=${formattedData.sensor_ids.join(
                '&sensor_ids='
            )}`;
            await submitForm(state, request).finally(() => {
                setLoading(false);
            });
        }
    }

    useEffect(() => {
        if (
            startDateTransition ||
            endDateTransition ||
            sensorIdTransition
        ) {
            const timeout = setTimeout(() => {
                setStartDateTransition(false);
                setEndDateTransition(false);
                setSensorIdTransition(false);
            }, 8000);
            return () => clearTimeout(timeout);
        }
    }, [startDateTransition, endDateTransition, sensorIdTransition]);

    function handleChange(
        e: ChangeEvent<HTMLInputElement>,
        prevState: FormData
    ) {
        if (e.target.name === 'sensor_ids') {
            // split string into array and add to state
            const sensor_ids_array = e.target.value
                .split(',')
                .map((id) => id.trim())
                .filter((id) => id.length > 0);
            setState({ ...prevState, [e.target.name]: sensor_ids_array });
        } else {
            setState({ ...prevState, [e.target.name]: e.target.value });
        }
    }

    // if dataIngestionTaskKey is not null, then we have a valid task_id and we can start listening for updates
    useEffect(() => {
        if (dataIngestionTaskKey) {
            const dbRef = ref(db, `data-ingestion-tasks/${dataIngestionTaskKey}`);
            const unsubscribe = onValue(dbRef, (snapshot) => {
                const data = snapshot.val();
                if (data?.status === 1) {
                    setSubmissionAlert(
                        <CustomAlert
                            alertStyle="form-success-alert"
                            status="Success! "
                            message={data?.message + '. Please close this panel and refresh the page to see the changes.'}
                            responseBody=""
                        />
                    );
                } else if (data?.status === 0) {
                    setSubmissionAlert(
                        <CustomAlert
                            alertStyle="form-info-alert"
                            status="Please wait! "
                            message={data?.message}
                            responseBody=""
                        />
                    );
                } else if (data?.status === -1) {
                    setSubmissionAlert(
                        <CustomAlert
                            alertStyle="form-error-alert"
                            status="Error! "
                            message={data?.message}
                            responseBody=""
                        />
                    );
                }
                }
            );
            return () => unsubscribe();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataIngestionTaskKey]);
    
    return (
        <>
            {alertMessage && (
                <CustomFadingAlert
                    message={alertMessage}
                    setAlertMessage={setAlertMessage}
                    status="error"
                />
            )}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="form-label">start date*</label>
                    <input
                        className={`form-input ${
                            startDateTransition
                                ? 'form-input-error'
                                : 'form-input-error-fade'
                        }`}
                        id="start"
                        type="date"
                        name="start"
                        value={state.start}
                        onChange={(e) => handleChange(e, state)}
                    />
                </div>

                <div className="mb-4">
                    <label className="form-label">end date*</label>
                    <input
                        className={`form-input ${
                            endDateTransition
                                ? 'form-input-error'
                                : 'form-input-error-fade'
                        }`}
                        id="end"
                        type="date"
                        name="end"
                        value={state.end}
                        onChange={(e) => handleChange(e, state)}
                    />
                </div>

                <div className="mb-4">
                    <label className="form-label">sensor_id*</label>
                    <input
                        className={`form-input ${
                            sensorIdTransition
                                ? 'form-input-error'
                                : 'form-input-error-fade'
                        }`}
                        id="sensor_ids"
                        type="text"
                        placeholder={'number, number, number, ...'}
                        name="sensor_ids"
                        value={state.sensor_ids.join(',')}
                        onChange={(e) => handleChange(e, state)}
                    />
                </div>

                {/* form buttons */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setMenuOpen('false')}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="button"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={loading}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </>
    );
};

export default ScheduleTask;
