import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import handleChange from '../../SharedComponents/handleChange.ts';
import CustomFadingAlert from '../../../../SharedComponents/CustomFadingAlert.tsx';
import { RequestMethod } from '../FormContainer'
import ToolTip from '../../../../SharedComponents/ToolTip.tsx';

interface datetime_params {
    format: string;
    start_key: string;
    end_key: string;
}

type url_params = {
    // only datetime params is allowed to be nested
    datetime_params: datetime_params;
} & {
    // other params can be any string key with string value
    [key: string]: string;
};

interface api_method {
    auth_type: "url_token" | "header";
    token_key: string;
    api_key_value: string;
    url_params: url_params;
}

interface authentication_method {
    url_params: Record<string, string>;
    body: Record<string, string>; // e.g "username": "user", "password": "pass"}
    data: Record<string, string>; // e.g., {"grant_type": "client_credentials"} 
    headers: Record<string, string>; //  e.g., {"Authorization": f"Bearer {self.api_key}"}
}

interface SensorPlatformConfigProps {
    rowData: {
        sensor_type_id?: number;
        authentication_url?: string;
        authentication_method?: Record<string, unknown> | string;
        api_url?: string;
        api_method?: Record<string, unknown> | string;
        sensor_mappings?: Record<string, string>; // e.g., {"ParticulateMatter2.5": "PM2.5"}

    };
    setChanges: React.Dispatch<React.SetStateAction<boolean>>
    setMenuOpen: (open: string) => void
    submitForm: (requestBody: any, requestMethod: RequestMethod) => Promise<void>
    requestMethod: RequestMethod
}

interface FormData {
    sensor_type_id?: number | null;
    authentication_url: string;
    authentication_method: authentication_method;
    api_url: string;
    api_method: api_method;
    sensor_mappings?: Record<string, string>; // e.g., {"ParticulateMatter2.5": "PM2.5"}
}

interface ObservableProperty {
    name: string;
    url: string;
    description: string;
    datatype: string;
}



