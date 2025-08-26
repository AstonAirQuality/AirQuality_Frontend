import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import handleChange from '../../SharedComponents/handleChange.ts';
import CustomFadingAlert from '../../../../SharedComponents/CustomFadingAlert.tsx';
import { RequestMethod } from '../FormContainer.tsx'
import ToolTip from '../../../../SharedComponents/ToolTip.tsx';



interface FormData {
    name: string;
    url: string;
    symbol: string;
}


interface UnitOfMeasurementProps {
    rowData: {
        name?: string;
        url?: string;
        symbol?: string;
    };
    setChanges: React.Dispatch<React.SetStateAction<boolean>>
    setMenuOpen: (open: string) => void
    submitForm: (requestBody: any, requestMethod: RequestMethod) => Promise<void>
    requestMethod: RequestMethod
}

const WriteUnitOfMeasurement: React.FC<UnitOfMeasurementProps> = ({
    rowData,
    setChanges,
    setMenuOpen,
    requestMethod,
    submitForm,
}) => {
    // Initialize form data with defaults or existing values
    const formData: FormData = {
        name: rowData?.name || '',
        url: rowData?.url || '',
        symbol: rowData?.symbol || '',
    }
    const [state, setState] = useState<FormData>(formData);
    const [alertMessage, setAlertMessage] = useState<string | [string, string] | ''>('');

    // custom transitions for form fields
    const [nameTransition, setNameTransition] = useState<boolean>(false);
    const [urlTransition, setUrlTransition] = useState<boolean>(false);
    const [symbolTransition, setSymbolTransition] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    function validateForm() {
        if (!state.name.trim()) {
            setAlertMessage('Name is required.');
            return false;
        }
        if (!state.url.trim()) {
            setAlertMessage('URL is required.');
            return false;
        }
        if (!state.symbol.trim()) {
            setAlertMessage('Symbol is required.');
            return false;
        }
        return true;
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (validateForm()) {
            setLoading(true);
            const submitState = {
              ...state,
            };
            await submitForm(submitState, requestMethod).finally(() => setLoading(false));
        }
    }

    useEffect(() => {
        if (nameTransition || urlTransition || symbolTransition) {
            const timeout = setTimeout(() => {
                setNameTransition(false);
                setUrlTransition(false);
                setSymbolTransition(false);
            }, 8000);
            return () => clearTimeout(timeout);
        }
    }, [nameTransition, urlTransition, symbolTransition]);

    return (
        <>  
            {/* Fixed alert at the top of the viewport */}
            {alertMessage && (
                <div className="form-container-error">
                    <CustomFadingAlert message={alertMessage} setAlertMessage={setAlertMessage} status="error" />
                </div>
            )}

            <div className="mb-4">
                <label className="form-label">Name*
                    <ToolTip
                        title="name"
                        message="The unique identifier for the unit of measure name. This is required."
                        items={{ name: '(str) e.g: "degree centigrade"' }}
                    />
                </label>
                <input
                    className={`form-input ${nameTransition ? 'form-input-error' : 'form-input-error-fade'}`}
                    id="name"
                    type="text"
                    name="name"
                    value={state.name? state.name : ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleChange(e, setChanges, setState, state, formData)
                    }
                />
            </div>

            <div className="mb-4">
                <label className="form-label">URL*
                    <ToolTip
                        title="url"
                        message="The URL for the unit of measure. This is required."
                        items={{ url: '(string) e.g: "http://example.com/units/1"' }}
                    />
                </label>
                <input
                    className={`form-input ${urlTransition ? 'form-input-error' : 'form-input-error-fade'}`}
                    id="url"
                    type="text"
                    name="url"
                    value={state.url? state.url : ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleChange(e, setChanges, setState, state, formData)
                    }
                />
            </div>

            <div className="mb-4">
                <label className="form-label">Symbol*
                    <ToolTip
                        title="symbol"
                        message="The symbol for the unit of measure. This is required."
                        items={{ symbol: '(string) e.g: "µg/m³"' }}
                    />
                </label>
                <input
                    className={`form-input ${symbolTransition ? 'form-input-error' : 'form-input-error-fade'}`}
                    id="symbol"
                    type="text"
                    name="symbol"
                    value={state.symbol? state.symbol : ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleChange(e, setChanges, setState, state, formData)
                    }
                />
            </div>

            {/* form buttons */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setMenuOpen('false')}
                    disabled={loading}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="button"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="button"
                >
                    Save
                </button>
            </div>
        </>

    )
}

export default WriteUnitOfMeasurement;