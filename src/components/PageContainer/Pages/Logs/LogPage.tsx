import { useState, useEffect, FormEvent } from 'react';
import { UserAuth } from '../../../context/AuthContext.tsx';

interface LogEntry {
    timestamp: number;
    sensor_id: string;
    serial_number: string;
    status: boolean;
    message: string;
}

interface TableRowsProps {
    pageData: LogEntry[];
}

export default function LogsPage() {
    const [Logs, setLogs] = useState<LogEntry[] | null>(null);
    const [page, setPage] = useState<number>(1);
    const [pageData, setPageData] = useState<LogEntry[]>([]);
    const pageLength = 10;
    const [inputDate, setInputDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const { user } = UserAuth() || {};

    function changePage(newPage: number) {
        if (!Logs) return;
        if (newPage < 1 || newPage > Math.ceil(Logs.length / pageLength)) {
            return;
        }
        setPage(newPage);
        setPageData(Logs.slice((newPage - 1) * pageLength, newPage * pageLength));
    }

    async function handleSubmit(e: FormEvent | string, dateValue?: string) {
        let date = typeof e === 'string' ? e : dateValue!;
        if (typeof e !== 'string' && e) {
            e.preventDefault();
        }
        setInputDate(date);

        const response = await fetch(
            process.env.REACT_APP_AIRQUALITY_API_URL + `data-ingestion-logs/findByDate/${date}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.access_token}`
                },
            }
        );
        const res = await response.json();

        if (res !== null) {
            for (let i = 0; i < res.length; i++) {
                res[i] = JSON.parse(res[i].data);
            }
            let data: Record<string, Record<string, any>> = {};
            for (let i = 0; i < res.length; i++) {
                for (const [key, value] of Object.entries(res[i])) {
                    if (data[key] === undefined) {
                        data[key] = typeof value === 'object' && value !== null ? value as Record<string, any> : {};
                    } else if (typeof data[key] === 'object' && data[key] !== null && typeof value === 'object' && value !== null) {
                        data[key] = { ...data[key], ...value };
                    }
                }
            }
            let array: LogEntry[] = [];
            for (const [key, value] of Object.entries(data)) {
                for (const [key2, value2] of Object.entries(value)) {
                    array.push({
                        timestamp: Number(key),
                        sensor_id: key2,
                        serial_number: value2.serial_number,
                        status: value2.status,
                        message: value2.message
                    });
                }
            }
            setLogs(array);
            setPageData(array.slice(0, pageLength));
            setPage(1);
        } else {
            setLogs(null);
        }
    }

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
                        <form className="flex items-center space-x-2" onSubmit={handleSubmit}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="date">Date</label>
                            <input
                                className="date-picker-input"
                                type="date"
                                id="date"
                                name="date"
                                defaultValue={inputDate}
                                onChange={(e) => handleSubmit(e, e.target.value)}
                            />
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
            <div className="flex flex-row-reverse ">
                <div className="flex flex-col justify-center items-center mr-4">
                    <label className="font-medium text-gray-900 dark:text-white mt-4">
                        {Logs?.length === 0 ? 'No Logs found for selected date' : `Page ${page} of ${Math.ceil((Logs?.length || 0) / pageLength)}`}
                    </label>
                    <div className="flex flex-row justify-start items-center">
                        <button onClick={() => changePage(1)} className="table-pagination-button">{'<<'}</button>
                        <button onClick={() => changePage(page - 1)} className="table-pagination-button">{'<'}</button>
                        <button onClick={() => changePage(page + 1)} className="table-pagination-button">{'>'}</button>
                        <button onClick={() => changePage(Math.ceil((Logs?.length || 0) / pageLength))} className="table-pagination-button">{'>>'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const TableRows = ({ pageData }: TableRowsProps) => {
    if (!pageData || pageData.length === 0) {
        return null;
    }

    const statusBadge = (status: boolean, message: string) => {
        if (status === true && (message === 'success' || message === undefined || message === null)) {
            return (
                <span className="success-badge">
                    Success
                </span>
            );
        } else if (status === true && message !== 'success') {
            return (
                <div className='flex flex-col items-center justify-start'>
                    <span className="warning-badge">
                        Success, with message:
                    </span>
                    <p> {message} </p>
                </div>
            );
        } else {
            return (
                <div className='flex flex-col items-center justify-start'>
                    <span className="error-badge">
                        Failed
                    </span>
                    <p> {message} </p>
                </div>
            );
        }
    };

    return (
        <>
            {pageData.map((value, idx) => (
                <tr key={idx}>
                    <td className="px-4 py-3">
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
            ))}
        </>
    );
};
