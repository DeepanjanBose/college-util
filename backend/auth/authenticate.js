/**
 * @param {Module} passport - Passport module
 * @return call next handler if authenticated.
 * 
 */

const authenticateUser = (passport) => {
    return function(req, res, next){
        passport.authenticate('local', function(err, user, info){
            //console.log(err, user, info)
            if(err) next(err);
            if(!user) return res.status(401).json(info);
            req.logIn(user, (err)=>{if(err) return next(err); return next()});

        })(req, res, next)
    }
}

module.exports = authenticateUser;