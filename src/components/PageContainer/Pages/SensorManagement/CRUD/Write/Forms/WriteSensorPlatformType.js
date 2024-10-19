import {useState,useEffect} from 'react'
import handleChange from '../../SharedComponents/handleChange';
import CustomFadingAlert from '../../../../SharedComponents/CustomFadingAlert';

const WriteSensorPlatformType  = ({rowData,setChanges,setMenuOpen,requestURL, submitForm}) => {
    
    const formData = {
        name : rowData.name ? rowData.name : "",
        description : rowData.description ? rowData.description : "",
        properties : rowData.properties ? JSON.stringify(rowData.properties) : ""
    }
    
    const [state, setState] = useState(formData);
    const [alertMessage, setAlertMessage] = useState('');
    const [nameTransition , setNameTransition] = useState(false);
    const [descriptionTransition , setDescriptionTransition] = useState(false);
    const [propertiesTransition , setPropertiesTransition] = useState(false);
    const [loading, setLoading] = useState(false);
    
    function validateForm() {

        // setRequestBody(null)

        if (!state.name || !state.description || !state.properties) {
            setAlertMessage('Missing required fields');
            if (!state.name) {
                setNameTransition(true);
            }
            if (!state.description) {
                setDescriptionTransition(true);
            }
            if(!state.properties){
                setPropertiesTransition(true);
            }
   
            return false;
        }

        //if properties is not empty, try to parse it
        try{
            state.properties = JSON.parse(`${state.properties}`);
        }
        catch(e){
            setAlertMessage('Invalid JSON format');
            setPropertiesTransition(true);
            return false;
        }
        

        return true;
    }

    async function handleSubmit(e) {
        e.preventDefault();
       
        if (validateForm()) {
            setLoading(true);
            await submitForm(state,requestURL)
            .finally(() => {setLoading(false)});
        }
                
    }

    useEffect(() => {
        setTimeout(() => {
            setNameTransition(false);
            setDescriptionTransition(false);
            setPropertiesTransition(false);
        }, 8000); //8 seconds
    }, [nameTransition,descriptionTransition])


    return(
        <>
        {alertMessage && <CustomFadingAlert message={alertMessage} setAlertMessage={setAlertMessage} status="error"/>}     
            <div className="mb-4">
                <label className="form-label">
                    Name*
                </label>
                <input className={`form-input ${nameTransition ? 'form-input-error': 'form-input-error-fade'}`}
                id="name" type="text"                
                name="name"
                value={state.name}
                onChange={(e) => handleChange(e,setChanges,setState,state,formData)}
                />
            </div>

            <div className="mb-6">
                <label className="form-label">
                    Description*
                </label>
                <textarea className={`form-input h-96 ${descriptionTransition ? 'form-input-error': 'form-input-error-fade'}`}
                id="description" type="text"           
                name="description"
                value={state.description}
                onChange={(e) => handleChange(e,setChanges,setState,state,formData)}
                />
            </div>

            <div className="mb-4">
                <label className="form-label">
                    Properties*
                </label>
                <textarea className={`form-input h-96 ${propertiesTransition ? 'form-input-error': 'form-input-error-fade'}`}
                id="properties" type="text"
                name="properties"
                value={state.properties}
                onChange={(e) => handleChange(e,setChanges,setState,state,formData)}
                />
            </div>
            
            {/* form buttons */}
            <div className="flex items-center justify-between">
                <button onClick={() => setMenuOpen(false)} disabled={loading}  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                    Cancel
                </button> 
                <button onClick={handleSubmit} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                    Save
                </button>
            </div>

        </> 
    )
}

export default WriteSensorPlatformType