import './App.css';
import 'semantic-ui-css/semantic.min.css';
import './admin.css';

import {useContext, useEffect} from 'react';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  Link
} from 'react-router-dom';
import {Message} from 'semantic-ui-react';

import AuthContextProvider, { AuthContext } from './context/AuthContext';


import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import AdminDashboard from './screens/AdminDashboard';
import UserDashboard from './screens/UserDashboard';
import Image404 from './resources/page_not_found.svg';
import UserStatusTemplate from './components/UserStatusTemplate';
import HomePage from './screens/HomeScreen';


function App() {

  //console
  function consoleFormat(){
    //console.clear();
    console.log('%c Debug!!', `font-weight: bold; font-size: 50px;color: #FFFFFF;
    background: #333333;
    text-shadow: 0 -1px 4px #FFF, 0 -2px 10px #ff0, 0 -10px 20px #ff8000, 0 -18px 40px #F00;`);
  }

  //console output

  useEffect(() => {
    setTimeout(consoleFormat, 200);
  }, [])

  let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if(isMobile)
    return (<Message negative>
      <Message.Header>Page not compatible to mobile</Message.Header>
      <p>Please use dekstop to view this page.</p>
    </Message>)
  else

  return (

    <AuthContextProvider>
      <Router>
        <Switch>
          <Route exact path="/log-in">
            <LoginScreen />
          </Route>

          <Route exact path="/sign-up" >
            <SignupScreen/>
          </Route>  
          
          {/* <Route path="/admin/dashboard">
            <AdminDashboard />
          </Route> */}

          <ProtectedRoutes
            path="/admin/dashboard"
            component={<AdminDashboard/>}
          />

          {/* <Route path="/user/dashboard">
            <div> User dashboard here</div>
          </Route> */}
          <ProtectedRoutes
            path="/user/dashboard"
            component={<UserDashboard />}
          />

          <Route exact path="/">
            <HomePage />
          </Route>
          
          {/* if no match */}
          <Route path="*">
            <div className="page-not-found">
              
              <img src={Image404} alt="4040 logo" className="page-not-found-logo" />
              <div>
                <h3 style={{marginTop: 30}}>
                  Page Not Found! Back to 
                  <Link to="/"> home</Link>
                </h3>
                
              </div>
            </div>
          </Route>
          
        </Switch>
      </Router>
    </AuthContextProvider>

  );
}

export default App;


function ProtectedRoutes({component, ...rest}){
  const {user} = useContext(AuthContext);

  console.log(user);

  //console.log(user && user.length > 0)
  //check user status also (lke, isAllowed, inActive, etc...)
  //depending on the case redirect or show component.
  return( <Route
    {...rest}
    render={({location})=>
      (user)
      ? (user.isAllowed!=='active')?<UserStatusTemplate/>:(component)
      : (
        <Redirect
          to={{
            pathname: "/log-in",
            state: {
              from: location,
              message: "Login to continue."
            }
          }}
        />
      )
    }
  />)
}

