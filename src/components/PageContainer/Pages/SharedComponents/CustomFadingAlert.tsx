import { HiInformationCircle } from 'react-icons/hi';
import { useState, useEffect, Dispatch, SetStateAction } from 'react';

interface CustomFadingAlertProps {
    message: string | [string, string];
    setAlertMessage: Dispatch<SetStateAction<"" | [string, string] | string>>;
    status: string;
}

const CustomFadingAlert: React.FC<CustomFadingAlertProps> = ({ message, setAlertMessage, status }) => {
    const [transition, setTransition] = useState(true);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setTransition(false);
        }, 8000); // 8 seconds
        return () => clearTimeout(timeout);
    }, []);

    function closeAlert() {
        setAlertMessage('');
    }

    return (
        <div
            role="alert"
            className={`form-${status}-alert ${transition ? 'form-alert-shown' : 'form-alert-hidden'}`}
            onClick={closeAlert}
            onTransitionEnd={closeAlert}
        >
            <HiInformationCircle size={28} className="flex-shrink-0 inline w-5 h-5 mr-3" />
            <div>
                <span className="font-medium">
                    {status}: {message}
                </span>
            </div>
        </div>
    );
};

export default CustomFadingAlert;