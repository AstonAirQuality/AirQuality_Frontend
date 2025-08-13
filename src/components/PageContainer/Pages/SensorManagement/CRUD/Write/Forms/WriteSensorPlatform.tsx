import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import CustomFadingAlert from '../../../../SharedComponents/CustomFadingAlert.tsx';
import handleChange from '../../SharedComponents/handleChange.ts';
import DrawOnMap from '../../SharedComponents/DrawOnMap.tsx';
import { UserAuth } from '../../../../../../context/AuthContext.tsx';
import { useDarkModeContext } from '../../../../../../context/DarkModeContext.tsx';
import { RequestMethod } from '../FormContainer'
// Types
interface SensorType {
    id: number;
    name: string;
}

interface UserInfo {
    username: string;
    uid: string;
}

interface RowData {
    lookup_id?: string;
    serial_number?: string;
    active?: boolean;
    stationary_box?: string;
    type_name?: string | null;
    username?: string;
    longitude?: string;
    latitude?: string;
}

interface WriteSensorPlatformProps {
    rowData: RowData;
    setChanges: React.Dispatch<React.SetStateAction<any>>;
    setMenuOpen: (open: string) => void;
    requestMethod: RequestMethod
    submitForm: (requestBody: any, requestMethod: RequestMethod) => Promise<void>
}

interface StateType {
    lookup_id: string;
    serial_number: string;
    active: boolean;
    stationary_box: string;
    type_id: number | string;
    user_id: string;
    longitude?: string;
    latitude?: string;
}

