import axios from "axios";
import React, {useContext, useState, useEffect} from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import { Grid, Header, Form, Segment, Message } from "semantic-ui-react";
import { AuthContext } from "../context/AuthContext";


export default function LoginScreen() {

  const [animateClass, changeAnimateClass] = useState('');

  const {setUser} = useContext(AuthContext);

  const history = useHistory();

  const [formError, setFormError] = useState({});

  const [submitError, setSubmitError] = useState(false);

  const [isFormSubmitting, setFormSubmitting] = useState(false);

  const location = useLocation();

  const {from, message} = location.state || {from: {pathname: "/"}, message: null};

  //console.log(from, message)

  const handleSubmit = (e, setUser) =>{

    setSubmitError(null);

    e.preventDefault();
    let email = e.target.email.value;
    let password = e.target.password.value;
    if(!email)
      setFormError({...formError, email: "Required!"});
    if(!password)
      setFormError({...formError, password: "Required!"});
    
    if(email && password){

      setFormSubmitting(true);

      axios.post('http://localhost:5000/log-in', {email, password}, {withCredentials: true})

      // fetch('http://localhost:5000/log-in', {
      //   headers: {
      //   "Content-Type": "application/json",
			//   'Accept': "application/json",
      // },
      //   method: "POST",
      //   // mode: "no-cors",
      //   cache: "no-cache",
      //   body: JSON.stringify({email, password})
      // })
      .then(res=>{
        
        if(res.status === 200){
            return res.data;
        }else{
           
            throw Error('Error fetching data');
        }
      })
      // .then(res=>{
      //   console.log(res)
      //   if(res.status===200)
      //       return res.json();
      //   else{
      //       throw Error('Error Fetching data from server.')
      //   }
      // })
      .then(result=>{
        //console.log(result)
        //authentication successful
        if(result.response_status === 1000)
          {
            //setting user object for further use
            setUser(result.user); //setUser from AuthContext
            
            //do otherthing....
            setTimeout(function(){history.push((from.pathname==="/")?result.redirect: from.pathname)}, 800)
          }
      })
      .catch(err=>{
        console.log(err.response);
        if(err.response && err.response.data){
          if(err.response.data.response_status === 401){
            setSubmitError(err.response.data.message);
          }
        }
        else{
          setSubmitError(err.message);
        }
        setFormSubmitting(false);
      });
    }
    
  }

  const handleChange = (e) =>{
    if(e.target.name === 'email'){

      let regex = /^[^\s@]+@[^\s@.]+\.[^\s@]+$/gi;
      
      regex.test(e.target.value)
        ?setFormError({...formError, email: null})
        :setFormError({...formError, email: "Invalid Email"});
    }
    else if(e.target.name === 'password'){

      let regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/gi;

      regex.test(e.target.value)
        ?setFormError({...formError, password:null})
        :setFormError({...formError, password: "At least one letter, one number and one special character"});
    }
  }


  useEffect(()=>{setTimeout(function(){changeAnimateClass('show-component')}, 100)},[]);

  return (
      <div className={"login-form hidden-initial " + animateClass}>
      
      <style>{`
      body > div,
      body > div > div,
      body > div > div > div.login-form {
        height: 100%;
      }
    `}</style>
      <Grid
        textAlign="center"
        style={{ height: "100%" }}
        verticalAlign="middle"
      >
        <Grid.Column style={{ maxWidth: 450 }}>

        <Header as="p" color="red" textAlign="center">
            <br />
            {message? message: ""}
        </Header>

          <Header as="p" color="yellow" textAlign="center">
            <br />
            Login
          </Header>
          {submitError &&
          <Message color="red">
            <Message.Header>
              {submitError}
            </Message.Header>
          </Message>}
          <Form size="large" onSubmit={(event)=>handleSubmit(event, setUser)} action="POST">

          {/* {formError &&
            <Message color="red">
              <Message.Header>Error</Message.Header>
              
                <ul style={{paddingLeft: 10, textAlign: "left"}}>
                  {Object.keys(formError).map(key=>{
                    return (
                      <li key={key}>{formError[key]}</li>
                    )
                  })}
                </ul>
            
            </Message>
          } */}
            <Segment stacked>
              <Form.Input
                fluid
                icon="user"
                iconPosition="left"
                placeholder="Email address"
                name="email"
                label="Email Address"
                error={formError && formError.email}
                onChange={handleChange}
              />
              <Form.Input
                fluid
                icon="lock"
                iconPosition="left"
                placeholder="Password"
                type="password"
                name="password"
                error={formError && formError.password}
                onChange={handleChange}
              />


              <button className={"ui blue large fluid button "+(isFormSubmitting?"loading":"")} type="submit" disabled={isFormSubmitting || !Object.keys(formError).length>0 || (formError.email || formError.password)}>Login</button>
            </Segment>
          </Form>
          <Message>
            Not registered yet? <Link to="/sign-up"> Register</Link>
          </Message>
        </Grid.Column>
      </Grid>
    </div>
  );
}



