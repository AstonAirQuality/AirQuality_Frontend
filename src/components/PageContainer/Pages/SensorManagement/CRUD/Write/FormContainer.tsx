import WriteSensorPlatformType from './Forms/WriteSensorPlatformType.tsx'
import WriteSensorPlatform from './Forms/WriteSensorPlatform.tsx'
import CreatePlumeSensorPlatform from './Forms/CreatePlumeSensorPlatform.tsx'
import ScheduleTask from './ScheduleTask/ScheduleTask.tsx'
import WriteSensorPlatformConfig from './Forms/WriteSensorPlatformConfig.tsx'
import CustomAlert from '../../../SharedComponents/CustomAlert.tsx'
import { useState, useEffect, ReactNode } from 'react'
import { UserAuth } from '../../../../../context/AuthContext.tsx'

import { Dispatch, SetStateAction } from 'react'

interface FormContainerProps {
    menuOpen: string | null
    setMenuOpen: (open: string) => void;
    rowData: any
    setChanges: Dispatch<SetStateAction<boolean>>
    setTableRefresh: (refresh: boolean) => void
}

export type RequestMethod = { method: string; url: string };

const FormContainer: React.FC<FormContainerProps> = ({
    menuOpen,
    setMenuOpen,
    rowData,
    setChanges,
    setTableRefresh
}) => {

    const [formElements, setFormElements] = useState<ReactNode>(null)
    const [submissionAlert, setSubmissionAlert] = useState<ReactNode>(null)
    const { user } = UserAuth() || {};

    // This hook triggers once when component is mounted
    useEffect(() => {
        if (menuOpen === "Edit-sensor-platform-type") {
            setFormElements(
                <WriteSensorPlatformType
                    rowData={rowData}
                    setChanges={setChanges}
                    setMenuOpen={setMenuOpen}
                    submitForm={submitForm}
                    requestMethod={{
                        method: "PUT",
                        url: `${process.env.REACT_APP_AIRQUALITY_API_URL}sensor-platform-type/${rowData.id}`
                    }}
                />
            )
        }
        else if (menuOpen === "Create-sensor-platform-type") {
            setFormElements(
                <WriteSensorPlatformType
                    rowData={{}}
                    setChanges={setChanges}
                    setMenuOpen={setMenuOpen}
                    submitForm={submitForm}
                    requestMethod={{
                        method: "POST",
                        url: `${process.env.REACT_APP_AIRQUALITY_API_URL}sensor-platform-type`
                    }}
                />
            )
        }
        else if (menuOpen === "Edit-sensor-platform") {
            setFormElements(
                <WriteSensorPlatform
                    rowData={rowData}
                    setChanges={setChanges}
                    setMenuOpen={setMenuOpen}
                    submitForm={submitForm}
                    requestMethod={{
                        method: "PUT",
                        url: `${process.env.REACT_APP_AIRQUALITY_API_URL}sensor-platform/${rowData.id}`
                    }}
                />
            )
        }
        else if (menuOpen === "Create-sensor-platform") {
            setFormElements(
                <WriteSensorPlatform
                    rowData={{}}
                    setChanges={setChanges}
                    setMenuOpen={setMenuOpen}
                    submitForm={submitForm}
                    requestMethod={{
                        method: "POST",
                        url: `${process.env.REACT_APP_AIRQUALITY_API_URL}sensor-platform`
                    }}
                />
            )
        }
        // TODO this does not send the correct request body or issue in the backend
        else if (menuOpen === "Create-sensor-platform-Plume") {
            setFormElements(
                <CreatePlumeSensorPlatform
                    setChanges={setChanges}
                    setMenuOpen={setMenuOpen}
                    submitForm={submitForm}
                    requestMethod={{
                        method: "POST",
                        url: `${process.env.REACT_APP_AIRQUALITY_API_URL}sensor-platform/plume-sensors`
                    }}
                />
            )
        }
        else if (menuOpen === "Create-sensor-platform-DataIngestionTask") {
            setFormElements(
                <ScheduleTask
                    setMenuOpen={setMenuOpen}
                    setSubmissionAlert={setSubmissionAlert}
                    requestMethod={{
                        method: "POST",
                        url: `${process.env.REACT_APP_AIRQUALITY_API_URL}api-task/schedule/ingest-bysensorid`
                    }}
                />
            )
        }
        else if (menuOpen === "Edit-sensor-platform-config") {
            setFormElements(
                <WriteSensorPlatformConfig
                    rowData={rowData}
                    setChanges={setChanges}
                    setMenuOpen={setMenuOpen}
                    submitForm={submitForm}
                    requestMethod={{
                        method: "PUT",
                        url: `${process.env.REACT_APP_AIRQUALITY_API_URL}sensor-platform-config/${rowData.id}`
                    }}
                />
            )
        }
        else if (menuOpen === "Create-sensor-platform-config") {
            setFormElements(
                <WriteSensorPlatformConfig
                    rowData={{}}
                    setChanges={setChanges}
                    setMenuOpen={setMenuOpen}
                    submitForm={submitForm}
                    requestMethod={{
                        method: "POST",
                        url: `${process.env.REACT_APP_AIRQUALITY_API_URL}sensor-platform-config`
                    }}
                />
            )
        }
        // realistically this should never happen, but we handle it just in case
        else{
            console.warn("Unknown menuOpen value:", menuOpen);
            setFormElements(
                <div className="text-center text-gray-500">
                    Unimplemented form for {menuOpen}
                </div>
            );
        }
    // We only want this to run once when the component is mounted so we use an empty dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, [])

    async function submitForm(requestBody: any, requestMethod: RequestMethod) {
        setSubmissionAlert(
            <CustomAlert
                alertStyle="form-info-alert"
                status="Please wait! "
                message="Submitting your request. This may take a few seconds."
                responseBody=""
            />
        );

        const requestOptions: RequestInit = {
            method: requestMethod.method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user?.access_token}`
            },
            body: JSON.stringify(requestBody)
        };

        try {
            const response = await fetch(requestMethod.url, requestOptions);
            if (response.ok) {
                setSubmissionAlert(
                    <CustomAlert
                        alertStyle="form-success-alert"
                        status="Success! "
                        message="The request was processed successfully, Please close this panel and refresh the page to see the changes."
                        responseBody=""
                    />
                );
                setChanges(false);
                setTableRefresh(true);
                return;
            } else if (response.status === 409) {
                setSubmissionAlert(
                    <CustomAlert
                        alertStyle="form-warning-alert"
                        status="Warning! "
                        message="There was a conflict with the request. Please check the data and try again"
                        responseBody={await response.text()}
                    />
                );
                return;
            } else {
                setSubmissionAlert(
                    <CustomAlert
                        alertStyle="form-error-alert"
                        status="Error! "
                        message="The request was sent unsuccessfully."
                        responseBody={await response.text()}
                    />
                );
                return;
            }
        } catch (error: any) {
            setSubmissionAlert(
                <CustomAlert
                    alertStyle="form-error-alert"
                    status="Error! "
                    message="An unexpected error occurred."
                    responseBody={error.message || String(error)}
                />
            );
        }
    }

    return (
        <div className="form-container">
            {submissionAlert}
            {formElements}
        </div>
    )
}

export default FormContainer