import React, {useState, useEffect} from "react";
import { Link, useHistory } from "react-router-dom";
import roleOption from '../Role';
import { Grid, Header, Form, Segment, Message } from "semantic-ui-react";

export default function SignupScreen() {

  const [animateClass, changeAnimateClass] = useState('');

  const [formError, setFormError] = useState({});

  const [submitError, setSubmitError] = useState([]);

  const [isFormSubmitting, setFormSubmitting] = useState(false);

  const [selectedRole, setFormRoleValue] = useState([]);

  const history = useHistory();


  const handleSubmit = (e) =>{

    console.log('clcked')
    setSubmitError([]);

    e.preventDefault();

    let email = e.target.email.value;
    let password = e.target.password.value;
    let role = selectedRole.length>0?selectedRole:null;
    let name = e.target.name.value;

    let error = [];


    if(!name)
      error.push('Name is required!');
    if(!email)
      error.push('Email is required!');
    if(!password)
      error.push('Password is required!');
    if(!role)
      error.push('Please select role!');

      console.log(role)

    if(error && error.length > 0){
        setSubmitError(error);
        setFormSubmitting(false);
        return;
    }

    if(error && error.length === 0){
      setFormSubmitting(true);

      fetch('http://localhost:5000/sign-up', {
        headers: {
        'Cache-Control': 'no-cache',
        "Content-Type": "application/json",
			  'Accept': "application/json",
      },
        method: "POST",
        body: JSON.stringify({email, password, role, name})
      })
      .then(res=>{console.log(res); return res.json();})
      .then(result=>{
        console.log(result)
        //show successful message
        if(result.response_status===1000)
          {
            //registration successful
            //redirect to login page.
            
            setTimeout( function(){history.push({pathname: "/log-in", state: {from: {pathname:'/'}, message: "Registration successful. Login to continue..."}});}, 400)
          }
        else if(result.response_status === 1001)
          setSubmitError(result.message);
        else
          setSubmitError(result.message + " " + result.response_status);
        setFormSubmitting(false);
      })
      .catch(err=>{console.log(err); setSubmitError("Network Error");setFormSubmitting(false);});
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
    else if(e.target.name === 'role'){
      if(e.target.checked){
        setFormRoleValue([...selectedRole, e.target.value]);
      }else{
        let updatedRole = selectedRole.filter(value =>value!==e.target.value)
        setFormRoleValue(updatedRole);
      }
    }
    // else{
    //   //changed last setFormError parameter from setFormError
    //     e.target.value?setFormError({...formError, [e.target.name]: null}):setFormError({...formError, [e.target.name]: "Required!"})
    // }
  
  }

  useEffect(()=>{setTimeout(function(){changeAnimateClass('show-component')}, 100)},[]);

  return (
    <div className={"signup-form hidden-initial " + animateClass}>
      
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

          <Header as="p" color="yellow" textAlign="center">
            <br />
            Signup
          </Header>
          {submitError.length > 0 &&
          <Message color="red">
            <Message.Header>
              {submitError}
            </Message.Header>
          </Message>}
          <Form size="large" onSubmit={handleSubmit} action="POST">

            <Segment stacked>

            <Form.Input
                fluid
                icon="user"
                iconPosition="left"
                placeholder="Name"
                name="name"
                error={formError && formError.name}
                onChange={handleChange}
              />
              <Form.Input
                fluid
                icon="user"
                iconPosition="left"
                placeholder="Email address"
                name="email"
                error={formError && formError.email}
                onChange={handleChange}
              />
             
              {/* <Form.Field control='select' name="role" error={formError && formError.role} onChange={handleChange} multiple>
                {roleOption.map((role, index) =>{
                    return(
                        <option value={role.value} key={index}>{role.text}</option>
                    )
                })}

              </Form.Field> */}

              
              <Form.Field className="role-select">
                <label>Select Role</label>
                {roleOption.map((role, index) =>{
                    return(
                      <div style={{width: '100%'}}  key={index}>
                        <input type="checkbox" name="role" value={role.value} onClick={handleChange}/> <label>{role.text}</label>
                      </div>
                    )
                })}
              </Form.Field>

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

              <button className={"ui blue large fluid button "+(isFormSubmitting?"loading":"")} type="submit" disabled={isFormSubmitting || !Object.keys(formError).length>0 || (formError.email || formError.password || formError.name || formError.role)}>Signup</button>
            </Segment>
          </Form>
          <Message>
            Allready have an account? <Link to="/log-in"> Login</Link>
          </Message>
        </Grid.Column>
      </Grid>
    </div>
  );
}



