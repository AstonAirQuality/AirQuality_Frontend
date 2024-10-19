import { UserAuth } from "../../../context/AuthContext"
import { useState } from "react";
import { VscClose } from "react-icons/vsc"
import CustomFadingAlert from '../SharedComponents/CustomFadingAlert';
const Profile = () => {

    // remove token refresh? could be vulnerable to XSS attacks
    const { forceTokenRefresh, deleteAccount, user } = UserAuth();
    const [alertMessage, setAlertMessage] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);

    function handleClose(e){
        if(e.target.id === "modal"){
            setMenuOpen(false)
        }
    }

    return (
        <div className="page flex flex-col items-center ">
            <h1 className="page-title">Welcome {user?.username}!</h1>
            <p className="page-text">This is your profile page. You can get access tokens here to use in the api docs</p>

            {alertMessage && <CustomFadingAlert message={alertMessage} setAlertMessage={setAlertMessage} status={"success"} />}

            <button onClick={() => { setAlertMessage("copied to clipboard: \n" + user?.access_token); navigator.clipboard.writeText(user?.access_token) }} className="bg-cyan-500 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-fit mb-4">
                Copy your access token to clipboard
            </button>

            <button onClick={forceTokenRefresh} className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-fit mb-4">
                Generate a new access token</button>

            <button onClick={() => setMenuOpen(true)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-fit mb-4">
                Delete your account
            </button>

            {menuOpen &&
                <div id = "modal" onClick={handleClose} className="modal-container">
                    <div className="modal w-96">
                        <div className="flex justify-between items-center p-5 rounded-t border-b dark:border-gray-600">
                            <h1 className="text-xl font-semibold text-gray-500 dark:text-gray-400">Delete Account?</h1>
                            <button onClick={() => setMenuOpen(false)} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" >
                                <VscClose size={32} />
                            </button>
                        </div>
                        <div className="p-2">
                            <h5 className="text-m font-semibold text-gray-500 dark:text-gray-400">Are you sure you want to delete your account? <br/> This action cannot be undone.</h5>
                        </div>
                        <div className="flex items-center justify-between">
                            <button onClick={() => deleteAccount()} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                                Yes
                            </button>
                            <button onClick={() => setMenuOpen(false)} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

export default Profile