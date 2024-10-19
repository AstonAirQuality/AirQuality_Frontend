import { useContext, createContext } from "react";
import React, {useState,useEffect} from 'react';
import {auth} from '../../firebaseConfig';
import {onIdTokenChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, deleteUser, signInWithPopup, GoogleAuthProvider} from 'firebase/auth';

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {

    //hooks
    const [user , setUser] = useState(JSON.parse(window.sessionStorage.getItem("user")));
    const [loading, setLoading] = useState(true);
    
    async function GoogleAuthentication(authMethod) {
        const provider = new GoogleAuthProvider();

        let result = true
        let token = ""
        let username = ""

        await signInWithPopup(auth, provider).then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            token = result.user.accessToken;
            username = result.user.displayName;
        }).catch((error) => {
            // Handle Errors here.
            console.log(error.message);
            result = error;
        });

        //if no errors then authenticate to app
        if (token !== "") {
            if (authMethod === "register") {
                await appSignup(token,username).catch((error) => {
                    //delete the user from firebase if the app signup fails
                    // deleteUser(auth.currentUser);
                    console.log(error.message);
                    result = error.message;
                })
            }
            else {
                await appLogin(token).catch((error) => {
                    console.log(error.message);
                    result = error.message;
                })
            }
        }

        return result;
    }
    
    async function firebaseSignup(email,username,password) {
        //TODO - encrypt password here

        let result = true
        let token = "" 
        await createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
            token = userCredential._tokenResponse.idToken;
        }).catch((error) => {
            console.log(error.message);
            result = error;
        })
        
        //if no errors then login to app
        if (token !== "") {
            await appSignup(token,username).catch((error) => {
                //delete the user from firebase if the app signup fails
                deleteUser(auth.currentUser);
                console.log(error.message);
                result = error.message;
            })
        }

        return result;
    }

    async function firebaseLogin(email, password) {
        //TODO - encrypt password here
        
        let result = true
        let token = ""
        await signInWithEmailAndPassword(auth,email, password).then((userCredential) => {
            token = userCredential._tokenResponse.idToken;
        }).catch((error) => {
            console.log(error.message);
            result = "(" + error.message.split("/")[1];
        })

        //if no errors then login to app
        if (token !== "") {
            await appLogin(token).catch((error) => {
                console.log(error.message);
                result = error.message;
            })
        }

        return result;
    }

    async function appSignup(token,username) {     
        //TODO comment
        await fetch(process.env.REACT_APP_AIRQUALITY_API_URL + "auth/signup?username=" + username
        ,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'firebase-token': token
            },
            
        }).then(async response => {
            if (response.status === 200) {
                const data = await response.json();
                data["refresh_token"] = token;
                window.sessionStorage.setItem("user", JSON.stringify(data));
                setUser(data);
                // setUser(await response.json());
            }
            //if any error occur during registration then delete the firebase user 
            else if (response.status >= 401 && response.status <= 409){
                const data = await response.json();
                throw new Error(data.detail);
            }
            else {
                throw new Error('Error signing up');
            }
        })

    }

    async function appLogin(token) {
        //TODO comment
        await fetch(process.env.REACT_APP_AIRQUALITY_API_URL + "auth/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'firebase-token': token
            },
        }).then(async response => {
            if (response.status === 200) {
                const data = await response.json();
                data["refresh_token"] = token;
                window.sessionStorage.setItem("user", JSON.stringify(data));
                setUser(data);
                // setUser(await response.json())
            }
            else if (response.status === 401){
                const data = await response.json();
                throw new Error(data.detail);
            }
            else {
                throw new Error('Error signing in');
            }
        })
    }

    
    async function deleteAccount() {
        await fetch(process.env.REACT_APP_AIRQUALITY_API_URL + "auth/user-account", {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + user.access_token,
                'firebase-token': user.refresh_token
            }
        }).then(async response => {

            if (response.status === 200) {
                await signOut(auth);
                window.sessionStorage.removeItem("user");
                setUser(null);
            }
            else {
                throw new Error('Error deleting account');
            }
        })
    }

    async function firebasePasswordReset(email) {
        await sendPasswordResetEmail(auth, email)
    }

    //TODO maybe delete this function
    function forceTokenRefresh() {
        auth.currentUser?.getIdToken(true);
    }

    function logout() {
        signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onIdTokenChanged(auth, async(currentUser) =>{
            // if there's no firebase user, set the firebase user to null
            if(!currentUser){
                window.sessionStorage.removeItem("user");
                setUser(null);
            }
            else{
                // check if the old firebase token is different from the new one. If it is, then refresh the api token
                if (currentUser.stsTokenManager.accessToken !== user?.refresh_token) {
                    console.log("refreshing token")
                    await appLogin(currentUser.stsTokenManager.accessToken);
                }
            }

            setLoading(false);
        })
        
        return () => {
            unsubscribe();
        }
    },[user])



   
    return (
        <AuthContext.Provider value = {{user, GoogleAuthentication, firebaseSignup,firebaseLogin,logout,forceTokenRefresh,firebasePasswordReset,deleteAccount}}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const UserAuth = () => {
    return useContext(AuthContext);
}