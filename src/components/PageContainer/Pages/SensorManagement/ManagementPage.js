import { useState } from "react";
import WriteContainer from "./CRUD/Write/WriteContainer";
import DeleteContainer from "./CRUD/Delete/DeleteContainer";
import ViewContainer from "./CRUD/View/ViewContainer";
import ManageTable from "./ManageTable";
import { UserAuth } from "../../../context/AuthContext";

const ManagementPage = (props) => {
    const [tableRefresh, setTableRefresh] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [rowData, setRowData] = useState(null);
    const { user } = UserAuth();

    // additional add btns to pass into table component
    const sensorTableAdditionalBtns = [
        { menuPath: "-Plume", content: "Add New Plume Sensor Platform", className: "table-create-button" },
        { menuPath: "-DataIngestionTask", content: "Schedule Data Ingestion Task", className: "table-view-map-button" },
    ]

    if (props.page === "sensor-platform-types") {
        return (
            <div className="page">
                <ManageTable
                    tableRefresh={tableRefresh} setTableRefresh={setTableRefresh}
                    tableName="SensorPlatformType" darkTheme={props.darkTheme} addBtns={[]} setMenuOpen={setMenuOpen} setRowData={setRowData}
                    dataURL={process.env.REACT_APP_AIRQUALITY_API_URL + "sensor-type"}
                    tableHeader={(user?.role === "admin" || user?.role === "sensortech") ? "Manage Sensor Platform Types" : "Sensor Platform Types"}
                    tableCaption={(user?.role === "admin" || user?.role === "sensortech")
                        ? "Browse through a list of sensor platform types and their associated information.\n Admin users and sensor technicians can create, edit and delete sensor types here."
                        : "Browse through a list of sensor platform types and their associated information."} />
                {WriteContainer({ menuOpen, setMenuOpen, setTableRefresh, rowData, darkTheme: props.darkTheme })}
                {DeleteContainer({ menuOpen, setMenuOpen, rowData, setTableRefresh })}
            </div>
        )
    }

    else if (props.page === "sensor-platforms") {
        return (
            <div className="page">
                <ManageTable
                    tableRefresh={tableRefresh} setTableRefresh={setTableRefresh}
                    tableName="SensorPlatform" darkTheme={props.darkTheme} addBtns={sensorTableAdditionalBtns} setMenuOpen={setMenuOpen} setRowData={setRowData}
                    dataURL={process.env.REACT_APP_AIRQUALITY_API_URL + "sensor/joined?columns=id&columns=lookup_id&columns=serial_number&columns=active&columns=active_reason&columns=stationary_box&columns=time_updated&join_sensor_types=true&join_user=true"}
                    tableHeader={(user?.role === "admin" || user?.role === "sensortech") ? "Manage Sensor Platforms" : "Sensor Platforms"}
                    tableCaption={(user?.role === "admin" || user?.role === "sensortech")
                        ? "Browse through a list of sensor platforms and their associated information.\n Admin users and sensor technicians can create, edit and delete sensor platforms here."
                        : "Browse through a list of sensor platforms and their associated information."} />
                {WriteContainer({ menuOpen, setMenuOpen, setTableRefresh, rowData, darkTheme: props.darkTheme })}
                {ViewContainer({ menuOpen, setMenuOpen, rowData })}
                {DeleteContainer({ menuOpen, setMenuOpen, rowData, setTableRefresh })}
            </div>
        )
    }
}


export default ManagementPage


