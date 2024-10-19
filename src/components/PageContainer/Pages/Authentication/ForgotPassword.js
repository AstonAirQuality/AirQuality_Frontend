import {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import {UserAuth} from '../../../context/AuthContext';
import CustomFadingAlert from '../SharedComponents/CustomFadingAlert';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [emailTransition , setEmailTransition] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertStatus, setAlertStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const {firebasePasswordReset} = UserAuth();

    async function submitForm(e) {
        e.preventDefault();

        //TODO validate form data

        if (!email) {
            setAlertMessage('Missing required fields');
            setEmailTransition(true);
            return;
        }

        if (email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i) === null) {
            setAlertMessage('Email is invalid');
            setEmailTransition(true);
            return;
        }
        
        
        setAlertMessage('');
        setLoading(true);
        await firebasePasswordReset(email)
        .then(() => {
            setAlertMessage('Password reset email sent');
            setAlertStatus('success');
        })
        .catch((error) => {
            setAlertMessage(error.message);
            setAlertStatus('error');
            setEmailTransition(true);
        })
        .finally(() => {
            setLoading(false);
        })
    }

    useEffect(() => {
        setTimeout(() => {
            setEmailTransition(false);
        }, 8000); //8 seconds
    }, [emailTransition])


    return (
        <div className="page">
            <div className="login-container">
                <div className="login-form-container">
                    <h1 className='login-title'>Forgot Password</h1>
                    {alertMessage && <CustomFadingAlert message={alertMessage} setAlertMessage={setAlertMessage} status={alertStatus}/>}
                    <form className= "login-form">
                            <div className="mb-4 w-full">
                                <label className="form-label">
                                    Email*
                                </label>
                                <input className={`form-input ${emailTransition ? 'form-input-error': 'form-input-error-fade'}`} 
                                id="email" type="email"                
                                name="email"
                                onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                    </form>

                    <button onClick={submitForm} disabled={loading}
                    type="submit"
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full mb-4">
                        Submit
                    </button>

                    <Link className="login-forgot-password" to="/signin">Return to Login</Link>


                </div>
            </div>
        </div>
    );
}


export default ForgotPassword;