import { useState, useEffect } from 'react';
import { UserAuth } from '../../../context/AuthContext';

export default function LogsPage() {

    const [Logs, setLogs] = useState(null);
    const [page, setPage] = useState(1); //pagination
    const [pageData, setPageData] = useState([]); //pagination
    const pageLength = 10; //pagination
    const [inputDate, setInputDate] = useState(new Date().toISOString().slice(0, 10));
    const { user } = UserAuth();

    function changePage(page) {
        if (page < 1 || page > Math.ceil(Logs?.length / pageLength)) {
            return;
        }
        setPage(page);
        setPageData(Logs?.slice((page - 1) * pageLength, page * pageLength));
    }

    async function handleSubmit(e, dateValue) {
        setInputDate(dateValue);
        if (e) {
            e.preventDefault();
        }
        await fetch(process.env.REACT_APP_AIRQUALITY_API_URL + `data-ingestion-logs/findByDate/${dateValue}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.access_token}`
            },
        }).then(response => response.json())
            .then((res) => {
                if (res !== null) {

                    // for each log in the array parse the JSON string to a JSON object
                    for (let i = 0; i < res.length; i++) {
                        res[i] = JSON.parse(res[i].data);
                    }
                    // for each timestamp, for each sensor_id, combine the JSON objects with the same timestamp
                    let data = {};
                    for (let i = 0; i < res.length; i++) {
                        for (const [key, value] of Object.entries(res[i])) {
                            if (data[key] === undefined) {
                                data[key] = value;
                            } else {
                                data[key] = { ...data[key], ...value };
                            }
                        }
                    }

                    // convert the JSON object to an array of JSON objects
                    // object format: {timestamp: {sensor_id: {serial_number: "serial_number", status: true, message: "success"}}}
                    // array format: [{timestamp: timestamp, sensor_id: sensor_id, serial_number: "serial_number", status: true, message: "success"}]
                    let array = [];
                    for (const [key, value] of Object.entries(data)) {
                        for (const [key2, value2] of Object.entries(value)) {
                            array.push({ timestamp: key, sensor_id: key2, serial_number: value2.serial_number, status: value2.status, message: value2.message });
                        }
                    }

                    // set the state to the array of JSON objects
                    setLogs(array);
                    setPageData(array.slice((page - 1) * pageLength, page * pageLength));
                    setPage(1);

                }
                else {
                    setLogs(null);
                }
            });
    }

    // get the logs of the current day by calling the handleSubmit function with the current date as parameter
    useEffect(() => {
        async function getLogs() {
            await handleSubmit('', inputDate);
        }
        getLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="page">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">

                <caption className="p-5 text-lg font-semibold text-left text-gray-900 bg-white dark:text-white dark:bg-gray-800">
                    <div className="flex justify-between items-center p-3 rounded-t border-b dark:border-gray-600">
                        <h1 className="text-xl font-semibold text-gray-500 dark:text-gray-400">View Sensor Data Logs</h1>
                    </div>

                    <div className="flex justify-between">
                        <p className="table-caption-text">
                            Here you can read the logs of the sensor data that has been sent to the server, by the daily cronjob.
                            Search for a specific date to view the logs of that day.
                        </p>
                        <form>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="date">Date</label>
                            {/* date picker with todays date as default value */}
                            <input className="date-picker-input" type="date" id="date" name="date"
                                defaultValue={inputDate}
                                onChange={(e) => handleSubmit(e, e.target.value)} />
                        </form>
                    </div>
                </caption>

                <thead className="text-xs text-gray-600 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th className="px-4 py-3">
                            <span className='flex flex-col items-center'>Date</span>
                        </th>

                        <th className="px-4 py-3">
                            <span className='flex flex-col items-center'>Sensor Id</span>
                        </th>

                        <th className="px-4 py-3">
                            <span className='flex flex-col items-center'>Sensor Serial Number</span>
                        </th>

                        <th className="px-4 py-3">
                            <span className='flex flex-col items-center'>Status</span>

                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
                    <TableRows pageData={pageData} />
                </tbody>
            </table>
            {/* pagination buttons */}
            <div className="flex flex-row-reverse ">
                <div className="flex flex-col justify-center items-center mr-4">
                    <label className="font-medium text-gray-900 dark:text-white mt-4">
                        {Logs?.length === 0 ? 'No Logs found for selected date' : `Page ${page} of ${Math.ceil(Logs?.length / pageLength)}`}
                    </label>

                    <div className="flex flex-row justify-start items-center">
                        <button onClick={() => changePage(1)} className="table-pagination-button">{'<<'}</button>
                        <button onClick={() => changePage(page - 1)} className="table-pagination-button">{'<'}</button>
                        <button onClick={() => changePage(page + 1)} className="table-pagination-button">{'>'}</button>
                        <button onClick={() => changePage(Math.ceil(Logs?.length / pageLength))} className="table-pagination-button">{'>>'}</button>
                    </div>
                </div>
            </div>
        </div>
    )
}


const TableRows = ({ pageData }) => {

    // format: timestamp, sensor_id, sensor_serial_number, status, message
    //{\"1664323200\": {\"6\": [\"02:00:00:00:48:45\", true, \"success\"]}

    if (pageData === null || pageData?.length === 0) {
        return (
            null
        )
    }

    const rows = []

    const statusBadge = (status, message) => {
        if (status === true) {
            return (
                <span className="success-badge">
                    Success
                </span>

            )
        }
        // if status is true but message is not success or message does not exist
        else if (status === true && message !== 'success') {
            return (
                <div className='flex flex-col items-center justify-start'>
                    <span className="warning-badge">
                        Success, with message:
                    </span>
                    <p> {message} </p>
                </div>
            )
        }
        else {
            return (
                <div className='flex flex-col items-center justify-start'>
                    <span className="error-badge">
                        Failed
                    </span>
                    <p> {message} </p>
                </div>
            )
        }
    }


    for (const [key, value] of Object.entries(pageData)) {
        rows.push(
            <tr key={key}>
                <td className="px-4 py-3">
                    {/* JavaScript works in milliseconds, so convert the UNIX timestamp from seconds to milliseconds. */}
                    <span className="font-semibold flex flex-col items-center">{new Date(value.timestamp * 1000).toLocaleString()}</span>
                </td>
                <td className="px-4 py-3 text-sm">
                    <span className="flex flex-col items-center">{value.sensor_id}</span>
                </td>

                <td className="px-4 py-3 text-sm">
                    <span className="flex flex-col items-center">{value.serial_number}</span>
                </td>

                <td className="px-4 py-3 text-sm">
                    <span className="flex flex-col items-center">{statusBadge(value.status, value.message)}</span>
                </td>
            </tr>
        )

    }

    return rows;
}


