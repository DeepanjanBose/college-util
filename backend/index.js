const express       = require('express');
const cors          = require('cors');
const session       = require('express-session');

//GLOBAL FUction FOR DELAY (SIMULATE REAL NETWORK FETCH)
global.delay = (delay_time)=>{return new Promise(resolve=>setTimeout(resolve, delay_time));}

//remove in production
const dotenv = require('dotenv');
dotenv.config();


const app = express();

//app configuration
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

// app.use((req, res, next)=>{
    
//     res.setHeader('Access-Control-Allow-Credentials', true);
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type');

//     next();
// });

app.use(express.static('public')); //place all the static file (i.e. image, icons etc).
const expressJson = express.json();
const bodyParser  = express.urlencoded({extended: true});
app.use([expressJson, bodyParser]);

app.use(
    session({
      secret: 'keep it secret ;)',
      rolling: true,
      resave: true,
        saveUninitialized: false,
        cookie: { maxAge:  15*60*1000} //15 minute to logout if left idle
    })
);


//configure passport
//use express session before passport session
const passport      = require('passport');
const User          = require('./db/User');
const setStrategy   = require('./auth/pass_setup');

setStrategy(passport, User);
app.use(passport.initialize());
app.use(passport.session());

app.post('/check-authenticated-status', async(req, res)=>{
    //console.log(req.user);
    try{
        await delay(2000);

        if(!req.isAuthenticated()){
            return res.json(null);
        }
        let user = req.user;
        let date_created = new Date(user.date_created);
        date_created = `${date_created.getDate()}-${date_created.getMonth()}-${date_created.getFullYear()}`;
    
        return res.json({name: user.name, id: user._id, date_created, role: user.role, email: user.email, isAllowed: user.isAllowed})
    }catch(e){
        return res.json(null);
    }
});

app.post('/refresh-token', (req, res)=>{
    try{
        console.log('token refreshing', req.isAuthenticated())
        if(!req.isAuthenticated())
        return res.json({response_status: 1001, isActive: false});
    else
        return res.json({response_status: 1000, isActive: true});
    }catch(e){
        console.log(e);
        res.json({response_status: 1002, isActive: false});
    }
});

app.post('/log-out', (req, res)=>{
    try{
        req.logout();
        res.json({response_status: 1000, message: "Logged out!", redirect: "/log-in"});
    }catch(e){
        res.json({
            response_status: 10001,
            message: "Not logged in / Server error",
            redirect: '/log-in'
        });
    }
});

//handle all signup rquests.
app.use('/sign-up', require('./routes/sign-up-routes'));

//handle login request
app.use('/log-in', require('./routes/log-in-routes'));

app.use('/cms', require('./routes/cms-routes'));

app.use('/files', require('./routes/file-routes'));



const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log('Application is running at port ' + PORT);
    
    //database connection
    require('./db/connection')();
});