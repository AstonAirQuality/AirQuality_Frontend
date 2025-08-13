import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import CustomFadingAlert from '../../../../SharedComponents/CustomFadingAlert.tsx';
import { RequestMethod } from '../FormContainer'
interface CreatePlumeSensorPlatformProps {
    setChanges: (changed: boolean) => void;
    setMenuOpen: (open: string) => void;
    requestMethod: RequestMethod;
    submitForm: (state: { serial_numbers: string[] }, requestMethod: RequestMethod) => Promise<any>;
}

const formData = { serial_numbers: [] as string[] };

const CreatePlumeSensorPlatform: React.FC<CreatePlumeSensorPlatformProps> = ({
    setChanges,
    setMenuOpen,
    requestMethod,
    submitForm,
}) => {
    const [state, setState] = useState(formData);
    const [alertMessage, setAlertMessage] = useState<string | [string, string] | ''>('');
    const [serialNumbersTransition, setSerialNumbersTransition] = useState(false);
    const [loading, setLoading] = useState(false);

    const addSerialNumber = (value: string) => {
        const serial_numbers_array = value.split(',').map(s => s.trim()).filter(Boolean);
        setState({ serial_numbers: serial_numbers_array });

        if (JSON.stringify({ serial_numbers: serial_numbers_array }) !== JSON.stringify(formData)) {
            setChanges(true);
        } else {
            setChanges(false);
        }
    };

    function validateForm() {
        if (state.serial_numbers.length === 0) {
            setAlertMessage('Missing required fields');
            setSerialNumbersTransition(true);
            return false;
        }
        return true;
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (validateForm()) {
            setLoading(true);
            await submitForm(state, requestMethod).finally(() => {
                setLoading(false);
            });
        }
    }

    useEffect(() => {
        if (serialNumbersTransition) {
            const timeout = setTimeout(() => {
                setSerialNumbersTransition(false);
            }, 8000);
            return () => clearTimeout(timeout);
        }
    }, [serialNumbersTransition]);

    return (
        <>
            {alertMessage && (
                <CustomFadingAlert
                    message={alertMessage}
                    setAlertMessage={setAlertMessage}
                    status="error"
                />
            )}
            <div className="mb-4">
                <label className="form-label">serial_numbers*</label>
                <input
                    className={`form-input ${serialNumbersTransition ? 'form-input-error' : 'form-input-error-fade'}`}
                    id="serial_number"
                    type="text"
                    placeholder="serial_num_1,serial_num_2"
                    name="lookup_id"
                    value={state.serial_numbers.join(',')}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => addSerialNumber(e.target.value)}
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
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="button"
                >
                    Save
                </button>
            </div>
        </>
    );
};

export default CreatePlumeSensorPlatform;
