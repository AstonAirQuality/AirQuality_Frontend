import { useState, useEffect } from 'react'
import CustomFadingAlert from '../../../../SharedComponents/CustomFadingAlert';
import handleChange from '../../SharedComponents/handleChange';
import DrawOnMap from '../../SharedComponents/DrawOnMap';
import { UserAuth } from '../../../../../../context/AuthContext';

// TODO for user input change to text only and add a tooltip to explain the format
const WriteSensorPlatform = ({ rowData, setChanges, setMenuOpen, requestURL, submitForm, darkTheme }) => {

    const formData = {
        lookup_id: rowData.lookup_id ? rowData.lookup_id : "",
        serial_number: rowData.serial_number ? rowData.serial_number : "",
        active: rowData.active ? rowData.active : false,
        stationary_box: rowData.stationary_box ? rowData.stationary_box : "",
        type_id: 1, //default value is 1
        user_id: rowData.username ? rowData.username.split(" ")[1] : "", //get the second element of the array, which is the user_id
    }

    const [state, setState] = useState(formData);
    const [sensorTypes, setSensorTypes] = useState([]);
    const [alertMessage, setAlertMessage] = useState('');
    const [lookupIdTransition, setLookupIdTransition] = useState(false);
    const [userIdTransition, setUserIdTransition] = useState(false);
    const [serialNumberTransition, setSerialNumberTransition] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userinfo, setUserinfo] = useState(JSON.parse(window.sessionStorage.getItem('users')) || [{ username: 'None', uid: 'None' }]);
    const [fromCoordsMenu, setFromCoordsMenu] = useState(false);
    const { user } = UserAuth();


    async function fetchAllUsers() {
        // try to get the users locally first
        let data = JSON.parse(window.sessionStorage.getItem('users'));
        if (!data) {
            console.log("fetching users");
            await fetch(process.env.REACT_APP_AIRQUALITY_API_URL + `user`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.access_token}`
                },
            }).then(response => response.json())
                .then((data) => {
                    setUserinfo(data);
                    // cache the data in session storage
                    window.sessionStorage.setItem('users', JSON.stringify(data));
                });
        }
    }


    async function getSensorTypes() {
        let cached_data = JSON.parse(window.sessionStorage.getItem('SensorPlatformType'));
        if (cached_data) {
            setSensorTypes(cached_data);
        }
        else {
            const response = await fetch(process.env.REACT_APP_AIRQUALITY_API_URL + 'sensor-type')
            cached_data = await response.json()
            setSensorTypes(cached_data)
            // cache the data in session storage
            window.sessionStorage.setItem('SensorPlatformType', JSON.stringify(cached_data));
        }

        // if the row data type_name is not null, then we can set the type_id to the id of the type_name
        if (rowData.type_name !== null) {
            const sensorType = cached_data.find(sensorType => sensorType.name.toLowerCase() === rowData.type_name.toLowerCase());
            setState({ ...state, type_id: sensorType?.id });
        }

        return
    }

    function validateForm() {
        if (!state.lookup_id || !state.serial_number) {
            setAlertMessage('Missing required fields');
            if (!state.lookup_id) {
                setLookupIdTransition(true);
                return false;
            }
            if (!state.serial_number) {
                setSerialNumberTransition(true);
                return false;
            }
        }

        if (state.user_id === "" || state.user_id === "None") {
            state.user_id = "None";
        }
        // check if user_id is in the userinfo array
        else {

            let user_id = state.user_id;
            // split into to get the user_id and remove parenthesis
            try {
                user_id = state.user_id.split(" ")[1].replace("(", "").replace(")", "");
            }
            catch (e) {
            }

            //check if user_id is in the userinfo array
            const user = userinfo.find(user => user.uid === user_id);
            if (!user) {
                setAlertMessage('User not found');
                setUserIdTransition(true);
                return false;
            }
            else {
                state.user_id = user_id;
            }
        }

        // validate sensor type
        if (!state.type_id) {
            setAlertMessage('Missing required fields');
            return false;
        }

        return true;
    }

    useEffect(() => {
        getSensorTypes();
        fetchAllUsers()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    useEffect(() => {
        setTimeout(() => {
            setLookupIdTransition(false);
            setUserIdTransition(false);
            setSerialNumberTransition(false);
        }, 8000); //8 seconds
    }, [lookupIdTransition, userIdTransition, serialNumberTransition])

    
    function createPolygonFromCoordinates(longitude, latitude) {
        // create a polygon from the coordinates
        const minLongitude = longitude - 0.0001
        const maxLongitude = longitude + 0.0001
        const minLatitude = latitude - 0.0001
        const maxLatitude = latitude + 0.0001
        const geometryString = `POLYGON ((${minLongitude} ${minLatitude},${maxLongitude} ${minLatitude},${maxLongitude} ${maxLatitude},${minLongitude} ${maxLatitude},${minLongitude} ${minLatitude}))`
        return geometryString
    }



    async function handleSubmit(e) {
        e.preventDefault();
        if (validateForm()) {
            setLoading(true);
            // after validation, set the request body. We cannot pass the state directly because it cannot contain null values as it is used to populate the form
            const requestBody =
            {
                lookup_id: state.lookup_id,
                serial_number: state.serial_number,
                active: state.active,
                stationary_box: state.stationary_box === "" ? null : state.stationary_box,
                type_id: state.type_id,
                user_id: state.user_id === 'None' ? null : state.user_id,
            }

            await submitForm(requestBody, requestURL)
                .finally(() => { setLoading(false) });

        }
    }

    return (
        <>
            {alertMessage && <CustomFadingAlert message={alertMessage} setAlertMessage={setAlertMessage} status="error" />}
            <div className="mb-4">
                <label className="form-label">
                    lookup_id*
                </label>
                <input className={`form-input ${lookupIdTransition ? 'form-input-error' : 'form-input-error-fade'}`}
                    id="lookup_id" type="text"
                    name="lookup_id"
                    value={state.lookup_id}
                    onChange={(e) => handleChange(e, setChanges, setState, state, formData)} />

            </div>

            <div className="mb-4">
                <label className="form-label">
                    serial_number*
                </label>
                <input className={`form-input ${serialNumberTransition ? 'form-input-error' : 'form-input-error-fade'}`}
                    id="serial_number" type="text"
                    name="serial_number"
                    value={state.serial_number}
                    onChange={(e) => handleChange(e, setChanges, setState, state, formData)} />
            </div>

            <div className="mb-4">
                <label className="form-label">
                    active*
                </label>
                <input type="checkbox" name="active" className="form-checkbox" defaultChecked={state.active}
                    value={state.active} onChange={(e) => handleChange(e, setChanges, setState, state, formData)} />
            </div>

            <div className="mb-4">
                <label className="form-label">
                    stationary_box
                </label>
                <input className="form-input"
                    id="stationary_box" type="text"
                    name="stationary_box"
                    value={state.stationary_box}
                    onChange={(e) => handleChange(e, setChanges, setState, state, formData)} />
                <div className="pt-4 flex flex-row items-start">
                    <button className="table-delete-button bg-red-500" type="button" onClick={() => setState({ ...state, stationary_box: "" })}>Clear</button>
                    <button className="table-view-button bg-amber-500" type="button" onClick={() => setShowMap(!showMap)}>{showMap ? "Close Map" : "Draw in Map"}</button>
                    <button className="table-edit-button bg-blue-500" type='button' onClick={() => setFromCoordsMenu(!fromCoordsMenu)}>{fromCoordsMenu ? 'Close' : 'Generate From Co-ordinates'}</button>
                </div>
                {/* lat long to bbox */}
                {fromCoordsMenu &&
                    <div className="py-2 flex flex-row items-center justify-evenly">
                        <div className="flex flex-col w-1/4 px-1">
                            <label className="form-label">
                                longitude
                            </label>
                            <input className="form-input"
                                id="longitude" type="text"
                                name="longitude"
                                value={state.longitude}
                                onChange={(e) => handleChange(e, setChanges, setState, state, formData)} />
                        </div>
                        <div className="flex flex-col w-1/4 px-1">
                            <label className="form-label">
                                latitude
                            </label>
                            <input className="form-input"
                                id="latitude" type="text"
                                name="latitude"
                                value={state.latitude}
                                onChange={(e) => handleChange(e, setChanges, setState, state, formData)} />
                        </div>
                        <button className="table-create-button bg-green-500 w-1/4 px-1" type="button" onClick={() => setState({ ...state, stationary_box: createPolygonFromCoordinates(state.longitude, state.latitude) })}>Create Bounding Box</button>
                    </div>
                }
              
                {showMap && <DrawOnMap darkTheme={darkTheme} setState={setState} state={state} />}
            </div>

            <div className="mb-4">
                <label className="form-label">
                    type*
                </label>
                <select name="type_id" className="form-input" value={state.type_id} onChange={(e) => { handleChange(e, setChanges, setState, state, formData); }}>
                    {sensorTypes.map((sensorType, key) => <option key={key} value={sensorType.id}>{sensorType.name}</option>)}
                </select>
            </div>

            {/* search using the user's name and in the userinfo array, get the user_id hide username */}
            <div className="mb-4">
                <label className="form-label">
                    user_id
                </label>
                <input list='brow' className={`form-input ${userIdTransition ? 'form-input-error' : 'form-input-error-fade'}`}
                    id="user_id" type="text"
                    name="user_id"
                    value={state.user_id}
                    onChange={(e) => handleChange(e, setChanges, setState, state, formData)} />
                <datalist id='brow'>
                    <option value="None">None</option>
                    {userinfo?.map((user, key) => <option key={key} value={user.username + " (" + user.uid + ")"}></option>)}
                </datalist>
            </div>


            {/* form buttons */}
            <div className="flex items-center justify-between">
                <button onClick={() => setMenuOpen(false)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                    Cancel
                </button>
                <button onClick={handleSubmit} disabled={loading} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                    Save
                </button>
            </div>

        </>
    )
}



export default WriteSensorPlatform


