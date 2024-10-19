import {VscClose} from "react-icons/vsc"
import {useState,useEffect} from "react"
import CustomAlert from '../../../SharedComponents/CustomAlert'
import { UserAuth } from "../../../../../context/AuthContext"

const DeleteContainer = ({menuOpen, setMenuOpen, rowData, setTableRefresh}) => {
    
    //TODO link confirm button to delete function API call
    const [submissionAlert, setSubmissionAlert] = useState(null)
    const [requestURL, setRequestURL] = useState({method: "", url: ""})
    const {user} = UserAuth();

    function handleClose(e){
        if(e.target.id === "modal"){
            setMenuOpen(false)
        }
    }

    useEffect (() => {
        //reset submission alert
        setSubmissionAlert(null)
        if(rowData !== null){
            if (menuOpen === "Delete-SensorPlatformType") {
                setRequestURL({method: "DELETE", url: process.env.REACT_APP_AIRQUALITY_API_URL + `sensor-type/${rowData.id}`})
            }
            else if (menuOpen === "Delete-SensorPlatform") {
                setRequestURL({method: "DELETE", url: process.env.REACT_APP_AIRQUALITY_API_URL + `sensor/${rowData.id}`})
            }
        }
    
    },[menuOpen,rowData]);

    async function submitForm() {
        // add validation to form elements
        setSubmissionAlert(CustomAlert("form-info-alert","Please wait! ","Submitting your request. This may take a few seconds."))

        const requestOptions = {
            method: requestURL.method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.access_token}`
            },
        };
        
        await fetch(requestURL.url, requestOptions).then(
            async response => {
                if (response.status === 200) {
                    setSubmissionAlert(CustomAlert("form-success-alert","Success! ","The request was processed successfully. Please close this panel and refresh the page to see the changes."))
                    rowData = null
                    setTableRefresh(true)
                }
                else {
                    setSubmissionAlert(CustomAlert("form-error-alert","Error! ","The request was unsuccessful"))
                }
        })
    }

    
    if (menuOpen !== false){
        if(menuOpen.includes("Delete")){
            return(
            <div id = "modal" onClick={handleClose} className="modal-container">
                <div className="absolute w-full inset-x-0 top-0">
                {submissionAlert}
                </div>

                <div className="modal">
                    <div className="flex justify-between items-center p-5 rounded-t border-b dark:border-gray-600">
                        <h1 className="text-xl font-semibold text-gray-500 dark:text-gray-400">Delete?</h1>           
                        <button onClick={() => setMenuOpen(false)} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" >
                            <VscClose size={32}/>
                        </button>
                    </div>

                    
                    <div className="p-2">
                    <h5 className="text-m font-semibold text-gray-500 dark:text-gray-400">Are you sure you want to delete this row:</h5>
                    {Object.entries(rowData).map(([header,value], key) => <li className = "form-label overflow-x-hidden" key = {key}>{header}: {JSON.stringify(value)}</li>)}
                    </div>

                    <div className="flex items-center justify-between">
                        <button onClick={() => submitForm()} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                            Yes
                        </button>

                        <button onClick={() => setMenuOpen(false)} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                            Cancel
                        </button> 
                    </div>
                </div>
            </div>
            )
        }
    }
}


export default DeleteContainer