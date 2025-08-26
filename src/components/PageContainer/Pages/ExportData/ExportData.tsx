import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import CustomFadingAlert from '../SharedComponents/CustomFadingAlert.tsx';
import ToolTip from '../SharedComponents/ToolTip.tsx';
type ColumnsType = {
    [key: string]: boolean;
};

type ExportDataState = {
    start: string;
    end: string;
    measurement_data: ColumnsType;
    measurement_columns?: string;
    deserialize?: boolean;
    spatial_query_type: string;
    geom: string;
    sensor_ids: string[];
};

const sensorSummaryColumns = ["sensor_id", "measurement_count", "measurement_data", "stationary", "geom", "timestamp"];

const initialFormData: ExportDataState = {
    start: new Date().toISOString().slice(0, 10),
    end: new Date().toISOString().slice(0, 10),
    measurement_data: { "sensor_id": false, "measurement_count": false, "measurement_data": false, "stationary": false, "geom": false, "timestamp": false },
    measurement_columns: "",
    deserialize: false,
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
    const [sensorSummaryDataTransiton, setSensorSummaryDataTransiton] = useState(false);
    const [measurementColumnsTransition, setMeasurementColumnsTransition] = useState(false);
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
        for (const value of Object.values(state.measurement_data)) {
            if (value) {
                columnsSelected = true;
            }
        }
        if (!columnsSelected) {
            setAlertMessage(['Selecting at least one column is required', 'error']);
            setSensorSummaryDataTransiton(true);
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

        //validate measurementColumns if measurement_data is selected
        if (state.measurement_data["measurement_data"]) {
            if (state.measurement_columns) {
                // validate measurementColumns is comma separated values
                const measurementColumnsArray = state.measurement_columns.split(',').map(col => col.trim());
                if (measurementColumnsArray.length === 0 || measurementColumnsArray.some(col => col === '')) {
                    setAlertMessage(['measurement_columns must be a comma separated list of values', 'error']);
                    setMeasurementColumnsTransition(true);
                    return false;
                }
            }
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
        for (const [key, value] of Object.entries(state.measurement_data)) {
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
            setSensorSummaryDataTransiton(false);
            setSpatialQueryTypeTransition(false);
            setGeomTransition(false);
        }, 8000);
        return () => clearTimeout(timeout);
    }, [startDateTransition, endDateTransition, sensorSummaryDataTransiton, spatialQueryTypeTransition, geomTransition]);

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
        try {
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
        } catch (error) {
            setAlertMessage(["An error occurred while processing your request.", "error"]);
        }
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
                        <ToolTip 
                            title='The start date for the data export in DD/MM/YYY format.'
                            message='This is a required field.'
                            items={{ "start_date": '01/01/2025' }}
                        />
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
                        <ToolTip 
                            title='The end date for the data export in DD/MM/YYY format.'
                            message='This is a required field.'
                            items={{ "end_date": '01/02/2025' }}
                        />
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
                        <ToolTip 
                            title='The columns to include in the exported data.'
                            message='At least one column MUST be selected'
                            items={{ columns: sensorSummaryColumns.join(', ') }}
                        />
                    </label>
                    <div className={`form-group ${sensorSummaryDataTransiton ? 'form-input-error' : 'form-input-error-fade'}`}>
                        {sensorSummaryColumns.map((column, index) => (
                            <label className="form-label" key={index}>
                                <input
                                    className="form-checkbox"
                                    type="checkbox"
                                    name="measurement_data"
                                    value={column}
                                    checked={state.measurement_data[column]}
                                    onChange={handleChange}
                                />
                                <i className=""></i> {column}
                            </label>
                        ))}
                    </div>
                </div>

                {/* if measurement_data is selected then show the input for measurement_columns and allcolumns */}
                {state.measurement_data["measurement_data"] && (
                    <>
                        <div className="mb-4">
                            <label className="form-label">
                                measurement_columns (optional)
                                <ToolTip 
                                    title='The specific measurement columns to include in the exported data.'
                                    message='This can be left empty if you want all measurement data columns. If provided, it should be a comma-separated list of column names.'
                                    items={{ measurement_columns: 'e.g: "PM1,PM2.5,PM10"' }}
                                />
                            </label>
                            <input className={`form-input ${measurementColumnsTransition ? 'form-input-error' : 'form-input-error-fade'}`}
                                id="measurement_columns" type="text"
                                name="measurement_columns"
                                value={state.measurement_columns}
                                onChange={handleChange} />
                        </div>

                        {!state.measurement_columns &&(
                            <div className="mb-4">
                                <label className="form-label flex items-center gap-2">
                                    <input
                                        className="form-checkbox"
                                        type="checkbox"
                                        name="deserialize"
                                        checked={state.deserialize}
                                        onChange={(e) => {
                                            setState(prev => ({
                                                ...prev,
                                                deserialize: e.target.checked
                                            }));
                                        }}
                                    />
                                    <span>deserialize</span>
                                    <ToolTip 
                                        title='Deserialize: Only applicable when exporting all measurement data columns'
                                        message='If checked, the measurement data will be deserialized into individual columns for each measurement type.'
                                        items={{ deserialize: '(bool) e.g: true' }}
                                    />
                                </label>
                            </div>
                        )}
                    </>
                )}

                {/* spatial query inputs */}

                <div className="mb-4">
                    <label className="form-label">
                        spatial_query_type
                        <ToolTip 
                            title='The type of spatial query to perform.'
                            message='This is optional but if geom is provided then this is required.'
                            items={{ spatial_query_type: 'e.g: "within", "intersects", "contains", "overlaps"' }}
                        />
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
                        <ToolTip 
                            title='The geometry for the spatial query in WKT format.'
                            message='This is optional but if spatial_query_type is provided then this is required.'
                            items={{ geom: 'e.g: "POINT(-71.060316 48.432044)"' }}
                        />
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
                        <ToolTip 
                            title='A comma-separated list of sensor IDs to filter the data export.'
                            message='This is optional. If provided, only data from the specified sensors will be included in the export.'
                            items={{ sensor_ids: 'e.g: "1,2,3"' }}
                        />
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