import { useState, useEffect } from 'react';
import CustomFadingAlert from '../SharedComponents/CustomFadingAlert';

const ExportData = () => {
    const formData = {
        // date fomatted as dd-mm-yyyy
        start: new Date().toISOString().slice(0, 10),
        end: new Date().toISOString().slice(0, 10),
        columns: { "sensor_id": false, "measurement_count": false, "measurement_data": false, "stationary": false, "geom": false, "timestamp": false },
        spatial_query_type: "", // within, intersects, contains, overlaps
        geom: "", // POINT(0 0) is the default value
        sensor_ids: [],
    }

    const sensorSummaryColumns = ["sensor_id", "measurement_count", "measurement_data", "stationary", "geom", "timestamp"];

    const [state, setState] = useState(formData);
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [startDateTransition, setStartDateTransition] = useState(false);
    const [endDateTransition, setEndDateTransition] = useState(false);
    const [columnsTransition, setColumnsTransition] = useState(false);
    const [spatialQueryTypeTransition, setSpatialQueryTypeTransition] = useState(false);
    const [geomTransition, setGeomTransition] = useState(false);

    const [output, setOutput] = useState('');

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

        //if no columns are selected then return false
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


        //XAND: if spatial_query_type is not empty then geom must be not empty
        if (state.spatial_query_type && !state.geom) {
            setAlertMessage(['Missing required fields', 'error']);
            setGeomTransition(true);
            return false;
        }
        else if (!state.spatial_query_type && state.geom) {
            setAlertMessage(['Missing required fields', 'error']);
            setSpatialQueryTypeTransition(true);
            return false;
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

        //format columns
        let formattedColumns = [];
        for (const [key, value] of Object.entries(state.columns)) {
            if (value) {
                formattedColumns.push(key);
            }
        }
        stateCopy.columns = formattedColumns;


        // remove empty values
        for (const [key, value] of Object.entries(state)) {
            if (value === "" || value === null || value === undefined || value === false || value.length === 0) {
                delete stateCopy[key];
            }
        }

        return stateCopy;

    }
    useEffect(() => {
        setTimeout(() => {
            setStartDateTransition(false);
            setEndDateTransition(false);
            setColumnsTransition(false);
            setSpatialQueryTypeTransition(false);
            setGeomTransition(false);
        }, 8000); //8 seconds
    }, [startDateTransition, endDateTransition, columnsTransition, spatialQueryTypeTransition, geomTransition])


    function handleChange(e, state) {

        const checkboxInput = (e.target.type === "checkbox") ? true : false;
        const value = checkboxInput ? e.target.checked : e.target.value;

        //if checkbox then set dictionary value to true or false
        if (checkboxInput) {
            setState({ ...state, [e.target.name]: { ...state[e.target.name], [e.target.value]: value } });
        }
        else {
            setState({ ...state, [e.target.name]: value });

        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (validateForm()) {
            setLoading(true);
            await submitForm();
            console.log(output);
        }

        setLoading(false);



    }

    async function submitForm() {

        // append the state data to the requestURL as query parameters
        let requestURL = process.env.REACT_APP_AIRQUALITY_API_URL + "sensor-summary";
        for (const [key, value] of Object.entries(formatData())) {
            if (key === "start") {
                requestURL += `?${key}=${value}`;
            }
            else if (key === "columns") {
                for (const column of value) {
                    requestURL += `&columns=${column}`;
                }
            }
            else {
                requestURL += `&${key}=${value}`;
            }
        }

        setAlertMessage(["Processing your request. This may take a few seconds.", "info"])

        //CustomFadingAlert("form-info-alert","Please wait! ","Submitting your request. This may take a few seconds.")
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
                        const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
                            JSON.stringify(data)
                        )}`;
                        setAlertMessage(["The request was processed successfully, please click the download button below to download the data.", "success"]);
                        setOutput(jsonString);
                    }
                    else {
                        setAlertMessage(["The request was processed successfully, but no data was returned.", "warning"]);
                    }

                    return;
                }
                else {
                    setAlertMessage(["The request was unsuccessful. Please try again later.", "error"]);
                    return;
                }
            })

    }


    return (
        <div className="page">
            <form className='form-container'>
                {alertMessage && <CustomFadingAlert message={alertMessage[0]} setAlertMessage={setAlertMessage} status={alertMessage[1]} />}

                {/* date input */}

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
                        columns*
                    </label>
                    <div className="form-group">
                        {sensorSummaryColumns.map((column, index) => {
                            return (
                                <label className="form-label" key={index}>
                                    <input className="form-checkbox" type="checkbox" name="columns" value={column} onChange={(e) => handleChange(e, state)} />
                                    <i className=""></i> {column}
                                </label>
                            )
                        })}
                    </div>
                </div>

                <div className="mb-4">
                    <label className="form-label">
                        spatial_query_type
                    </label>

                    <select className={`form-select ${spatialQueryTypeTransition ? 'form-input-error' : 'form-input-error-fade'}`}
                        id="spatial_query_type" type="text"
                        name="spatial_query_type"
                        value={state.spatial_query_type}
                        onChange={(e) => handleChange(e, state)}>
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
                        onChange={(e) => handleChange(e, state)} />
                </div>

                <div className="mb-4">
                    <label className="form-label">
                        sensor_ids
                    </label>
                    <input className="form-input"
                        id="sensor_ids" type="text"
                        name="sensor_ids"
                        value={state.sensor_ids}
                        onChange={(e) => handleChange(e, state)} />
                </div>


                {/* form buttons */}
                <div className="flex items-center justify-between">
                    {
                        output ?
                        <a href={output} download="export.json" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                            Download
                        </a>
                        :
                        <button></button>
                    }
                    <button onClick={handleSubmit} disabled={loading} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                        Submit
                    </button>
                </div>
            </form>

        </div>
    )
}


export default ExportData