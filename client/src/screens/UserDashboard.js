import React, { useContext, useState } from 'react';
import axios from 'axios';
import { Redirect, useLocation, Link} from 'react-router-dom';

// import '../admin.css';

import {Icon, Modal, Message, Grid} from 'semantic-ui-react';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';
// import UserDefault from '../components/UserDefault';
import Default from '../components/Default';
import CellTemplate from '../components/CellTemplate';


export default function AdminDashboard() {

    const location = useLocation();

    const { user, isActive, setUser } = useContext(AuthContext);

    //get component name from url

    let urlComponent = location.pathname.split('/');
    let componentName = urlComponent[3] || 'default';

    const [isVisibleLogoutButton,  toggleLogoutButton] = useState(false);

    const logoutUser = () => {
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

    //component to render (if parameter doesnot contain any of this show 404)
    const component = {
        allowedComponent: ["uploadFile", "default", "viewFile", ...user.role], //array of component name (url freindly);
        // "uploadFile": UserList,
        // "viewFile": AdminDefault,
        "default": Default,
        "cellTemplate": CellTemplate
        
    }
    let ActiveComponent = null;
    if(component.allowedComponent.includes(componentName))
    {
        ActiveComponent = component[user.role.includes(componentName)?'cellTemplate':componentName];
    }
    


    // if(!user){
    //     return <Redirect
    //     to={{
    //         pathname: "/log-in",
    //         state: {
    //           from: {pathname:location.pathname},
    //           message: "Login to continue."
    //         }
    //       }}
    //     />
    // }
    if(user){
        if(user.role && user.role.includes('ADMIN')){
            return <Redirect to="/admin/dashboard" />
        }
    }else{
        return (<Redirect to={{pathname: "/log-in", state: {from: location, message: 'Login to access protected routes'}}} />)
    }
    
    return (

        <div className="dashboard-container">
            {!isActive && (
                <Modal size="mini" open={!isActive} closeOnDimmerClick={false} content="Logged out due to inactivity. &nbsp; Refresh page!" />
            )}

            <Sidebar activeNav={urlComponent[3]} baseUrl={urlComponent[1]} roles={user.role} />
            {/* sidebar ends */}

            <div className="right-panel">
            <header className="dashboard-header">
                    <h5 style={{display: "flex", alignItems: "center", padding:" 0 1rem 0 2rem", marginBottom: 0}}> Overview</h5>

                    <ul className="header-nav-list">
                        <li className="header-nav-item">
                            <h4 style={{padding: 0, margin: 0, color: "rgba(0, 0, 0, 0.9)"}}>
                                {user.name?user.name: "-------"}
                            </h4>

                            <p style={{color: "rgba(0, 0, 0, 0.8)", padding: 0, margin: 0}}>
                                {user.email?user.email:"-----@----"}
                            </p>
                        </li>

                        <li className="header-nav-item">
                            <div role="button" className="header-dropdown-toggle" onClick={()=>toggleLogoutButton(!isVisibleLogoutButton)}>
                                <div className="header-avatar-div">
                                   <img src={user.profile?"http://localhost:5000/"+user.profile: /* 'https://i.pravatar.cc/50' */ '/profile_default.jpg'} alt="user" className="header-avatar" /> 
                                </div>
                                
                            </div>
                            {
                                isVisibleLogoutButton &&
                                (
                                    <div className="header-dropdwon-menu">
                                        {/* <div role="button" className="header-dropdown-item">
                                            <Icon name="user circle" size="small" />
                                            Profile
                                        </div> */}
                                        <div role="button" className="header-dropdown-item" onClick={logoutUser}>
                                            <Icon name="log out" size="small" />
                                            Logout
                                        </div>        
                                    </div>
                                )
                            }
                            
                        </li>
                    </ul>
                </header>
                {/* header ends */}
                <div className="content-container">
                    <main className="content">
                        <div className="fluid-container">
                        {ActiveComponent?(<ActiveComponent activeCell={urlComponent[3]} key={urlComponent[3]}/>):(<Grid centered columns={2}>
                                                <Grid.Column>
                                                <Message negative>
                                                    <Message.Header>Invalid URL</Message.Header>
                                                    <p>Please check the url or go back to dashboard  
                                                        <Link to="/user/dashboard"> home</Link>
                                                    </p>
                                                </Message>
                                                </Grid.Column>
                                                </Grid>)}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}
