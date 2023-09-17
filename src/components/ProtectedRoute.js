import React from 'react'
import { Navigate } from 'react-router-dom';
import { useUserAuth } from '../context/User_auth';
export default function ProtectedRoute({children}) {
  // const props= {...OtherProps};
    let {user} = useUserAuth();
    if(!user){
        return <Navigate to="/Login"/>;
    }
  return children;
}