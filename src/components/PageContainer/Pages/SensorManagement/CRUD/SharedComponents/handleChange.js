
/**
* Function to handle changes in the form and pass the state to parent components
* @author   Riyad K Rahman
* @param   {Object} e    event
* @param   {Object} setChanges  function to set the changes state (used for the confirm close modal only)
* @param   {Object} setState    function to set the input fields state
* @param   {Object} state       dictionary which holds the values the input fields
* @param   {Object} formData    dictionary which holds the default values for the input fields
*/
function handleChange(e,setChanges,setState,state,formData) {
    const value = (e.target.type === "checkbox") ? e.target.checked : e.target.value;
    setState({...state,[e.target.name]: value});

    if (state !== formData) {
        setChanges(true)
    }
    else {
        setChanges(false)
    }
    
}

export default handleChange