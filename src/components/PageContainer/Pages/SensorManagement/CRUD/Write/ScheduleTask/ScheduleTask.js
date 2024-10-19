import { useState, useEffect } from 'react'
import CustomFadingAlert from '../../../../SharedComponents/CustomFadingAlert';
import CustomAlert from '../../../../SharedComponents/CustomAlert';
import { db } from '../../../../../../../firebaseConfig.js';
import { onValue, ref } from 'firebase/database';

const ScheduleTask = ({ setMenuOpen, requestURL, authToken, submissionAlert, setSubmissionAlert }) => {

    const formData = {
        // date fomatted as dd-mm-yyyy
        start: new Date().toISOString().slice(0, 10),
        end: new Date().toISOString().slice(0, 10),
        sensor_ids: [],
    }

    const [state, setState] = useState(formData);
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [startDateTransition, setStartDateTransition] = useState(false);
    const [endDateTransition, setEndDateTransition] = useState(false);
    const [sensorIdTransistion, setSensorIdTransition] = useState(false);
    const [dataIngestionTaskKey, setDataIngestionTaskKey] = useState(null);


    function validateForm() {
        if (!state.start || !state.end || state.sensor_ids === 0) {
            setAlertMessage('Missing required fields');
            if (!state.start) {
                setStartDateTransition(true);
                return false;
            }
            if (!state.end) {
                setEndDateTransition(true);
                return false;
            }
            if (state.sensor_ids === 0) {
                setSensorIdTransition(true);
                return false;
            }

            // check if sensor ids are valid integers
            for (let i = 0; i < state.sensor_ids.length; i++) {
                if (isNaN(state.sensor_ids[i])) {
                    setAlertMessage('Sensor IDs must be integers');
                    setSensorIdTransition(true);
                    return false;
                }
            }
        }
        return true;
    }

    function formatData() {

        let stateCopy = { ...state };

        //date format to dd-mm-yyyy
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

    async function submitForm(state, request) {
        setSubmissionAlert(CustomAlert("form-info-alert", "Please wait! ", "Submitting your request. This may take a few seconds."))
        await fetch(request.url, {
            method: request.method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(state)
        })
            .then(response => response.json())
            .then(data => {
                setDataIngestionTaskKey(data?.task_id);
            })
            .catch((error) => {
                setDataIngestionTaskKey(null);
                console.error('Error:', error);
            });
    }



    async function handleSubmit(e) {
        e.preventDefault();
        if (validateForm()) {
            setLoading(true);
            const formattedData = formatData();
            const request = { ...requestURL };
            request.url = `${requestURL.url}/${formattedData.start}/${formattedData.end}?sensor_ids=${formattedData.sensor_ids.join("&sensor_ids=")}`;
            await submitForm(state, request)
                .finally(() => { setLoading(false); });

        }
    }

    useEffect(() => {
        setTimeout(() => {
            setStartDateTransition(false);
            setEndDateTransition(false);
            setSensorIdTransition(false);
        }, 8000); //8 seconds
    }, [startDateTransition, endDateTransition, sensorIdTransistion])


    function handleChange(e, state) {
        if (e.target.name === "sensor_ids") {
            // split string into array and add to state
            const sensor_ids_array = e.target.value.split(",");
            setState({ ...state, [e.target.name]: sensor_ids_array });
        }
        else {
            setState({ ...state, [e.target.name]: e.target.value });
        }
    }

    // if dataIngestionTaskKey is not null, then we have a valid task_id and we can start listening for updates
    useEffect(() => {
        if (dataIngestionTaskKey) {
            const dbRef = ref(db, `data-ingestion-tasks/${dataIngestionTaskKey}`);
            onValue(dbRef, (snapshot) => {
                const data = snapshot.val();
                if (data?.status === 1) {
                    setSubmissionAlert(CustomAlert("form-success-alert", "Success! ",
                        data?.message + ". Please close this panel and refresh the page to see the changes."))
                }
                else if (data?.status === 0) {
                    setSubmissionAlert(CustomAlert("form-info-alert", "Please wait! ", data?.message))
                }
                else if (data?.status === -1) {
                    setSubmissionAlert(CustomAlert("form-error-alert", "Error! ", data?.message))
                }
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataIngestionTaskKey])

                    return (
                        <>
                            {alertMessage && <CustomFadingAlert message={alertMessage} setAlertMessage={setAlertMessage} status="error" />}
                            <div className="mb-4">
                                <label className="form-label">
                                    start date*
                                </label>
                                <input className={`form-input ${startDateTransition ? 'form-input-error' : 'form-input-error-fade'}`}
                                    id="start" type="date"
                                    name="start"
                                    value={state.start}
                                    onChange={(e) => handleChange(e, state)} />
                            </div>

                            <div className="mb-4">
                                <label className="form-label">
                                    end date*
                                </label>
                                <input className={`form-input ${endDateTransition ? 'form-input-error' : 'form-input-error-fade'}`}
                                    id="end" type="date"
                                    name="end"
                                    value={state.end}
                                    onChange={(e) => handleChange(e, state)} />
                            </div>


                            <div className="mb-4">
                                <label className="form-label">
                                    sensor_id*
                                </label>
                                <input className={`form-input ${sensorIdTransistion ? 'form-input-error' : 'form-input-error-fade'}`}
                                    id="sensor_ids" type="text"
                                    placeholder={"number, number, number, ..."}
                                    name="sensor_ids"
                                    value={state.sensor_ids}
                                    onChange={(e) => handleChange(e, state)} />
                            </div>

                            {/* form buttons */}
                            <div className="flex items-center justify-between">
                                <button onClick={() => setMenuOpen(false)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                                    Cancel
                                </button>
                                <button onClick={handleSubmit} disabled={loading} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                                    Submit
                                </button>

                            </div>
                        </>
                    )
                }

                export default ScheduleTask


