
//  custom hook that we created

import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

// wrap the application so that we can access this value in any component
// child component also get this values
export const AuthProvider = ({children}) => {
    const [currentUser, setCurrentUser] = useState(null);
    useEffect(() => {
        const userId = localStorage.getItem("userId");

        if(userId) {
            setCurrentUser(userId);
        };
    }, []);

    const value = {
        currentUser, setCurrentUser
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
};