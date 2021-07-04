import '../components/stylesheet/HomeScreen.css';
import React from 'react'
//import { Link } from 'react-router-dom';
import AnimatedText from '../AnimatedText/AnimatedText';

export default function HomeScreen() {

    const redirectTo = (url) => {
        window.location.href = url;     
    }

    return (
        <div className="container">
            <AnimatedText
                textColor="#fdc52c"
                overlayColor="#fc0345"
            >
            Welcome To<br/>Document Management System
            </AnimatedText>
            <div className="ui buttons containerTwo">
            <button className="ui violet button" onClick={()=>redirectTo('/log-in')}>LogIn</button>
            <div className="or"></div>
            <button className="ui green button" onClick={()=>redirectTo('/sign-up')}>SignUp</button>
            </div>
        </div>
    )
}

// {/* <div className="container">
// <Link className="hs-link" to="/log-in">Login</Link>
// <Link className="hs-link" to="/sign-up">Sign up</Link>
// </div> */}

