const express     = require('express');
const routes      = express.Router();
const bcrypt      = require('bcrypt');

//SCHEMA    //
const User        = require('../db/User');
const DataBase    = require('../db/database');


//app setting for form data



routes.post('/', async (req, res)=>{
    try{
        /*
        * get name, email, password, role.
        * validate form data
        * check for required field
        * etc.
        */
       
        // post validation
        const { name, email, password, role } = req.body; //not validated.
        if(!name || !email || !password || !role)
            return res.json({response_status: 1002, message: "Fill all the fields"});
        // console.log(req.body);
        //password hashing.
        const hashedPassword = await bcrypt.hash(password, 10);

        const data = {name, email, password: hashedPassword, role: Array.isArray(role)?role.map(r=>r.toUpperCase()):role.toUpperCase() };

        const user_saved = await DataBase.saveUser(User, data);

        await delay(2000);
        
        if(user_saved){
            return res.status(200).json({response_status: 1000,message: "Registration successful!"});
        }else{
            return res.status(200).json({response_status: 1001, message: "User Already exists"});
        }

    }catch(e){
        //check for error.
        //send with valid response code.
        console.log(e);
        res.status(503).json({response_status: 503, message: "SOMETHING WENT WRONG"});
    }
});

module.exports = routes;
