const express     = require('express');
const routes      = express.Router();

//SCHEMA    //
const User        = require('../db/User');
const DataBase    = require('../db/database');


//app setting for form data
routes.get('/userList', async (req, res)=>{
    try{
        let user = req.user;

        await delay(1500);

        if(!user)
            return res.json({message: "Unauthorized access", response_status: 1001});
        if(!user.role.includes('ADMIN'))
            return res.json({message: "Login with ADMIN", response_status: 1001});
        
        //user is logged in with admin id
        //get user lists sorted by date joined (most recent);
        let userList = await User.find({email: {$ne: user.email}}, {password: 0 }).sort({_id: -1});
        
        return res.json({response_status: 1000, response_data: userList})

    }catch(err){
        console.log(err);
        res.json({message: "Internal server error", response_status: 10002});
    }
});

routes.post('/updateUserList', async (req, res) => {
    try{
        let user = req.user;

        await delay(3000);

        if(!user)
            return res.json({message: "Unauthorized access", response_status: 1001});
        if(!user.role.includes('ADMIN'))
            return res.json({message: "Login with ADMIN", response_status: 1001});
        
        let {_id, email, role, isAllowed} = req.body;
        
        await User.findOneAndUpdate({_id, email}, {role, isAllowed});

        return res.json({message: 'Updated', response_status: 1000});

    }catch(err){
        console.log(err);
        res.json({message: 'Server error', response_status: 1002})
    }
})

module.exports = routes;
