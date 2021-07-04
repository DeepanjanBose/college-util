const express = require('express');
const routes = express.Router();
const passport = require('passport');
const authenticateUser = require('../auth/authenticate');

routes.post('/', authenticateUser(passport), async(req, res, next)=>{
   try{
        //check for user role
    const user = req.user;
    const ROLE = user.role;
    let date_created = new Date(user.date_created);
    date_created = `${date_created.getDate()}-${date_created.getMonth()}-${date_created.getFullYear()}`;

    await delay(2000);

    if(ROLE == 'ADMIN'){
        //show all routes
        //redirect to admin dashboard
        res.status(200).json({response_status: 1000, message: "Authentication successful", redirect: '/admin/dashboard', user: {name: user.name, id: user._id, date_created, role: user.role, email: user.email, isAllowed: user.isAllowed}});
    }
    else{
        //redirect to user dashboard.
        //show data according to role.
        res.status(200).json({response_status: 1000, message: "Authentication successful", redirect: '/user/dashboard', user: {name: user.name, id: user._id, date_created, role: user.role, email: user.email, isAllowed: user.isAllowed}});
    }
   }catch(e){
       //server error
       res.status(200).json({response_status: 10002, message: "Internal error"});
   }
});


module.exports = routes;
