import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import CustomFadingAlert from '../SharedComponents/CustomFadingAlert.tsx';

type ColumnsType = {
    [key: string]: boolean;
};

type ExportDataState = {
    start: string;
    end: string;
    columns: ColumnsType;
    spatial_query_type: string;
    geom: string;
    sensor_ids: string[];
};

const sensorSummaryColumns = ["sensor_id", "measurement_count", "measurement_data", "stationary", "geom", "timestamp"];

const initialFormData: ExportDataState = {
    start: new Date().toISOString().slice(0, 10),
    end: new Date().toISOString().slice(0, 10),
    columns: { "sensor_id": false, "measurement_count": false, "measurement_data": false, "stationary": false, "geom": false, "timestamp": false },
    spatial_query_type: "",
    geom: "",
    sensor_ids: [],
};

const ExportData = () => {
    const [state, setState] = useState<ExportDataState>(initialFormData);
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState<string | [string, string] | ''>('');
    const [startDateTransition, setStartDateTransition] = useState(false);
    const [endDateTransition, setEndDateTransition] = useState(false);
    const [columnsTransition, setColumnsTransition] = useState(false);
    const [spatialQueryTypeTransition, setSpatialQueryTypeTransition] = useState(false);
    const [geomTransition, setGeomTransition] = useState(false);
    const [output, setOutput] = useState<string>('');

    function validateForm() {
        if (!state.start || !state.end) {
            setAlertMessage(['Missing required fields', 'error']);
            if (!state.start) {
                setStartDateTransition(true);
                return false;
            }
            if (!state.end) {
                setEndDateTransition(true);
                return false;
            }
        }

        let columnsSelected = false;
        for (const value of Object.values(state.columns)) {
            if (value) {
                columnsSelected = true;
            }
        }
        if (!columnsSelected) {
            setAlertMessage(['Selecting at least one column is required', 'error']);
            setColumnsTransition(true);
            return false;
        }

        if (state.spatial_query_type && !state.geom) {
            setAlertMessage(['Missing required fields', 'error']);
            setGeomTransition(true);
            return false;
        } else if (!state.spatial_query_type && state.geom) {
            setAlertMessage(['Missing required fields', 'error']);
            setSpatialQueryTypeTransition(true);
            return false;
        }

        return true;
    }

    function formatData() {
        let stateCopy: any = { ...state };

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

        // format columns
        let formattedColumns: string[] = [];
        for (const [key, value] of Object.entries(state.columns)) {
            if (value) {
                formattedColumns.push(key);
            }
        }
        stateCopy.columns = formattedColumns;

        // remove empty values
        for (const [key, value] of Object.entries(stateCopy)) {
            if (
                value === "" ||
                value === null ||
                value === undefined ||
                value === false ||
                (Array.isArray(value) && value.length === 0)
            ) {
                delete stateCopy[key];
            }
        }

        return stateCopy;
    }

    useEffect(() => {
        const timeout = setTimeout(() => {
            setStartDateTransition(false);
            setEndDateTransition(false);
            setColumnsTransition(false);
            setSpatialQueryTypeTransition(false);
            setGeomTransition(false);
        }, 8000);
        return () => clearTimeout(timeout);
    }, [startDateTransition, endDateTransition, columnsTransition, spatialQueryTypeTransition, geomTransition]);

    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const target = e.target as HTMLInputElement | HTMLSelectElement;
        const { name, type, value } = target;
        if (type === "checkbox") {
            const checked = (target as HTMLInputElement).checked;
            setState(prev => ({
                ...prev,
                [name]: {
                    ...prev[name as keyof ExportDataState] as ColumnsType,
                    [value]: checked
                }
            }));
        } else if (name === "sensor_ids") {
            setState(prev => ({
                ...prev,
                sensor_ids: value.split(',').map(v => v.trim()).filter(Boolean)
            }));
        } else {
            setState(prev => ({
                ...prev,
                [name]: value
            }));
        }
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (validateForm()) {
            setLoading(true);
            await submitForm();
            setLoading(false);
        }
    }

    async function submitForm() {
        let requestURL = process.env.REACT_APP_AIRQUALITY_API_URL + "sensor-summary/as-json";
        const formatted = formatData();
        let firstParam = true;
        for (const [key, value] of Object.entries(formatted)) {
            if (key === "columns" && Array.isArray(value)) {
                for (const column of value) {
                    requestURL += `${firstParam ? '?' : '&'}columns=${encodeURIComponent(column)}`;
                    firstParam = false;
                }
            } else if (Array.isArray(value)) {
                for (const v of value) {
                    requestURL += `${firstParam ? '?' : '&'}${key}=${encodeURIComponent(v)}`;
                    firstParam = false;
                }
            } else {
                requestURL += `${firstParam ? '?' : '&'}${key}=${encodeURIComponent(String(value))}`;
                firstParam = false;
            }
        }

        setAlertMessage(["Processing your request. This may take a few seconds.", "info"]);

        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        await fetch(requestURL, requestOptions).then(
            async response => {
                if (response.status === 200) {
                    let data = await response.json();
                    if (data.length > 0) {
                        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
                            JSON.stringify(data)
                        )}`;
                        setAlertMessage(["The request was processed successfully, please click the download button below to download the data.", "success"]);
                        setOutput(jsonString);
                    } else {
                        setAlertMessage(["The request was processed successfully, but no data was returned.", "warning"]);
                    }
                } else {
                    setAlertMessage(["The request was unsuccessful. Please try again later.", "error"]);
                }
            }
        );
    }

    return (
        <div className="page">
            <form className='form-container'>
                {alertMessage && typeof alertMessage !== 'string' && (
                    <CustomFadingAlert message={alertMessage[0]} setAlertMessage={setAlertMessage} status={alertMessage[1]} />
                )}

                {/* date input */}
                <div className="mb-4">
                    <label className="form-label">
                        start date*
                    </label>
                    <input className={`form-input ${startDateTransition ? 'form-input-error' : 'form-input-error-fade'}`}
                        id="start" type="date"
                        name="start"
                        value={state.start}
                        onChange={handleChange} />
                </div>

                <div className="mb-4">
                    <label className="form-label">
                        end date*
                    </label>
                    <input className={`form-input ${endDateTransition ? 'form-input-error' : 'form-input-error-fade'}`}
                        id="end" type="date"
                        name="end"
                        value={state.end}
                        onChange={handleChange} />
                </div>

                <div className="mb-4">
                    <label className="form-label">
                        columns*
                    </label>
                    <div className="form-group">
                        {sensorSummaryColumns.map((column, index) => (
                            <label className="form-label" key={index}>
                                <input
                                    className="form-checkbox"
                                    type="checkbox"
                                    name="columns"
                                    value={column}
                                    checked={state.columns[column]}
                                    onChange={handleChange}
                                />
                                <i className=""></i> {column}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="mb-4">
                    <label className="form-label">
                        spatial_query_type
                    </label>
                    <select className={`form-select ${spatialQueryTypeTransition ? 'form-input-error' : 'form-input-error-fade'}`}
                        id="spatial_query_type"
                        name="spatial_query_type"
                        value={state.spatial_query_type}
                        onChange={handleChange}>
                        <option value="">Select spatial query type</option>
                        <option value="within">within</option>
                        <option value="intersects">intersects</option>
                        <option value="contains">contains</option>
                        <option value="overlaps">overlaps</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="form-label">
                        geom (WKT format)
                    </label>
                    <input className={`form-input ${geomTransition ? 'form-input-error' : 'form-input-error-fade'}`}
                        id="geom" type="text"
                        name="geom"
                        value={state.geom}
                        onChange={handleChange} />
                </div>

                <div className="mb-4">
                    <label className="form-label">
                        sensor_ids
                    </label>
                    <input className="form-input"
                        id="sensor_ids" type="text"
                        name="sensor_ids"
                        value={state.sensor_ids.join(',')}
                        onChange={handleChange} />
                </div>

                {/* form buttons */}
                <div className="flex items-center justify-between">
                    <button onClick={handleSubmit} disabled={loading} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                        Submit
                    </button>
                    {output ? (
                        <a href={output} download="export.json" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                            Download
                        </a>
                    ) : (
                        <button style={{ display: 'none' }}></button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ExportData;