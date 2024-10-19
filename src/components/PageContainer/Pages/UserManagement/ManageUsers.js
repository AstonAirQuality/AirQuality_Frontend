import { useState, useEffect } from 'react';
import { UserAuth } from '../../../context/AuthContext';
import { AiOutlineSearch, AiOutlineSave } from 'react-icons/ai';
import CustomFadingAlert from '../SharedComponents/CustomFadingAlert';
export default function ManageUsers() {

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [user_id, setUser_id] = useState('');
    const [userinfo, setUserinfo] = useState('');
    const [editMode, setEditMode] = useState(false);
    // const [updatedrole, setUpdatedRole] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertStatus, setAlertStatus] = useState('success');
    const [displayAllUsers, setDisplayAllUsers] = useState(false);
    const { user } = UserAuth();


    async function handleSubmit(e, path, value) {
        e.preventDefault();
        if (value !== '') {
            await fetch(process.env.REACT_APP_AIRQUALITY_API_URL + `user/${path}?searchvalue=${value}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.access_token}`
                },
            }).then(response => response.json())
                .then((data) => {
                    if (data === null) {
                        setUserinfo('');
                    }
                    //check if data is a single user or an array of users
                    else if (data.uid !== undefined) {
                        setUserinfo([data]);
                    }
                    else {
                        setUserinfo(data);
                    }
                });
        }
    }

    async function handleRoleUpdate(e, uid, role) {
        setAlertMessage("Processing your request. This may take a few seconds.")
        setAlertStatus('info');

        e.preventDefault();
        await fetch(process.env.REACT_APP_AIRQUALITY_API_URL + `user/${uid}/${role}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.access_token}`
            },
        })
            .then((res) => {
                if (res.status === 200) {
                    setAlertMessage('Role Updated');
                    setAlertStatus('success');
                    // update the user info state to reflect the new role (no need to fetch all users again)
                    let updatedUserinfo = userinfo.map((user) => {
                        if (user.uid === uid) {
                            user.role = role;
                        }
                        return user;
                    })
                    setUserinfo(updatedUserinfo);
                }
                else {
                    setAlertMessage('Error Updating Role');
                    setAlertStatus('error');
                }
            });
    }

    async function fetchAllUsers() {
        await fetch(process.env.REACT_APP_AIRQUALITY_API_URL + `user`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.access_token}`
            },
        }).then(response => response.json())
            .then((data) => {
                setUserinfo(data);
                // cache the data in session storage (used for search bars that require all users)
                window.sessionStorage.setItem('users', JSON.stringify(data));
            });
    }

    // on first render, fetch all users using email search with @ symbol
    useEffect(() => {
        fetchAllUsers()
        setDisplayAllUsers(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [displayAllUsers]);


    return (
        <div className="page">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <caption className="p-5 text-left bg-white dark:bg-gray-800">
                    <div className="flex justify-between items-center p-3 rounded-t border-b dark:border-gray-600">
                        <h1 className="text-4xl font-extrabold text-gray-500 dark:text-gray-400">Manage Users</h1>
                    </div>

                    <div className="flex justify-between">
                        <p className="table-caption-text">
                            <strong>CASE SENSTIVE</strong> Search for a user by email, username, user id or role. Here you can also edit user roles.
                        </p>

                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold mt-2 py-2 px-4" onClick={() => setDisplayAllUsers(true)}>
                            Display All Users
                        </button>
                    </div>

                    {alertMessage && <CustomFadingAlert message={alertMessage} setAlertMessage={setAlertMessage} status={alertStatus} />}
                </caption>



                <thead className="text-xs text-gray-600 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th className="items-center justify-start px-4 py-3">User ID
                            <SearchBar path="read-from/uid" searchValue={user_id} setSearchValue={setUser_id} handleSubmit={handleSubmit} />
                        </th>
                        <th className="px-4 py-3">Email
                            <SearchBar path="read-from/email" searchValue={email} setSearchValue={setEmail} handleSubmit={handleSubmit} />
                        </th>

                        <th className="px-4 py-3">Username
                            <SearchBar path="read-from/username" searchValue={username} setSearchValue={setUsername} handleSubmit={handleSubmit} />
                        </th>

                        <th className="px-4 py-3">Role
                            <div className='flex flex-row items-center '>
                                <RoleSearchList path="read-from/role" handleSubmit={handleSubmit} />

                                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 ml-2 rounded" onClick={() => setEditMode(!editMode)}>
                                    {editMode ? 'Disable Edit Mode' : 'Enable Edit Role'}
                                </button>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
                    {userinfo ? userinfo.map((user) => (
                        <tr key={user.uid}>
                            <td className="px-4 py-3">
                                <div className="flex items-center text-sm">
                                    <div>
                                        <p className="font-semibold">{user.uid}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                                {user.email}
                            </td>
                            <td className="px-4 py-3 text-xs">
                                {user.username}
                            </td>
                            <td className="px-4 py-3 text-sm">
                                {user.role}
                                {editMode ? <RoleEditList uid={user.uid} handleRoleUpdate={handleRoleUpdate} /> : null}
                            </td>
                        </tr>
                    ))
                        : <tr>
                            <td className="px-4 py-3 text-sm">No users found. Try searching for a user using the search boxes</td>
                            <td className="px-4 py-3 text-sm"></td>
                            <td className="px-4 py-3 text-sm"></td>
                            <td className="px-4 py-3 text-sm"></td>
                        </tr>}
                </tbody>
            </table>
        </div>
    )
}


const SearchBar = ({ path, searchValue, setSearchValue, handleSubmit }) => {
    return (
        <div className="text-gray-600 dark:text-gray-500 focus-within:text-gray-400 dark:focus-within:text-gray-700 flex flex-row ">
            <input type="search" name="q" className="table-filter-input pr-0" placeholder="Search..." autoComplete="off" onChange={(e) => setSearchValue(e.target.value)} />
            <button type="submit" className="text-black  dark:text-white hover:bg-gray-100 dark:hover:bg-gray-500 p-2.5 rounded-md "
                onClick={(e) => handleSubmit(e, path, searchValue)}>
                <AiOutlineSearch size={16} />
            </button>
        </div>
    )
}

const RoleSearchList = ({ path, handleSubmit }) => {

    const Roles = ["admin", "sensortech", "user"];
    return (
        <div className="relative text-gray-600 focus-within:text-gray-400">
            <select className="table-filter-input pr-0"
                onChange={(e) => handleSubmit(e, path, e.target.value)}>
                {Roles.map((role, key) => <option key={key} value={role}>{role}</option>)}
            </select>
        </div>
    )
}

const RoleEditList = ({ uid, handleRoleUpdate }) => {

    const Roles = ["admin", "sensortech", "user"];
    const [updatedrole, setUpdatedRole] = useState('');

    return (
        <div className="text-gray-600 focus-within:text-gray-400 relative flex flex-row items-center">
            <select className="table-filter-input pr-0"
                onChange={(e) => setUpdatedRole(e.target.value)}>
                {Roles.map((role, key) => <option key={key} value={role}>{role}</option>)}
            </select>
            <button className="role-save-button focus:shadow-outline" onClick={(e) => handleRoleUpdate(e, uid, updatedrole)}>
                <AiOutlineSave className="w-4 h-4" />
                Save new Role
            </button>
        </div>
    )
}


