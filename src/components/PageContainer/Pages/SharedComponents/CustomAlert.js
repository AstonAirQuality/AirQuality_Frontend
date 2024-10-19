import {HiInformationCircle} from 'react-icons/hi'

const CustomAlert = (alertStyle,status,message,responseBody) => (
    <div className={alertStyle} role="alert">
        <HiInformationCircle size="28" className="flex-shrink-0 inline w-5 h-5 mr-3"/>
        <div>
            <span className="font-medium">{status}</span>{message}
            <br/>
            <span className="font-medium">{responseBody}</span>
        </div>
    </div> 
)

export default CustomAlert