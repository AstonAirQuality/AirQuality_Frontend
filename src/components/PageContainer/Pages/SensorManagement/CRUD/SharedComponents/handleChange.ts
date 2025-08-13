import React from "react";

/**
 * Function to handle changes in the form and pass the state to parent components
 * @param e         React.ChangeEvent<HTMLInputElement>
 * @param setChanges  function to set the changes state (used for the confirm close modal only)
 * @param setState    function to set the input fields state
 * @param state       dictionary which holds the values the input fields
 * @param formData    dictionary which holds the default values for the input fields
 */
function handleChange<T extends Record<string, any>>(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    setChanges: React.Dispatch<React.SetStateAction<boolean>>,
    setState: React.Dispatch<React.SetStateAction<T>>,
    state: T,
    formData: T
) {
    let value: any;
    if (e.target instanceof HTMLInputElement && e.target.type === "checkbox") {
        value = e.target.checked;
    } else {
        value = e.target.value;
    }
    setState({ ...state, [e.target.name]: value });

    // Compare shallow equality
    const isChanged = Object.keys(formData).some(
        key => state[key] !== formData[key]
    );
    setChanges(isChanged);
}

export default handleChange;