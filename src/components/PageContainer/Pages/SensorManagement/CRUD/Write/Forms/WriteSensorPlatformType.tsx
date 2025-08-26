import React, { useState, useEffect, FormEvent, ChangeEvent, use } from 'react';
import handleChange from '../../SharedComponents/handleChange.ts';
import CustomFadingAlert from '../../../../SharedComponents/CustomFadingAlert.tsx';
import SemanticEnricher from './SemanticEnricher.tsx';
import { RequestMethod } from '../FormContainer'

interface SensorPlatformTypeProps {
    rowData: {
        name?: string;
        description?: string;
        sensor_metadata?: Record<string, unknown> | string;
    };
    setChanges: React.Dispatch<React.SetStateAction<boolean>>
    setMenuOpen: (open: string) => void
    submitForm: (requestBody: any, requestMethod: RequestMethod) => Promise<void>
    requestMethod: RequestMethod
}

interface FormData {
    name: string;
    description: string;
    sensor_metadata: string;
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
        sensor_metadata: rowData.sensor_metadata
            ? typeof rowData.sensor_metadata === 'string'
                ? rowData.sensor_metadata
                : JSON.stringify(rowData.sensor_metadata)
            : '',
    };

    const [state, setState] = useState<FormData>(formData);
    const [alertMessage, setAlertMessage] = useState<string | [string, string] | ''>('');
    const [nameTransition, setNameTransition] = useState<boolean>(false);
    const [descriptionTransition, setDescriptionTransition] = useState<boolean>(false);
    const [sensorMetadataTransition, setsensorMetadataTransition] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [useCSWAnnotator, setUseCSWAnnotator] = useState<boolean>(false);

    function validateForm(): boolean {
        if (!state.name || !state.description || !state.sensor_metadata) {
            setAlertMessage('Missing required fields');
            if (!state.name) setNameTransition(true);
            if (!state.description) setDescriptionTransition(true);
            if (!state.sensor_metadata) setsensorMetadataTransition(true);
            return false;
        }

        try {
            JSON.parse(state.sensor_metadata);
        } catch (e) {
            setAlertMessage('Invalid JSON format');
            setsensorMetadataTransition(true);
            return false;
        }

        return true;
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        if (validateForm()) {
            setLoading(true);
            // Parse sensor_metadata before submit
            const submitState = {
                ...state,
                sensor_metadata: JSON.parse(state.sensor_metadata),
            };
            await submitForm(submitState, requestMethod).finally(() => setLoading(false));
        }
    }

    useEffect(() => {
        if (nameTransition || descriptionTransition || sensorMetadataTransition) {
            const timeout = setTimeout(() => {
                setNameTransition(false);
                setDescriptionTransition(false);
                setsensorMetadataTransition(false);
            }, 8000);
            return () => clearTimeout(timeout);
        }
    }, [nameTransition, descriptionTransition, sensorMetadataTransition]);

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
            
            <button
                onClick={() => setUseCSWAnnotator(!useCSWAnnotator)}
                className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
            >
                {useCSWAnnotator ? 'Use Plain JSON Editor' : 'Use CSVW Annotator'}
            </button>
            <div className="mb-4">
                <label className="form-label">sensor_metadata*</label>
                {
                    useCSWAnnotator ? (
                        <div className={`h-fit ${sensorMetadataTransition ? 'form-input-error' : 'form-input-error-fade'}`}>
                            <SemanticEnricher
                            inputJson={JSON.parse(state.sensor_metadata || '{}')}
                            setState={setState}
                            state={state}
                            />
                        </div>
                    ) :
                    <textarea
                        className={`form-input h-96 ${sensorMetadataTransition ? 'form-input-error' : 'form-input-error-fade'}`}
                        id="sensor_metadata"
                        name="sensor_metadata"
                        value={
                            (() => {
                                try {
                                    // Pretty print JSON if valid, else show as is
                                    return state.sensor_metadata
                                        ? JSON.stringify(JSON.parse(state.sensor_metadata), null, 2)
                                        : '';
                                } catch {
                                    return state.sensor_metadata;
                                }
                            })()
                        }
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                            handleChange(e, setChanges, setState, state, formData)
                        }
                    />
                }
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