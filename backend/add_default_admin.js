//use this file to add default admin into database.
//replace nae, password, email with your value.
//remove/delete this file after adding the use. (keep backup of this file other than this server. (not accessible))
//to run: open cmd and type "node add_default_admin.js" and press enter.
//


const ADMIN_NAME = 'Admin Default';
const ADMIN_PASSWORD = 'admin@123';
const ADMIN_EMAIL = 'admin@test.com';
const DB_URL = 'mongodb://192.168.43.1';

const mongoose = require('mongoose');


const option = {useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false};

const User = require('./db/User');

const bcrypt = require('bcrypt');


mongoose.connect(DB_URL, option, async (err)=>{
    if(err) return connsole.log(err)
    //add dumy user.
    bcrypt.hash(ADMIN_PASSWORD, 10)
    .then(hashed_password=>{
        //check for user in database.
        User.findOne({email: ADMIN_EMAIL}, {password: 0})
        .then(result=>{
            if(result){
                console.log("User Already exists: \n" + result);
                return process.exit(0)
            }

            new User({
                    name: ADMIN_NAME,
                    email: ADMIN_EMAIL,
                    password: hashed_password,
                    role: 'ADMIN',
                    isAllowed: 'active'
                }).save(err=>{
                    if(err) return console.log(err);
                    console.log("User added.");
                    process.exit(0);
                });
            }
        )
        .catch(err=>{console.log(err); process.exit(0)});
    })
    .catch(err=>{console.log(err), process.exit(0)})
})