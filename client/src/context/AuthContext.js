import React , { createContext, useState, useEffect } from 'react';

import axios from 'axios';

export const AuthContext = createContext();

export default function AuthContextProvider (props) {
   const [isAppReady, setAppReady] = useState(false);
   const [errors, setErrors] = useState(true);
   const [user, setUser] = useState(null);

   const [isActive, setActive] = useState(user?true:false);

   function getUserLoggedInStatus(){

    axios.post('http://localhost:5000/check-authenticated-status',
     {},
     {withCredentials: true})
    // fetch('http://localhost:5000/check-authenticated-status', {
    //     cache: "no-cache",
    //     credentials: 'include',
    //     method: "POST"
    // })
    .then(res=>{
        if(res.status === 200){
            return res.data;
        }else{
            console.log({status: res.status});
            throw Error('Error fetching data');
        }
    })
    // .then((res)=>{
    //     console.log(res);
    //     if(res.status===200)
    //         return res.json();
    //     else{
    //         throw Error('Error Fetching data from server.')
    //     }
        
    // })
    .then((user)=>{
        setUser(user);
        setAppReady(true);
        setErrors(false);

    }).catch(err=>{
        console.log(err)
        setAppReady(true);
        setErrors({errorName: "Network error", description: "Error connecting to server. Please check network connction."})
    });

    //set auto refresh
    
   }

   //same as componentDidMount
   useEffect(()=>{
    function silentRefresh(){
        if(user){
         axios.post('http://localhost:5000/refresh-token', {}, {withCredentials: true})
         .then(res=>{console.log(res)
             if(res.data){
                 if(res.data.response_status === 1000 || res.data.response_status === 1001)
                     setActive(res.data.isActive || false);
                 else console.log('token refresh fails');
             }else{
                 throw Error('Empty Server Response , (server error...)');
             }
         })
         .catch(e=>console.log(e));
        }
    }
       
       if(user){
           console.log('refreshed');
           setInterval(silentRefresh, 1000*60*7);
           setActive(true);
        }
   }, [user]);

   useEffect(()=>{
        //for loading simulation
       //remove when fetching for different network
    setTimeout(getUserLoggedInStatus, 100);
   }, [])

    if(!isAppReady){
        return (
            <div className="fullscreen-loader">
                <div className="c1"></div>
                <div className="c2"></div>
            </div>
        )
    }
    if(errors){
        return (
            <div className="fullscreen-error">
                <div>
                    {errors.name}
                </div>
                <div>
                    {errors.description}
                </div>
            </div>
        )
    }

    return (
        <AuthContext.Provider value={{errors, user, setUser, isActive}} >
            {props.children}
        </AuthContext.Provider>
    );
}