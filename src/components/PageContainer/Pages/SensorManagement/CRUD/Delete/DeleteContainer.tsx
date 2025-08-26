import { VscClose } from "react-icons/vsc";
import { useState, useEffect, MouseEvent, ReactNode } from "react";
import CustomAlert from '../../../SharedComponents/CustomAlert.tsx';
import { UserAuth } from "../../../../../context/AuthContext.tsx";

interface RowData {
    [key: string]: any;
    id?: string | number;
}

interface DeleteContainerProps {
    menuOpen: string;
    setMenuOpen: (value: string) => void;
    rowData: RowData | null;
    setTableRefresh: (value: boolean) => void;
}

interface RequestMethod {
    method: string;
    url: string;
}

const DeleteContainer: React.FC<DeleteContainerProps> = ({
    menuOpen,
    setMenuOpen,
    rowData,
    setTableRefresh,
}) => {
    const [submissionAlert, setSubmissionAlert] = useState<ReactNode | null>(null);
    const [requestMethod, setRequestMethod] = useState<RequestMethod>({ method: "", url: "" });
    const { user } = UserAuth() || {};;

    function handleClose(e: MouseEvent<HTMLDivElement>) {
        if ((e.target as HTMLDivElement).id === "modal") {
            setMenuOpen("false");
        }
    }

    useEffect(() => {
        setSubmissionAlert(null);
        if (rowData !== null) {
            if (menuOpen === "Delete-sensor-platform-type") {
                setRequestMethod({
                    method: "DELETE",
                    url: `${process.env.REACT_APP_AIRQUALITY_API_URL}sensor-type/${rowData.id}`,
                });
            } else if (menuOpen === "Delete-sensor-platform") {
                setRequestMethod({
                    method: "DELETE",
                    url: `${process.env.REACT_APP_AIRQUALITY_API_URL}sensor/${rowData.id}`,
                });
            }
            else if (menuOpen === "Delete-observable-property") {
                setRequestMethod({
                    method: "DELETE",
                    url: `${process.env.REACT_APP_AIRQUALITY_API_URL}observable-property/${rowData.name}`,
                });
            }
            else if (menuOpen === "Delete-unit-of-measurement") {
                setRequestMethod({
                    method: "DELETE",
                    url: `${process.env.REACT_APP_AIRQUALITY_API_URL}unit-of-measurement/${rowData.name}`,
                });
            }
            else if (menuOpen === "Delete-sensor-platform-config") {
                setRequestMethod({
                    method: "DELETE",
                    url: `${process.env.REACT_APP_AIRQUALITY_API_URL}sensor-platform-config/${rowData.sensor_type_id}`,
                });
            }
        }
    }, [menuOpen, rowData]);

    async function submitForm() {
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
                "Content-Type": "application/json",
                Authorization: `Bearer ${user?.access_token}`,
            },
        };

        try {
            const response = await fetch(requestMethod.url, requestOptions);
            if (response.ok) {
                setSubmissionAlert(
                    <CustomAlert
                        alertStyle="form-success-alert"
                        status="Success! "
                        message="The request was processed successfully. Please close this panel and refresh the page to see the changes."
                        responseBody=""
                    />
                );
                setTableRefresh(true);
            } else {
                setSubmissionAlert(
                    <CustomAlert
                        alertStyle="form-error-alert"
                        status="Error! "
                        message="The request was unsuccessful"
                        responseBody=""
                    />
                );
            }
        } catch (error) {
            setSubmissionAlert(
                <CustomAlert
                    alertStyle="form-error-alert"
                    status="Error! "
                    message="An error occurred while processing your request."
                    responseBody={error instanceof Error ? error.message : String(error)}
                />
            );
        }
    }

    if (menuOpen && menuOpen.includes("Delete")) {
        return (
            <div id="modal" onClick={handleClose} className="modal-container">
                <div className="absolute w-full inset-x-0 top-0">{submissionAlert}</div>

                <div className="modal">
                    <div className="flex justify-between items-center p-5 rounded-t border-b dark:border-gray-600">
                        <h1 className="text-xl font-semibold text-gray-500 dark:text-gray-400">
                            Delete?
                        </h1>
                        <button
                            onClick={() => setMenuOpen("false")}
                            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                        >
                            <VscClose size={32} />
                        </button>
                    </div>

                    <div className="p-2">
                        <h5 className="text-m font-semibold text-gray-500 dark:text-gray-400">
                            Are you sure you want to delete this row:
                        </h5>
                        {rowData &&
                            Object.entries(rowData).map(([header, value], key) => (
                                <li className="form-label overflow-x-hidden" key={key}>
                                    {header}: {JSON.stringify(value)}
                                </li>
                            ))}
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => submitForm()}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="button"
                        >
                            Yes
                        </button>

                        <button
                            onClick={() => setMenuOpen("false")}
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="button"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export default DeleteContainer;