const WriteSensorPlatformType: React.FC<SensorPlatformConfigProps> = ({
    rowData,
    setChanges,
    setMenuOpen,
    requestMethod,
    submitForm,
}) => {
    // Initialize form data with defaults or existing values
    const formData: FormData = {
        sensor_type_id: rowData.sensor_type_id ? rowData.sensor_type_id : null,
        authentication_url: rowData.authentication_url ? rowData.authentication_url : '',
        authentication_method: rowData.authentication_method
            ? typeof rowData.authentication_method === 'string'
                ? JSON.parse(rowData.authentication_method)
                : rowData.authentication_method
            : {
                url_params: {},
                body: {},
                data: {},
                headers: {}
            },
        api_url: rowData.api_url ? rowData.api_url : '',
        api_method: rowData.api_method
            ? typeof rowData.api_method === 'string'
                ? JSON.parse(rowData.api_method)
                : rowData.api_method
            : {
                auth_type: "url_token",
                token_key: "",
                api_key_value: "",
                url_params: { datetime_params: { format: "", start_key: "", end_key: "" } }
            },
        sensor_mappings: rowData.sensor_mappings ? rowData.sensor_mappings : {},
    };

    const [state, setState] = useState<FormData>(formData);
    console.log('WriteSensorPlatformType state:', state);
    const [alertMessage, setAlertMessage] = useState<string | [string, string] | ''>('');

    // custom transitions for form fields
    const [sensorTypeTransition, setSensorTypeTransition] = useState<boolean>(false);
    const [authenticationUrlTransition, setAuthenticationUrlTransition] = useState<boolean>(false);
    const [authenticationMethodTransition, setAuthenticationMethodTransition] = useState<boolean>(false);
    const [apiUrlTransition, setApiUrlTransition] = useState<boolean>(false);
    const [apiMethodTransition, setApiMethodTransition] = useState<boolean>(false);
    const [ObservableProperties, setObservableProperties] = useState<ObservableProperty[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    function validateForm(): boolean {

        // Check if required fields are filled
        if (!state.sensor_type_id || !state.api_url || !state.api_method) {
            setAlertMessage('Missing required fields');
            if (!state.sensor_type_id) setSensorTypeTransition(true);
            if (!state.api_url) setApiUrlTransition(true);
            if (!state.api_method) setApiMethodTransition(true);
            return false;
        }

        
        // parse authentication method to ensure it is a valid JSON
        try {
            JSON.parse(JSON.stringify(state.authentication_method));
        } catch (e) {
            setAlertMessage('Invalid JSON format');
            setAuthenticationMethodTransition(true);
            return false;
        }
        
        // parse api method to ensure it is a valid JSON
        try {
            JSON.parse(JSON.stringify(state.api_method));
        } catch (e) {
            setAlertMessage('Invalid API method JSON format');
            setApiMethodTransition(true);
            return false;
        }

        // // api_method should have datetime_params check that it matches the expected format
        // // Ensure api_method is an object
        // let apiMethodObj: any = state.api_method;
        // if (typeof apiMethodObj === 'string') {
        //     try {
        //     apiMethodObj = JSON.parse(apiMethodObj);
        //     } catch {
        //     setAlertMessage('api_method is not valid JSON');
        //     setApiMethodTransition(true);
        //     return false;
        //     }
        // }

        // // Validate datetime_params inside url_params
        // if (
        //     !apiMethodObj.url_params ||
        //     !apiMethodObj.url_params.datetime_params ||
        //     typeof apiMethodObj.url_params.datetime_params !== 'object'
        // ) {
        //     setAlertMessage('api_method.url_params.datetime_params is required and must be an object');
        //     setApiMethodTransition(true);
        //     return false;
        // }

        // const { format, start_key, end_key } = apiMethodObj.url_params.datetime_params;
        // if (!format || !start_key || !end_key) {
        //     setAlertMessage('datetime_params must include format, start_key, and end_key');
        //     setApiMethodTransition(true);
        //     return false;
        // }

        return true;
    }

    async function fetchAllObservableProperties() {
        let data: ObservableProperty[] | null = JSON.parse(window.sessionStorage.getItem('observable-property') || 'null');
        if (!data) {
            await fetch(process.env.REACT_APP_AIRQUALITY_API_URL + `observable-property`)
                .then((response) => response.json())
                .then((data: Object) => {
                    window.sessionStorage.setItem('observable-property', JSON.stringify(data));
                });
        }
        // set the ObservableProperties state
        data = JSON.parse(window.sessionStorage.getItem('observable-property') || '[]');
        setObservableProperties(data || []);
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (validateForm()) {
            setLoading(true);
            // Parse properties before submit
            const submitState = {
                sensor_type_id: state.sensor_type_id ? parseInt(String(state.sensor_type_id)) : null,
                authentication_url: state.authentication_url ? state.authentication_url : null,
                authentication_method: state.authentication_method ? JSON.parse(state.authentication_method as unknown as string) as authentication_method : null,
                api_url: state.api_url,
                api_method: JSON.parse(state.api_method as unknown as string) as api_method,
                sensor_mappings: state.sensor_mappings
            };
            await submitForm(submitState, requestMethod).finally(() => setLoading(false));
        }
    }

    useEffect(() => {
        fetchAllObservableProperties();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (sensorTypeTransition || authenticationUrlTransition || authenticationMethodTransition || apiUrlTransition || apiMethodTransition) {
            const timeout = setTimeout(() => {
                setSensorTypeTransition(false);
                setAuthenticationUrlTransition(false);
                setAuthenticationMethodTransition(false);
                setApiUrlTransition(false);
                setApiMethodTransition(false);
            }, 8000);
            return () => clearTimeout(timeout);
        }
    }, [sensorTypeTransition, authenticationUrlTransition, authenticationMethodTransition, apiUrlTransition, apiMethodTransition]);

    return (
        <>  
            {/* Fixed alert at the top of the viewport */}
            {alertMessage && (
                <div className="form-container-error">
                    <CustomFadingAlert message={alertMessage} setAlertMessage={setAlertMessage} status="error" />
                </div>
            )}
            <div className="mb-4">
                <label className="form-label">Sensor type id*
                    <ToolTip
                        title="sensor_type_id"
                        message="The unique identifier for the sensor type. This is required."
                        items={{ sensor_type_id: '(int) e.g: "1"' }}
                    />
                </label>
                <input
                    className={`form-input ${sensorTypeTransition ? 'form-input-error' : 'form-input-error-fade'}`}
                    id="sensor_type_id"
                    type="text"
                    name="sensor_type_id"
                    value={state.sensor_type_id? state.sensor_type_id : ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleChange(e, setChanges, setState, state, formData)
                    }
                />
            </div>

            <div className="mb-6">
                <label className="form-label">authentication_url
                <ToolTip
                    title="authentication_url"
                    message="The URL to authenticate the sensor platform. This is optional but required for platforms that require authentication."
                    items={{ authentication_url: '(string|null) e.g: "https://auth.example.com"' }}
                />
                </label>
               
                <input
                    className={`form-input ${authenticationUrlTransition ? 'form-input-error' : 'form-input-error-fade'}`}
                    id="authentication_url"
                    type="text"
                    name="authentication_url"
                    value={state.authentication_url}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleChange(e, setChanges, setState, state, formData)
                    }
                />
            </div>

            <div className="mb-4">
                <label className="form-label">authentication_method
                    <ToolTip
                        title="authentication_method"
                        message="The authentication method should be null or a JSON object or with the following structure:"
                        items={{
                            url_params: '(object|null) e.g: {"param1": "value1", "param2": "value2"}',
                            body: '(object|null) e.g: {"username": "user", "password": "pass"}',
                            data: '(object|null) e.g: {"grant_type": "client_credentials"}',
                            headers: '(object|null) e.g: {"Authorization": "Bearer token"}'
                        }}
                    />
                </label>
                <textarea
                    className={`form-input h-96 ${authenticationMethodTransition ? 'form-input-error' : 'form-input-error-fade'}`}
                    id="authentication_method"
                    name="authentication_method"
                    value={
                        (() => {
                            try {
                                if (!state.authentication_method) return '';
                                if (typeof state.authentication_method === 'string') {
                                    // Parse and pretty-print if it's a string
                                    return JSON.stringify(JSON.parse(state.authentication_method), null, 2);
                                }
                                // Pretty-print if it's already an object
                                return JSON.stringify(state.authentication_method, null, 2);
                            } catch {
                                // Fallback: show as-is
                                return String(state.authentication_method);
                            }
                        })()
                    }
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                        handleChange(e, setChanges, setState, state, formData)
                    }
                />
            </div>

            <div className="mb-4">
                <label className="form-label">api_url*
                    <ToolTip
                        title="api_url"
                        message="The REST endpoint to retrieve measurement data. DO NOT include URL parameters."
                        items={{ api_url: '(string) e.g: "https://api.example.com/data"' }}
                    />
                </label>
                <input
                    className={`form-input ${apiUrlTransition ? 'form-input-error' : 'form-input-error-fade'}`}
                    id="api_url"
                    type="text"
                    name="api_url"
                    value={state.api_url}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleChange(e, setChanges, setState, state, formData)
                    }
                />
            </div>

            <div className="mb-6 relative group">
                <label className="form-label flex items-center">
                    api_method*
                    <ToolTip
                        title="api_method"
                        message="The api_method should be a JSON object with the following structure:"
                        items={{
                            auth_type: '(string) ONLY "url_token" or "header"',
                            token_key: '(string) which is the name of the token in the URL or header',
                            api_key_value: '(string) the value of the api key/token',
                            url_params: '(object) with datetime_params (format, start_key, end_key)',
                            datetime_params_format: '(string) the format of the datetime, e.g., "timestamp" or "%Y-%m-%dT%H:%M:%S.%f+00:00"',
                            datetime_params_start_key: '(string) the key for the start datetime in the URL params',
                            datetime_params_end_key: '(string) the key for the end datetime in the URL params',
                        }}
                    />
                </label>
                <textarea
                    className={`form-input h-96 ${apiMethodTransition ? 'form-input-error' : 'form-input-error-fade'}`}
                    id="api_method"
                    name="api_method"
                    value={
                        (() => {
                            try {
                                if (!state.api_method) return '';
                                if (typeof state.api_method === 'string') {
                                    // Parse and pretty-print if it's a string
                                    return JSON.stringify(JSON.parse(state.api_method), null, 2);
                                }
                                // Pretty-print if it's already an object
                                return JSON.stringify(state.api_method, null, 2);
                            } catch {
                                // Fallback: show as-is
                                return String(state.api_method);
                            }
                        })()
                    }
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                        handleChange(e, setChanges, setState, state, formData)
                    }
                />
            </div>

            <div className="mb-6">
                <label className="form-label">Sensor Mapping*
                    <ToolTip
                        title="sensor_mappings"
                        message="Map sensor platform properties to Air Quality properties."
                        items={{ sensor_mappings: '(object) e.g: {"ParticulateMatter2.5": "PM2.5"}' }}
                    />
                </label>

                <div className="space-y-2">
                    {state.sensor_mappings && Object.keys(state.sensor_mappings).length > 0 ? (
                        Object.entries(state.sensor_mappings).map(([key, value], idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                                <input
                                    className="form-input flex-1"
                                    type="text"
                                    placeholder="platform property"
                                    value={key}
                                    onChange={e => {
                                        const newMapping = { ...state.sensor_mappings };
                                        const val = newMapping[key];
                                        delete newMapping[key];
                                        newMapping[e.target.value] = val;
                                        setState({ ...state, sensor_mappings: newMapping });
                                        setChanges(true);
                                    }}
                                />
                                <span className="mx-1">→</span>
                                {/* Searchable dropdown for observable property */}
                                <div className="relative flex-1">
                                    <input
                                        className="form-input w-full"
                                        type="text"
                                        placeholder="Search observable property"
                                        value={value}
                                        onChange={e => {
                                            setState({
                                                ...state,
                                                sensor_mappings: {
                                                    ...state.sensor_mappings,
                                                    [key]: e.target.value,
                                                },
                                            });
                                            setChanges(true);
                                        }}
                                        list={`observable-options-${idx}`}
                                    />
                                    <datalist id={`observable-options-${idx}`}>
                                        {ObservableProperties
                                            .filter(
                                                prop =>
                                                    !value ||
                                                    prop.name
                                                        .toLowerCase()
                                                        .includes(value.toLowerCase())
                                            )
                                            .map((prop, i) => (
                                                <option key={i} value={prop.name}>
                                                    {prop.name}
                                                </option>
                                            ))}
                                    </datalist>
                                </div>
                                <button
                                    type="button"
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => {
                                        const newMapping = { ...state.sensor_mappings };
                                        delete newMapping[key];
                                        setState({ ...state, sensor_mappings: newMapping });
                                        setChanges(true);
                                    }}
                                    aria-label="Remove mapping"
                                >
                                    ✕
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-400">No mappings yet. Click &quot;+ Add Mapping&quot; to add one.</div>
                    )}
                    <button
                        type="button"
                        className="mt-2 bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded"
                        onClick={() => {
                            setState({
                                ...state,
                                sensor_mappings: {
                                    ...state.sensor_mappings,
                                    "": "",
                                },
                            });
                            setChanges(true);
                        }}
                    >
                        + Add Mapping
                    </button>
                </div>
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