import { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserAuth } from '../../../context/AuthContext.tsx';
import CustomFadingAlert from '../SharedComponents/CustomFadingAlert.tsx';

const Register: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [passwordTransition, setPasswordTransition] = useState<boolean>(false);
    const [emailTransition, setEmailTransition] = useState<boolean>(false);
    const [usernameTransition, setUsernameTransition] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState<'' | [string, string] | string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const { firebaseSignup, GoogleAuthentication } = UserAuth();
    const navigate = useNavigate();

    async function submitForm(e: FormEvent) {
        e.preventDefault();

        if (!password || !email || !username) {
            setAlertMessage('Missing required fields');
            if (!password) setPasswordTransition(true);
            if (!email) setEmailTransition(true);
            if (!username) setUsernameTransition(true);
            return;
        }

        if (
            password.match(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            ) === null
        ) {
            setAlertMessage(
                'Password be minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character'
            );
            setPasswordTransition(true);
            return;
        }

        if (username.length < 3) {
            setAlertMessage('Username must be at least 3 characters');
            setUsernameTransition(true);
            return;
        } else if (username.match(/^[a-zA-Z]+$/) === null) {
            setAlertMessage('Username must be only letters');
            setUsernameTransition(true);
            return;
        } else if (
            username === 'None' ||
            username === 'none' ||
            username === 'NONE' ||
            username === 'null' ||
            username === 'NULL'
        ) {
            setAlertMessage('Username cannot be keyword None or null');
            setUsernameTransition(true);
            return;
        }

        if (email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i) === null) {
            setAlertMessage('Email is invalid');
            setEmailTransition(true);
            return;
        }

        setAlertMessage('');
        setLoading(true);
        await firebaseSignup(email, username, password).then((result: string | true | Error) => {
            if (result === true) {
                navigate('/');
            } else if (result instanceof Error) {
                setAlertMessage(result.message);
            } else {
                setAlertMessage(result as string);
            }
            setLoading(false);
        });
    }

    async function RegisterWithGoogle(e: FormEvent) {
        e.preventDefault();
        await GoogleAuthentication('register').then((result: string | true | Error) => {
            if (result === true) {
                navigate('/');
            } else if (result instanceof Error) {
                setAlertMessage(result.message);
            } else {
                setAlertMessage(result as string);
            }
            setLoading(false);
        });
    }

    useEffect(() => {
        const timeout = setTimeout(() => {
            setPasswordTransition(false);
            setEmailTransition(false);
            setUsernameTransition(false);
        }, 8000);
        return () => clearTimeout(timeout);
    }, [passwordTransition, emailTransition, usernameTransition]);

    return (
        <div className="page">
            <div className="login-container">
                <div className="login-form-container">
                    <h1 className="login-title">Register a new account</h1>
                    {alertMessage && (
                        <CustomFadingAlert
                            message={alertMessage}
                            setAlertMessage={setAlertMessage}
                            status="error"
                        />
                    )}
                    <form className="login-form">
                        <div className="mb-4 w-full">
                            <label className="form-label">Email*</label>
                            <input
                                className={`form-input ${
                                    emailTransition ? 'form-input-error' : 'form-input-error-fade'
                                }`}
                                id="email"
                                type="email"
                                name="email"
                                onChange={e => setEmail(e.target.value.toLowerCase())}
                            />
                        </div>

                        <div className="mb-4 w-full">
                            <label className="form-label">username*</label>
                            <input
                                className={`form-input ${
                                    usernameTransition ? 'form-input-error' : 'form-input-error-fade'
                                }`}
                                id="displayName"
                                type="text"
                                name="displayName"
                                onChange={e => setUsername(e.target.value)}
                            />
                        </div>

                        <div className="w-full">
                            <label className="form-label">Password*</label>
                            <input
                                className={`form-input ${
                                    passwordTransition ? 'form-input-error' : 'form-input-error-fade'
                                }`}
                                id="password"
                                type="password"
                                name="password"
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                    </form>

                    <button
                        onClick={submitForm}
                        disabled={loading}
                        type="submit"
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full mb-4"
                    >
                        Sign up
                    </button>

                    <Link className="login-forgot-password" to="/signin">
                        Already have an account?
                    </Link>

                    <div className="inline-flex justify-center items-center w-full">
                        <hr className="my-8 w-64 h-px bg-gray-200 border-0 dark:bg-gray-700" />
                        <span className="absolute left-1/2 px-3 font-medium text-gray-900 bg-white -translate-x-1/2 dark:text-white dark:bg-gray-900">
                            or
                        </span>
                    </div>

                    <div className="flex flex-row w-full space-x-2">
                        <button
                            onClick={RegisterWithGoogle}
                            disabled={loading}
                            className="bg-cyan-500 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full mb-4"
                            type="button"
                        >
                            Sign up With Google
                        </button>
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full mb-4"
                            type="button"
                        >
                            Sign up With Facebook
                        </button>
                        <button
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full mb-4"
                            type="button"
                        >
                            Sign up With Apple
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;