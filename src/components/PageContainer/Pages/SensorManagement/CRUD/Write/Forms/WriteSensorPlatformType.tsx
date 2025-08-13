import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import handleChange from '../../SharedComponents/handleChange.ts';
import CustomFadingAlert from '../../../../SharedComponents/CustomFadingAlert.tsx';
import { RequestMethod } from '../FormContainer'

interface SensorPlatformTypeProps {
    rowData: {
        name?: string;
        description?: string;
        properties?: Record<string, unknown> | string;
    };
    setChanges: React.Dispatch<React.SetStateAction<boolean>>
    setMenuOpen: (open: string) => void
    submitForm: (requestBody: any, requestMethod: RequestMethod) => Promise<void>
    requestMethod: RequestMethod
}

interface FormData {
    name: string;
    description: string;
    properties: string;
}


const WriteSensorPlatformType: React.FC<SensorPlatformTypeProps> = ({
    rowData,
    setChanges,
    setMenuOpen,
    requestMethod,
    submitForm,
}) => {
    const formData: FormData = {
        name: rowData.name ? rowData.name : '',
        description: rowData.description ? rowData.description : '',
        properties: rowData.properties
            ? typeof rowData.properties === 'string'
                ? rowData.properties
                : JSON.stringify(rowData.properties)
            : '',
    };

    const [state, setState] = useState<FormData>(formData);
    const [alertMessage, setAlertMessage] = useState<string | [string, string] | ''>('');
    const [nameTransition, setNameTransition] = useState<boolean>(false);
    const [descriptionTransition, setDescriptionTransition] = useState<boolean>(false);
    const [propertiesTransition, setPropertiesTransition] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    function validateForm(): boolean {
        if (!state.name || !state.description || !state.properties) {
            setAlertMessage('Missing required fields');
            if (!state.name) setNameTransition(true);
            if (!state.description) setDescriptionTransition(true);
            if (!state.properties) setPropertiesTransition(true);
            return false;
        }

        try {
            JSON.parse(state.properties);
        } catch (e) {
            setAlertMessage('Invalid JSON format');
            setPropertiesTransition(true);
            return false;
        }

        return true;
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        if (validateForm()) {
            setLoading(true);
            // Parse properties before submit
            const submitState = {
                ...state,
                properties: JSON.parse(state.properties),
            };
            await submitForm(submitState, requestMethod).finally(() => setLoading(false));
        }
    }

    useEffect(() => {
        if (nameTransition || descriptionTransition || propertiesTransition) {
            const timeout = setTimeout(() => {
                setNameTransition(false);
                setDescriptionTransition(false);
                setPropertiesTransition(false);
            }, 8000);
            return () => clearTimeout(timeout);
        }
    }, [nameTransition, descriptionTransition, propertiesTransition]);

    return (
        <>
            {alertMessage && (
                <CustomFadingAlert message={alertMessage} setAlertMessage={setAlertMessage} status="error" />
            )}
            <div className="mb-4">
                <label className="form-label">Name*</label>
                <input
                    className={`form-input ${nameTransition ? 'form-input-error' : 'form-input-error-fade'}`}
                    id="name"
                    type="text"
                    name="name"
                    value={state.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleChange(e, setChanges, setState, state, formData)
                    }
                />
            </div>

            <div className="mb-6">
                <label className="form-label">Description*</label>
                <textarea
                    className={`form-input h-96 ${descriptionTransition ? 'form-input-error' : 'form-input-error-fade'}`}
                    id="description"
                    name="description"
                    value={state.description}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                        handleChange(e, setChanges, setState, state, formData)
                    }
                />
            </div>

            <div className="mb-4">
                <label className="form-label">Properties*</label>
                <textarea
                    className={`form-input h-96 ${propertiesTransition ? 'form-input-error' : 'form-input-error-fade'}`}
                    id="properties"
                    name="properties"
                    value={state.properties}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
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
    );
};

export default WriteSensorPlatformType;