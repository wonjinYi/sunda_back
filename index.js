// require modules
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const Axios = require('axios');
const session = require('express-session');
const passport = require('passport');

// declare const and var
dotenv.config();
const STATE = String(Math.random());
const REDIRECT_URI = "http://127.0.0.1:8000/oauth/daldalso";

//
const app = express();
app.set('port', process.env.PORT || 8000);

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

//app.use(express.json());
//app.use(express.urlencoded( {extended : false }));
//app.use(cookieParser(process.env.COOKIE_SECRET));

app.use('/test', (req, res, next) => {
    res.send('hi, i am server');
    next();
});

// daldalso oauth test code
app.get("/oauth/daldalso/login", (req, res) => {
    res.send(`<a href="https://daldal.so/oauth/authorize?response_type=code&client_id=${process.env.DALDALSO_ID}&state=${STATE}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}" target="_blank">
    <img src="https://daldal.so/media/images/oauth-button.png" />
  </a>
  <h1>${process.env.DALDALSO_ID}</h1>`);
});

app.get("/oauth/daldalso", async (req, res) => {
    if(req.query["state"] !== STATE){
        res.sendStatus(400);
        console.log(`is not matched STATE:${STATE} and req-state:${req.query['state']}`);
        return;
    }

    try {
        let axios;
        let token;
        console.log("axios 01");
        axios = await Axios.post("https://daldal.so/oauth/token", {
            client_id: process.env.DALDALSO_ID,
            client_secret: process.env.DALDALSO_SECRET,
            grant_type: "authorization_code",
            code: req.query['code']
          });
        token = axios.data['access_token'];

        axios = await Axios.get("https://daldal.so/oauth/api/me", {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        res.send(JSON.stringify(axios.data));
    } catch (err) {
        console.error("axios error");
        res.send(err);;
    }
});

// middleware for handling errors.
app.use( (err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.send('error');
});
 
// liten
app.listen(app.get('port'), () => {
    console.log(`standby at port ${app.get('port')}`);
})