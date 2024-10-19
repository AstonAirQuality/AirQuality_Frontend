import WriteSensorPlatformType from './Forms/WriteSensorPlatformType'
import WriteSensorPlatform from './Forms/WriteSensorPlatform'
import CreatePlumeSensorPlatform from './Forms/CreatePlumeSensorPlatform'
import ScheduleTask from './ScheduleTask/ScheduleTask'
import CustomAlert from '../../../SharedComponents/CustomAlert'
import { useState, useEffect } from 'react'
import { UserAuth } from '../../../../../context/AuthContext'

const FormContainer = ({ menuOpen, setMenuOpen, rowData, setChanges, darkTheme, setTableRefresh }) => {

    const [formElements, setFormElements] = useState(null)
    const [submissionAlert, setSubmissionAlert] = useState(null)
    const { user } = UserAuth();

    //this hook triggers once when component is mounted
    useEffect(() => {
        if (menuOpen === "Edit-SensorPlatformType") {
            setFormElements(<WriteSensorPlatformType rowData={rowData} setChanges={setChanges} setMenuOpen={setMenuOpen}
                submitForm={submitForm}
                requestURL={{ method: "PUT", url: process.env.REACT_APP_AIRQUALITY_API_URL + `sensor-type/${rowData.id}` }} />)
        }
        else if (menuOpen === "Create-SensorPlatformType") {
            setFormElements(<WriteSensorPlatformType rowData={{}} setChanges={setChanges} setMenuOpen={setMenuOpen}
                submitForm={submitForm}
                requestURL={{ method: "POST", url: process.env.REACT_APP_AIRQUALITY_API_URL + "sensor-type" }} />)
        }
        else if (menuOpen === "Edit-SensorPlatform") {
            setFormElements(<WriteSensorPlatform rowData={rowData} setChanges={setChanges} setMenuOpen={setMenuOpen}
                submitForm={submitForm} darkTheme={darkTheme}
                requestURL={{ method: "PUT", url: process.env.REACT_APP_AIRQUALITY_API_URL + `sensor/${rowData.id}` }} />)
        }
        else if (menuOpen === "Create-SensorPlatform") {
            setFormElements(<WriteSensorPlatform rowData={{}} setChanges={setChanges} setMenuOpen={setMenuOpen}
                submitForm={submitForm} darkTheme={darkTheme}
                requestURL={{ method: "POST", url: process.env.REACT_APP_AIRQUALITY_API_URL + "sensor" }} />)
        }

        //TODO this does not send the correct request body or issue in the backend
        else if (menuOpen === "Create-SensorPlatform-Plume") {
            setFormElements(<CreatePlumeSensorPlatform setChanges={setChanges} setMenuOpen={setMenuOpen} submitForm={submitForm}
                requestURL={{ method: "POST", url: process.env.REACT_APP_AIRQUALITY_API_URL + "sensor/plume-sensors" }} />)
        }

        else if (menuOpen === "Create-SensorPlatform-DataIngestionTask") {
            setFormElements(<ScheduleTask setMenuOpen={setMenuOpen} authToken={user.access_token}
                submissionAlert={submissionAlert} setSubmissionAlert={setSubmissionAlert}
                requestURL={{ method: "POST", url: process.env.REACT_APP_AIRQUALITY_API_URL + `api-task/schedule/ingest-bysensorid` }} />)
        }

        //TODO remove this [menuOpen,rowData,requestBody,setRequestBody,setChanges]

        // we only want this to run once when the component is mounted so we use an empty dependency array 
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    async function submitForm(requestBody, requestURL) {

        setSubmissionAlert(CustomAlert("form-info-alert", "Please wait! ", "Submitting your request. This may take a few seconds."))

        const requestOptions = {
            method: requestURL.method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.access_token}`
            },
            body: JSON.stringify(requestBody)
        };


        await fetch(requestURL.url, requestOptions).then(
            async response => {
                // if successful then return the response
                if (response.status === 200) {
                    setSubmissionAlert(CustomAlert("form-success-alert", "Success! ", "The request was processed successfully, Please close this panel and refresh the page to see the changes."))
                    // setFormElements(null)
                    setChanges(false)
                    setTableRefresh(true)
                    return;
                }
                else if (response.status === 409) {
                    setSubmissionAlert(CustomAlert("form-warning-alert", "Warning! ", "There was a conflict with the request. Please check the data and try again", await response.text()))
                    return;
                }

                else {
                    setSubmissionAlert(CustomAlert("form-error-alert", "Error! ", "The request was sent unsuccessfully.", await response.text()))
                    return;
                }
            })
    }


    return (
        <form className="form-container">
            {submissionAlert}
            {formElements}
        </form>
    )
}




export default FormContainer