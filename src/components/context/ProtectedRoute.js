import {Outlet,Navigate} from 'react-router-dom';
import { UserAuth } from './AuthContext';

export default function ProtectedRoute({role}) {
    const { user } = UserAuth();

    if(role){
        if(Array.isArray(role)){
            return role.includes(user.role) ? <Outlet/> : <Navigate to="/unauthorised" />
        }
        else{
            return (user?.role === role) ? <Outlet /> : <Navigate to="/unauthorised" />;
        }     
    }
    else{
        return user ? <Outlet /> : <Navigate to="/signin" />;
    }
}
