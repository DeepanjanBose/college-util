import React from 'react';
import {Icon} from 'semantic-ui-react';
import {Link} from 'react-router-dom';
import Logo from '../resources/logo.png';

export default function Sidebar({activeNav, baseUrl, roles}) {
    //console.log(roles)
    roles = roles || [];

    activeNav = activeNav?activeNav:"home";
    
    return (
        <div className="sidebar">
            <h3 className="sidebar-logo">
            <Link to={"/" + baseUrl + "/dashboard"} style={{color: "#fff"}} className="logo-link">
                 <img src={Logo} alt="LOGO" style={{height:30,marginRight:"7px"}}/>   
               STCET
            </Link>
            </h3>
            <ul className="sidebar-navigations">
                <li className={"sidebar-nav-item" + (activeNav && activeNav==="home"? " side-nav-active":"")}>
                    {/* <button className="ui fluid button sidebar-nav-button">Some text</button> */}
                    <Link to={"/" + baseUrl + "/dashboard"} className="sidebar-nav-link">
                        <Icon name="dashboard" />
                        Dashboard
                    </Link>
                </li>
                <li className="sidebar-nav-title">
                    Menu
                </li>
                {
                    roles.includes('ADMIN') &&
                    (
                        <>
                            {/* <li className={"sidebar-nav-item "}>
                                    
                                <div role="button" className="sidebar-nav-link">
                                    <Icon name="bell outline" />
                                    Notification
                                </div>
                            </li>  */}
                            <li className={"sidebar-nav-item" + (activeNav && activeNav==="user-list"? " side-nav-active":"")}>
                                <Link to={"/" + baseUrl + "/dashboard/user-list"} className="sidebar-nav-link">
                                    <Icon name="users" />
                                    Users
                                </Link>
                            </li>
                        </>
                    )
                }

                {
                    roles.map((role, index)=>{
                    if(role !== 'ADMIN')
                       return (
                        <li className={"sidebar-nav-item" + (activeNav && activeNav===role? " side-nav-active":"")} key={role}>
                                <Link to={"/" + baseUrl + "/dashboard/" + role} className="sidebar-nav-link">
                                    <Icon name="folder outline" />
                                    {role.toLowerCase()}
                                </Link>
                        </li>
                       )
                        return(<></>)
                    })
                }
               
                
                <li className="sidebar-nav-divider"></li>
            </ul>
        </div>
      
    )
}
