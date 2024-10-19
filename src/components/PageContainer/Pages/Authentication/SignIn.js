import {useState, useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {UserAuth} from '../../../context/AuthContext';
import CustomFadingAlert from '../SharedComponents/CustomFadingAlert';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordTransition , setPasswordTransition] = useState(false);
    const [emailTransition , setEmailTransition] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const {firebaseLogin,GoogleAuthentication} = UserAuth();
    const navigate = useNavigate();

    async function submitForm(e) {
        e.preventDefault();

        //TODO validate form data

        if (!password || !email) {
            setAlertMessage('Missing required fields');
            if (!password) {
                setPasswordTransition(true);
            }
            if (!email) {
                setEmailTransition(true);
            }
            return;
        }

        if (email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i) === null) {
            setAlertMessage('Email is invalid');
            setEmailTransition(true);
            return;
        }
        
        
        setAlertMessage('');
        setLoading(true);
        await firebaseLogin(email,password).then((result) => {
            if(result === true){
                navigate('/');
            }
            else{
                setAlertMessage(result);
            }
            setLoading(false);
        });
    }

    async function LoginWithGoogle(e){
        e.preventDefault();
        await GoogleAuthentication("login").then((result) => {
            if(result === true){
                navigate('/');
            }
            else{
                setAlertMessage(result);
            }
            setLoading(false);
        });
    }

    useEffect(() => {
        setTimeout(() => {
            setPasswordTransition(false);
            setEmailTransition(false);
        }, 8000); //8 seconds
    }, [passwordTransition,emailTransition])


    return (
        <div className="page">
            <div className="login-container">
                <div className="login-form-container">
                    <h1 className='login-title'>Sign in</h1>
                    {alertMessage && <CustomFadingAlert message={alertMessage} setAlertMessage={setAlertMessage} status="error"/>}
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

                            <div className="w-full">
                                <label className="form-label">
                                    Password*
                                </label>
                                <input className= {`form-input ${passwordTransition ? 'form-input-error': 'form-input-error-fade'}`}
                                id="password" type="password"           
                                name="password"
                                onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>  
                            <Link className="login-forgot-password" to="/forgot-password">Forgot Password?</Link>
                    </form>

                    <button onClick={submitForm} disabled={loading}
                    type="submit"
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full mb-4">
                        Sign in
                    </button>

                    <Link className="login-forgot-password" to="/register">Create new account</Link>

                    <div className="inline-flex justify-center items-center w-full">
                        <hr className="my-8 w-64 h-px bg-gray-200 border-0 dark:bg-gray-700"/>
                        <span className="absolute left-1/2 px-3 font-medium text-gray-900 bg-white -translate-x-1/2 dark:text-white dark:bg-gray-900">or</span>
                    </div>

                    <div className="flex flex-row w-full">
                        <button onClick={(e) => LoginWithGoogle(e)} disabled={loading}
                        className="bg-cyan-500 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full mb-4" type="submit">
                        Sign in With Google
                        </button>
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full mb-4" type="submit">
                        Sign in With Facebook
                        </button>
                        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full mb-4" type="submit">
                        Sign in With Apple
                        </button>
                    </div>
                  
                </div>
            </div>
        </div>
    );
}


export default Login;