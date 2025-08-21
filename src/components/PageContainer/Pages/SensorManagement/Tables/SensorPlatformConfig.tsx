import { useEffect, useState } from "react";
import { VscRefresh} from "react-icons/vsc";
import RefreshData from "../CRUD/SharedComponents/RefreshData.ts";
import { UserAuth } from "../../../../context/AuthContext.tsx";
import TableBody from "./TableBody.tsx";
import TableHeaders from "./TableHeaders.tsx";
import { User } from "../../../../../types/User.ts";


type SensorPlatformConfigProps = {
    tableRefresh: boolean;
    setTableRefresh: (value: boolean) => void;
    setMenuOpen: (value: string) => void;
    setRowData: (data: any) => void;
};
//TODO remove user check as only admins should be able to access this page

const SensorPlatformConfig: React.FC<SensorPlatformConfigProps> = ({
    tableRefresh,
    setTableRefresh,
    setMenuOpen,
    setRowData: setParentRowData,
}) => {
      const [rowData, setRowData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const { user } = UserAuth() || {};

    const disableActions = user?.role === "user" || user === null;
    const tableType = "sensor-platform-config";
    const addBtnMenuPath = "Create-" + tableType;
    const dataURL =
        process.env.REACT_APP_AIRQUALITY_API_URL + tableType;
    const tableName = "Sensor Platform Configuration";
    const tableHeader = (user?.role === "admin" || user?.role === "sensortech" ? "Manage " : "") + "Sensor Platform Configuration"
    const tableCaption =
        user?.role === "admin" || user?.role === "sensortech"
            ? "Browse through a list of Sensor Platform Configurations and their associated information.\n Admin users and sensor technicians can create, edit and delete Sensor Platform Configurations here."
            : "Browse through a list of Sensor Platform Configurations and their associated information.";

    // Fetch data from API and cache it
    const handleRefresh = async (refreshState: boolean, url: string) => {
        setLoading(true);
        await RefreshData(refreshState, url, tableType).then((data) => {
            if (data === null || data.length === 0) {
                throw new Error("No data found");
            }
            else{
                data.sort((a: any, b: any) => (a.id > b.id ? 1 : -1));
                setHeaders(Object.keys(data[0] || {}));
                setRowData(data);
                setTableRefresh(false);
            }
        }).catch((error) => {
            console.error("Error fetching data:", error);
            setRowData([]);
            setHeaders([]);
        }).finally(() => {
            setLoading(false);
        });
    };

    useEffect(() => {
        handleRefresh(tableRefresh, dataURL);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableRefresh]);

    return (
        <div className="flex flex-col">
            <div className="shadow-md block max-h-screen overflow-x-auto border-t-2 dark:border-gray-800">
                <table
                    id="searchtable"
                    className="w-full text-sm text-left text-gray-500 dark:text-gray-400"
                >
                    <caption className="p-5 bg-white dark:bg-gray-700">
                        <div className="flex justify-between items-center p-3 rounded-t border-b dark:border-gray-600">
                            <h1 className="text-4xl font-extrabold text-gray-500 dark:text-gray-400">
                                {tableHeader}
                            </h1>
                            {(user?.role === "admin" || user?.role === "sensortech") && (
                                <div className="flex flex-col">
                                    <button
                                        onClick={() => setMenuOpen(addBtnMenuPath)}
                                        className="table-create-button"
                                    >
                                        Create New {tableName}
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between">
                            <p className="table-caption-text">{tableCaption}</p>
                            <button
                                onClick={() => setTableRefresh(true)}
                                disabled={loading}
                                className="table-refresh-button"
                            >
                                <VscRefresh className="w-fit h-fit" /> Refresh
                            </button>
                        </div>
                    </caption>
                    <thead className="sticky top-0 text-xs text-gray-600 uppercase bg-gray-200 dark:bg-gray-800 dark:text-gray-400">
                        <tr>
                            {headers.map((value, key) => (
                                <TableHeaders key={key} value={value} index={key} />
                            ))}
                            {!disableActions && (
                                <th scope="col" className="py-3 pl-6 text-center">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {rowData.map((row, key) => (
                            <TableBody
                                key={key}
                                props={{
                                    setMenuOpen,
                                    setRowData: setParentRowData,
                                }}
                                tableType={tableType}
                                headers={headers}
                                rowData={row}
                                user={user as User}
                                disableActions={disableActions}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default SensorPlatformConfig;