const WriteSensorPlatform: React.FC<WriteSensorPlatformProps> = ({
    rowData,
    setChanges,
    setMenuOpen,
    requestMethod,
    submitForm,
}) => {
    const [darkTheme] = useDarkModeContext();
    const formData: StateType = {
        lookup_id: rowData.lookup_id ? rowData.lookup_id : '',
        serial_number: rowData.serial_number ? rowData.serial_number : '',
        active: rowData.active ? rowData.active : false,
        stationary_box: rowData.stationary_box ? rowData.stationary_box : '',
        type_id: 0,
        user_id: rowData.username ? rowData.username.split(' ')[1] : '',
        longitude: rowData.longitude || '',
        latitude: rowData.latitude || '',
    };

    const [state, setState] = useState<StateType>(formData);
    const [sensorTypes, setSensorTypes] = useState<SensorType[]>([]);
    const [alertMessage, setAlertMessage] = useState<string | [string, string] | ''>('');
    const [lookupIdTransition, setLookupIdTransition] = useState(false);
    const [userIdTransition, setUserIdTransition] = useState(false);
    const [serialNumberTransition, setSerialNumberTransition] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userinfo, setUserinfo] = useState<UserInfo[]>(
        JSON.parse(window.sessionStorage.getItem('users') || 'null') || [{ username: 'None', uid: 'None' }]
    );
    const [fromCoordsMenu, setFromCoordsMenu] = useState(false);
    const { user } = UserAuth() || {};;

    async function fetchAllUsers() {
        let data: UserInfo[] | null = JSON.parse(window.sessionStorage.getItem('users') || 'null');
        if (!data) {
            await fetch(process.env.REACT_APP_AIRQUALITY_API_URL + `user`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.access_token}`,
                },
            })
                .then((response) => response.json())
                .then((data: UserInfo[]) => {
                    setUserinfo(data);
                    window.sessionStorage.setItem('users', JSON.stringify(data));
                });
        }
    }

    async function getSensorTypes() {
        let cached_data: SensorType[] | null = JSON.parse(window.sessionStorage.getItem('SensorPlatformType') || 'null');
        if (cached_data) {
            setSensorTypes(cached_data);
        } else {
            const response = await fetch(process.env.REACT_APP_AIRQUALITY_API_URL + 'sensor-platform-type');
            cached_data = await response.json();
            setSensorTypes(cached_data || []);
            window.sessionStorage.setItem('SensorPlatformType', JSON.stringify(cached_data));
        }

        if (rowData.type_name !== null && rowData.type_name !== undefined && cached_data) {
            const sensorType = cached_data.find(
                (sensorType) =>
                    sensorType.name &&
                    rowData.type_name &&
                    sensorType.name.toLowerCase() === rowData.type_name!.toLowerCase()
            );
            setState((prev) => ({ ...prev, type_id: sensorType?.id ?? 0 }));
        }
    }

    function validateForm() {
        if (!state.lookup_id || !state.serial_number) {
            setAlertMessage('Missing required fields:');
            if (!state.lookup_id) {
                setLookupIdTransition(true);
                return false;
            }
            if (!state.serial_number) {
                setSerialNumberTransition(true);
                return false;
            }
        }

        if (state.user_id === '' || state.user_id === 'None') {
            state.user_id = 'None';
        } else {
            let user_id = state.user_id;
            try {
                user_id = state.user_id.split(' ')[1].replace('(', '').replace(')', '');
            } catch (e) {}
            const user = userinfo.find((user) => user.uid === user_id);
            if (!user) {
                setAlertMessage('User not found');
                setUserIdTransition(true);
                return false;
            } else {
                state.user_id = user_id;
            }
        }

        if (!state.type_id || state.type_id === '0' || state.type_id === 0) {
            setAlertMessage('Missing required fields: Sensor Type');
            return false;
        }

        return true;
    }

    useEffect(() => {
        getSensorTypes();
        fetchAllUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setLookupIdTransition(false);
            setUserIdTransition(false);
            setSerialNumberTransition(false);
        }, 8000);
        return () => clearTimeout(timeout);
    }, [lookupIdTransition, userIdTransition, serialNumberTransition]);

    function createPolygonFromCoordinates(longitude?: string, latitude?: string) {
        if (!longitude || !latitude) return '';
        const lon = parseFloat(longitude);
        const lat = parseFloat(latitude);
        if (isNaN(lon) || isNaN(lat)) return '';
        const minLongitude = lon - 0.0001;
        const maxLongitude = lon + 0.0001;
        const minLatitude = lat - 0.0001;
        const maxLatitude = lat + 0.0001;
        const geometryString = `POLYGON ((${minLongitude} ${minLatitude},${maxLongitude} ${minLatitude},${maxLongitude} ${maxLatitude},${minLongitude} ${maxLatitude},${minLongitude} ${minLatitude}))`;
        return geometryString;
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (validateForm()) {
            setLoading(true);
            const requestBody = {
                lookup_id: state.lookup_id,
                serial_number: state.serial_number,
                active: state.active,
                stationary_box: state.stationary_box === '' ? null : state.stationary_box,
                type_id: state.type_id,
                user_id: state.user_id === 'None' ? null : state.user_id,
            };

            await submitForm(requestBody, requestMethod).finally(() => {
                setLoading(false);
            });
        }
    }

    return (
        <>
            {alertMessage && (
                <CustomFadingAlert message={alertMessage} setAlertMessage={setAlertMessage} status="error" />
            )}
            <div className="mb-4">
                <label className="form-label">lookup_id*</label>
                <input
                    className={`form-input ${lookupIdTransition ? 'form-input-error' : 'form-input-error-fade'}`}
                    id="lookup_id"
                    type="text"
                    name="lookup_id"
                    value={state.lookup_id}
                    onChange={(e) => handleChange(e, setChanges, setState, state, formData)}
                />
            </div>

            <div className="mb-4">
                <label className="form-label">serial_number*</label>
                <input
                    className={`form-input ${serialNumberTransition ? 'form-input-error' : 'form-input-error-fade'}`}
                    id="serial_number"
                    type="text"
                    name="serial_number"
                    value={state.serial_number}
                    onChange={(e) => handleChange(e, setChanges, setState, state, formData)}
                />
            </div>

            <div className="mb-4">
                <label className="form-label">active*</label>
                <input
                    type="checkbox"
                    name="active"
                    className="form-checkbox"
                    checked={state.active}
                    value={String(state.active)}
                    onChange={(e) => handleChange(e, setChanges, setState, state, formData)}
                />
            </div>

            <div className="mb-4">
                <label className="form-label">stationary_box</label>
                <input
                    className="form-input"
                    id="stationary_box"
                    type="text"
                    name="stationary_box"
                    value={state.stationary_box}
                    onChange={(e) => handleChange(e, setChanges, setState, state, formData)}
                />
                <div className="pt-4 flex flex-row items-start">
                    <button
                        className="table-delete-button bg-red-500"
                        type="button"
                        onClick={() => setState({ ...state, stationary_box: '' })}
                    >
                        Clear
                    </button>
                    <button
                        className="table-view-button bg-amber-500"
                        type="button"
                        onClick={() => setShowMap(!showMap)}
                    >
                        {showMap ? 'Close Map' : 'Draw in Map'}
                    </button>
                    <button
                        className="table-edit-button bg-blue-500"
                        type="button"
                        onClick={() => setFromCoordsMenu(!fromCoordsMenu)}
                    >
                        {fromCoordsMenu ? 'Close' : 'Generate From Co-ordinates'}
                    </button>
                </div>
                {fromCoordsMenu && (
                    <div className="py-2 flex flex-row items-center justify-evenly">
                        <div className="flex flex-col w-1/4 px-1">
                            <label className="form-label">longitude</label>
                            <input
                                className="form-input"
                                id="longitude"
                                type="text"
                                name="longitude"
                                value={state.longitude || ''}
                                onChange={(e) => handleChange(e, setChanges, setState, state, formData)}
                            />
                        </div>
                        <div className="flex flex-col w-1/4 px-1">
                            <label className="form-label">latitude</label>
                            <input
                                className="form-input"
                                id="latitude"
                                type="text"
                                name="latitude"
                                value={state.latitude || ''}
                                onChange={(e) => handleChange(e, setChanges, setState, state, formData)}
                            />
                        </div>
                        <button
                            className="table-create-button bg-green-500 w-1/4 px-1"
                            type="button"
                            onClick={() =>
                                setState({
                                    ...state,
                                    stationary_box: createPolygonFromCoordinates(state.longitude, state.latitude),
                                })
                            }
                        >
                            Create Bounding Box
                        </button>
                    </div>
                )}

                {showMap && <DrawOnMap darkTheme={darkTheme} setState={setState} state={state} />}
            </div>

            <div className="mb-4">
                <label className="form-label">type*</label>
                <select
                    name="type_id"
                    className="form-input"
                    value={state.type_id}
                    onChange={(e) => {
                        handleChange(e, setChanges, setState, state, formData);
                    }}
                >
                    <option value="0" disabled>
                        Select Sensor Type
                    </option>
                    {sensorTypes.map((sensorType) => (
                        <option key={sensorType.id} value={sensorType.id}>
                            {sensorType.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-4">
                <label className="form-label">user_id</label>
                <input
                    list="brow"
                    className={`form-input ${userIdTransition ? 'form-input-error' : 'form-input-error-fade'}`}
                    id="user_id"
                    type="text"
                    name="user_id"
                    value={state.user_id}
                    onChange={(e) => handleChange(e, setChanges, setState, state, formData)}
                />
                <datalist id="brow">
                    <option value="None">None</option>
                    {userinfo?.map((user) => (
                        <option key={user.uid} value={user.username + ' (' + user.uid + ')'}></option>
                    ))}
                </datalist>
            </div>

            <div className="flex items-center justify-between">
                <button
                    onClick={() => setMenuOpen('false')}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="button"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="button"
                >
                    Save
                </button>
            </div>
        </>
    );
};

export default WriteSensorPlatform;
