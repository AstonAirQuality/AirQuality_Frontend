import { useContext, createContext, ReactNode } from "react";
import React, { useState, useEffect } from "react";
import { auth } from "../../firebaseConfig";
import {
    onIdTokenChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    deleteUser,
    signInWithPopup,
    GoogleAuthProvider,
    User as FirebaseUser,
} from "firebase/auth";

// Types
interface AuthUser {
    access_token: string;
    refresh_token: string;
    [key: string]: any;
}

interface AuthContextType {
    user: AuthUser | null;
    GoogleAuthentication: (authMethod: string) => Promise<true | string | Error>;
    firebaseSignup: (
        email: string,
        username: string,
        password: string
    ) => Promise<true | string | Error>;
    firebaseLogin: (
        email: string,
        password: string
    ) => Promise<true | string | Error>;
    logout: () => void;
    forceTokenRefresh: () => void;
    firebasePasswordReset: (email: string) => Promise<void>;
    deleteAccount: () => Promise<void>;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<AuthUser | null>(
        JSON.parse(window.sessionStorage.getItem("user") || "null")
    );
    const [loading, setLoading] = useState(true);

    async function GoogleAuthentication(
        authMethod: string
    ): Promise<true | string | Error> {
        const provider = new GoogleAuthProvider();

        let result: true | string | Error = true;
        let token = "";
        let username = "";

        await signInWithPopup(auth, provider)
            .then(async (result) => {
                token = await result.user.getIdToken();
                username = result.user.displayName || "";
            })
            .catch((error) => {
                console.log(error.message);
                result = error;
            });

        if (token !== "") {
            if (authMethod === "register") {
                await appSignup(token, username).catch((error) => {
                    console.log(error.message);
                    result = error.message;
                });
            } else {
                await appLogin(token).catch((error) => {
                    console.log(error.message);
                    result = error.message;
                });
            }
        }

        return result;
    }

    async function firebaseSignup(
        email: string,
        username: string,
        password: string
    ): Promise<true | string | Error> {
        let result: true | string | Error = true;
        let token = "";
        await createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // @ts-ignore
                token = userCredential._tokenResponse.idToken;
            })
            .catch((error) => {
                console.log(error.message);
                result = error;
            });

        if (token !== "") {
            await appSignup(token, username).catch((error) => {
                deleteUser(auth.currentUser!);
                console.log(error.message);
                result = error.message;
            });
        }

        return result;
    }

    async function devLogin(uid: string, role: string): Promise<void> {
        let result: true | string | Error = true;
        let token = "";
        await fetch(
            process.env.REACT_APP_AIRQUALITY_API_URL +
                "auth/dev-login?uid=" +
                uid +
                "&role=" +
                role,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        )
            .then(async (response) => {
                if (response.status === 200) {
                    const data = await response.json();
                    token = data.refresh_token;
                } else {
                    throw new Error("Error logging in");
                }
            })
            .catch((error) => {
                console.log(error.message);
                result = error.message;
            });
    }

    async function firebaseLogin(
        email: string,
        password: string
    ): Promise<true | string | Error> {
        let result: true | string | Error = true;
        let token = "";
        await signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // @ts-ignore
                token = userCredential._tokenResponse.idToken;
            })
            .catch((error) => {
                console.log(error.message);
                result = "(" + error.message.split("/")[1];
            });

        if (token !== "") {
            await appLogin(token).catch((error) => {
                console.log(error.message);
                result = error.message;
            });
        }

        return result;
    }

    async function appSignup(token: string, username: string): Promise<void> {
        await fetch(
            process.env.REACT_APP_AIRQUALITY_API_URL +
                "auth/signup?username=" +
                username,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "firebase-token": token,
                },
            }
        ).then(async (response) => {
            if (response.status === 200) {
                const data = await response.json();
                data["refresh_token"] = token;
                window.sessionStorage.setItem("user", JSON.stringify(data));
                setUser(data);
            } else if (response.status >= 401 && response.status <= 409) {
                const data = await response.json();
                throw new Error(data.detail);
            } else {
                throw new Error("Error signing up");
            }
        });
    }

    async function appLogin(token: string): Promise<void> {
        await fetch(
            process.env.REACT_APP_AIRQUALITY_API_URL + "auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "firebase-token": token,
                },
            }
        ).then(async (response) => {
            if (response.status === 200) {
                const data = await response.json();
                data["refresh_token"] = token;
                window.sessionStorage.setItem("user", JSON.stringify(data));
                setUser(data);
            } else if (response.status === 401) {
                const data = await response.json();
                throw new Error(data.detail);
            } else {
                throw new Error("Error signing in");
            }
        });
    }

    async function deleteAccount(): Promise<void> {
        await fetch(
            process.env.REACT_APP_AIRQUALITY_API_URL + "auth/user-account",
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: user?.access_token ? "Bearer " + user?.access_token : "",
                    "firebase-token": user?.refresh_token ?? "",
                },
            }
        ).then(async (response) => {
            if (response.status === 200) {
                await signOut(auth);
                window.sessionStorage.removeItem("user");
                setUser(null);
            } else {
                throw new Error("Error deleting account");
            }
        });
    }

    async function firebasePasswordReset(email: string): Promise<void> {
        await sendPasswordResetEmail(auth, email);
    }

    function forceTokenRefresh(): void {
        auth.currentUser?.getIdToken(true);
    }

    function logout(): void {
        signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
            if (!currentUser) {
                window.sessionStorage.removeItem("user");
                setUser(null);
            } else {
                const currentToken = await currentUser.getIdToken();
                if (
                    currentToken !== user?.refresh_token
                ) {
                    console.log("refreshing token");
                    await appLogin(currentToken);
                }
            }

            setLoading(false);
        });

        return () => {
            unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    return (
        <AuthContext.Provider
            value={{
                user,
                GoogleAuthentication,
                firebaseSignup,
                firebaseLogin,
                logout,
                forceTokenRefresh,
                firebasePasswordReset,
                deleteAccount,
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const UserAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("UserAuth must be used within an AuthContextProvider");
    }
    return context;
};