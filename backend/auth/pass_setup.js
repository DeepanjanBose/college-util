const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const DataBase = require('../db/database');

/**
 * 
 * @param { Passport } passport - provide passport module.
 * @param {Schema} schema - schema to authenticate from.
 */
module.exports = function setStrategy(passport, schema){
    passport.use(
        new localStrategy({usernameField: 'email'}, (username, password, done)=>{
            DataBase.findOne(schema, {email: username})
            .then(user=>{
                if(!user) return done(null, false, {response_status: 401, message: "Invalid email"});
                verifyPassword(password, user.password)
                .then(isMatch=>{
                    isMatch?done(null, user, {response_status: 1000, message: "Authenticated"}):done(null, false, {response_status: 401, message: "Incorrect Password"});
                })
                .catch(err=>done(err));
            })
            .catch(err=>{done(err)});
        })
    );

    passport.serializeUser(function(user, done){
        return done(null, user.id);
     });
     passport.deserializeUser(function(id, done){
        schema.findById(id, function(err, user){
            if(err)
                return done(null, false);
            return done(null, user);
        });
     });
}

function verifyPassword(plainPassword, hashedPassword){
    return new Promise((resolve, reject)=>{
        bcrypt.compare(plainPassword, hashedPassword)
        .then(result=>{return resolve(result);})
        .catch(err=>{throw err});
    })
}
