import { useEffect, useState } from "react";
import { RiArrowDropDownLine } from 'react-icons/ri';
import { VscRefresh, VscClose } from 'react-icons/vsc';
import { HiFilter } from 'react-icons/hi';
import RefreshData from "./CRUD/SharedComponents/RefreshData";
import { UserAuth } from "../../../context/AuthContext";

const ManageTable = (props) => {
    const [rowData, setRowData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = UserAuth();
    // disable action buttons for sensor types table unless role is above user
    const disableActions = (props.tableName === "SensorType" && (user?.role === "user" || user === null)) ? true : false;

    const addBtnMenuPath = "Create-" + props.tableName;

    //fetch data from api and cache it https://blog.logrocket.com/javascript-cache-api/
    async function handleRefresh(refresh_state, dataURL) {
        setLoading(true);
        await RefreshData(refresh_state, dataURL, props.tableName)
            .then(result => {
                // sort by id
                result.sort((a, b) => (a.id > b.id) ? 1 : -1)
                setHeaders(Object.keys(result[0]));
                setRowData(result);
                props.setTableRefresh(false);
                setLoading(false);
            })
    }

    //fetch data on page load
    useEffect(() => {
        handleRefresh(props.tableRefresh, props.dataURL);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.tableRefresh, props.dataURL]);

    return (
        <div className="flex flex-col">
            <div className="shadow-md block max-h-screen overflow-x-auto border-t-2 dark:border-gray-800">
                <table id="searchtable" className="w-full text-sm text-left text-gray-500 dark:text-gray-400">

                    <caption className="p-5 bg-white dark:bg-gray-700">
                        <div className="flex justify-between items-center p-3 rounded-t border-b dark:border-gray-600">
                            <h1 className="text-4xl font-extrabold text-gray-500 dark:text-gray-400">{props.tableHeader}</h1>
                            {(user?.role === "admin" || user?.role === "sensortech") &&
                                <div className="flex flex-col">
                                    <button onClick={() => props.setMenuOpen(addBtnMenuPath)} className="table-create-button">Create New {props.tableName}</button>
                                    {props.addBtns.map((value, key) => <button key={key} onClick={() => props.setMenuOpen(addBtnMenuPath + value.menuPath)} className={value.className}>{value.content}</button>)}
                                </div>
                            }

                        </div>

                        <div className="flex justify-between">
                            <p className="table-caption-text">
                                {props.tableCaption}
                            </p>
                            <button onClick={() => { props.setTableRefresh(true) }} disabled={loading} className="table-refresh-button"><VscRefresh className="w-fit h-fit" /> Refresh</button>
                        </div>
                    </caption>

                    <thead className="sticky top-0 text-xs text-gray-600 uppercase bg-gray-200 dark:bg-gray-800 dark:text-gray-400">
                        <tr>
                            {headers.map((value, key) => <TableHeaders key={key} value={value} index={key} />)}
                            {disableActions === false && <th scope="col" className="py-3 pl-6 text-center">Actions</th>}
                        </tr>
                    </thead>
                    {/* scrollable TableBody */}
                    <tbody>
                        {rowData.map((rowData, key) => <TableBody key={key} props={props} headers={headers} rowData={rowData} user={user} disableActions={disableActions} />)}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

const TableHeaders = (props) => {
    const [filter, setFilter] = useState(false);

    // reset table fliter when filter button is clicked
    const handleFilter = (e) => {
        e.preventDefault();
        setFilter(!filter);
        FilterFunction(props.index, "")
    }
    return (
        <th scope="col" className="py-3 pl-6">
            <div className="flex flex-col items-center">
                <span className="font-medium flex flex-row items-center">
                    {/* if props.value is not propertie table then enable the filter */}
                    <button onClick={(e) => { handleFilter(e) }}>
                        {props.value !== "properties" && <HiFilter className="w-6 h-6 p-1 focus:outline-none focus:shadow-outline" />}
                    </button>

                    {props.value}
                </span>
                {filter &&
                    <div className="relative text-gray-600 dark:text-gray-500 focus-within:text-gray-400 dark:focus-within:text-gray-700">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-0.5">
                            <HiFilter className="w-6 h-6 p-1 focus:outline-none focus:shadow-outline" />
                        </span>
                        <button onClick={(e) => handleFilter(e)} className="table-filter-close-button" >
                            <VscClose size={16} />
                        </button>
                        <input type="text" className="table-filter-input" placeholder="Filter results" onChange={(e) => { FilterFunction(props.index, e.target.value) }} />
                    </div>
                }
            </div>
        </th>
    )
}

const TableBody = ({ props, headers, rowData, user, disableActions }) => {

    const editBtnMenuPath = "Edit-" + props.tableName;
    const viewBtnMenuPath = "View"; //view button is only for sensors table
    const deleteBtnMenuPath = "Delete-" + props.tableName;

    const allbtns = [
        { buttonText: "View", buttonStyle: "table-view-button", menuPath: viewBtnMenuPath, setMenuOpen: props.setMenuOpen, setRowData: props.setRowData, rowData: rowData },
        { buttonText: "Edit", buttonStyle: "table-edit-button", menuPath: editBtnMenuPath, setMenuOpen: props.setMenuOpen, setRowData: props.setRowData, rowData: rowData },
        { buttonText: "Delete", buttonStyle: "table-delete-button", menuPath: deleteBtnMenuPath, setMenuOpen: props.setMenuOpen, setRowData: props.setRowData, rowData: rowData }
    ]

    //set the table row id to either the serial number or the sensor type (for testing)
    return (
        <tr id={rowData[headers[1]]} className="bg-white border-b dark:bg-gray-700 dark:border-gray-800 hover:bg-gray-300 dark:hover:bg-gray-900">
            {headers.map((value, key) => <TableRow key={key} header={value} value={rowData[value]} darkTheme={props.darkTheme} />)}
            {disableActions === false &&
                <td className="py-4 px-6">
                    {(user?.role === "admin" || user?.role === "sensortech")
                        ? <TableActionsDropDown btns={(props.tableName === "Sensor") ? allbtns : allbtns.slice(1, 3)} />
                        : <TableActionsDropdownItems btn={allbtns[0]} />
                    }
                </td>
            }
        </tr>
    )
}

const TableRow = ({ header, value, darkTheme }) => {

    //if statement handles custom rendering for specific column (active)
    if (header === "active") {
        const active = value ? "Online" : "Offline";
        const activeColor = value ? "h-2.5 w-2.5 rounded-full mr-2 bg-green-400" : "h-2.5 w-2.5 rounded-full mr-2 bg-red-500";

        value = (
            <div className="flex items-center">
                <div className={activeColor} ></div> {active}
            </div>
        )
    }
    else if (header === "username") {
        value = value.split(" ")[0]; //username is an string (username_uid), we only want the first object
    }

    else if (header === "stationary_box") {
        return <StaticSensorMapMarker boundingBox={value} darkTheme={darkTheme} />
    }

    else if (header === "properties") {
        // convert properties dictionary to a horizontal table
        value =
            (
                <table className="table-auto w-min h-fit">
                    <thead>
                        <tr>
                            <th className="py-3 px-6">Obseravable Properties</th>
                            <th className="py-3 px-6">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(value).map((key) => {
                            return (
                                <tr key={key}>
                                    <td id="embedded_header" className="py-3 px-6">{key}</td>
                                    <td id="embedded_value" className="py-3 px-6">{value[key]}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            )
    }

    else if (value !== null && header === "time_updated") {
        value = new Date(value).toLocaleString();
    }

    return (
        <td className="py-3 px-6">
            <div className="flex items-center justify-center">
                {value}
            </div>
        </td>

    )
}

const TableActionsDropDown = ({ btns }) => {

    const [expanded, setExpanded] = useState(true);

    return (
        <>
            <button onClick={() => setExpanded(!expanded)} className="table-actions-dropdown flex justify-between">
                <span className="">Actions</span>
                <div className=""><RiArrowDropDownLine size={32} /></div>
            </button>

            <ul id="dropdown" className={expanded ? "hidden" : "py-2 space-y-2 w-full"}>
                {btns.map((btn, key) => <TableActionsDropdownItems key={key} btn={btn} />)}
            </ul>
        </>
    )
}

const TableActionsDropdownItems = ({ btn }) => (
    <button onClick={() => { btn.setMenuOpen(btn.menuPath); btn.setRowData(btn.rowData) }} className={btn.buttonStyle}>{btn.buttonText}</button>
)


// Function Calculates the Center Point of some BoundingBox
const CalculateCenterPointOfBoundingBox = (boundingBox) => {
    const coordinatesArray = boundingBox.split('((')[1].split('))')[0].split(',');
    const latitudes = []
    const longitudes = []

    coordinatesArray.forEach(item => {
        const coords = item.trim()
        latitudes.push(parseFloat(coords.split(" ")[1]));
        longitudes.push(parseFloat(coords.split(" ")[0]));
    });

    const mean_lat = latitudes.reduce((a, b) => a + b, 0) / latitudes.length;
    const mean_lng = longitudes.reduce((a, b) => a + b, 0) / longitudes.length;
    return [mean_lng, mean_lat]
}


const StaticSensorMapMarker = ({ boundingBox, darkTheme }) => {

    const [map, setMap] = useState(false);

    //TODO add tooltip
    if (map === true && boundingBox !== null) {
        const CenterPointOfPolygon = CalculateCenterPointOfBoundingBox(boundingBox);
        const markerColour = darkTheme ? "f74e4e" : "1754bd";
        const mapStyle = darkTheme ? "dark-v10" : "streets-v11"
        const imageURL = `https://api.mapbox.com/styles/v1/mapbox/${mapStyle}/static/pin-l-communications-tower+${markerColour}(${CenterPointOfPolygon[0]},${CenterPointOfPolygon[1]})/${CenterPointOfPolygon[0]},${CenterPointOfPolygon[1]},16/500x300?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`;
        const imageAlt = "Map of a stationary sensor at point: " + CenterPointOfPolygon[0] + "," + CenterPointOfPolygon[1];

        return (
            <td className="py-3 px-6 flex flex-col items-center justify-center">
                {"Center Point: " + CenterPointOfPolygon}
                <div className="w-fit h-fit relative">
                    <img src={imageURL} alt={imageAlt} className="static-map" />
                    {/* close button overlays image top right */}
                    <button onClick={() => setMap(!map)} className="text-gray-600 hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400  dark:hover:bg-gray-600 dark:hover:text-white rounded-lg p-2.5 absolute top-0 right-0 " >
                        <VscClose size={32} />
                    </button>
                </div>

            </td>
        )
    }
    else {
        return (
            <td className="py-3 px-6">
                <div className="flex items-center justify-center">
                    {boundingBox
                        ? <button className="table-view-map-button" onClick={() => setMap(!map)}>View on Map</button>
                        : "No stationary location found"}
                </div>
            </td>
        )
    }
}

function FilterFunction(key, value) {
    const filter = value.toUpperCase();
    const table = document.getElementById("searchtable");
    const tr = table.getElementsByTagName("tr");
    for (let i = 0; i < tr.length; i++) {
        // get each td element in the row
        const td = tr[i].getElementsByTagName("td")[key];
        
        // skip embedded table headers and values
        if(td?.id === "embedded_header" || td?.id === "embedded_value") continue; 
        
        if (td) {
            // get the text content of the td element
            const txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }

        }
    }
}

export default ManageTable


