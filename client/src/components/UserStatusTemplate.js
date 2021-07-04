import React, {useContext} from 'react';
import './stylesheet/UserStatusTemplate.css';
import {AuthContext} from '../context/AuthContext';
import { Icon } from 'semantic-ui-react';
import axios from 'axios';


export default function UserStatusTemplate() {
    const {user, setUser} = useContext(AuthContext);

    const logout = () =>{
        axios.post('http://localhost:5000/log-out', {}, {withCredentials: true})
        .then(res=>{
            if(res.data){
                setUser(null);
            }else{
                alert('Cannot logout');
                console.log(res);
            }

        }).catch(err=>{
            alert('Cannot logout');
            console.log(err);
        })
    }

    return (
        <div className="container">
            <div className="content-wrapper">
                <div>
                    <h3>Welcome <span className="name">{user && user.name}</span></h3>
                    <p>Your account status is <span className={user && user.isAllowed}>{user && user.isAllowed}</span> . Contact <b>Admin</b> to continue.</p>
                    <Icon name="log out" onClick={()=>logout()} style={{cursor: "pointer", padding: "5px"}}>Logout</Icon>
                </div>
            </div>
        </div>
    )
}
