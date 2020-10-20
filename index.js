const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

const session = require('express-session');
const passport = require('passport');

dotenv.config();

const app = express();
app.set('port', process.env.PORT || 8000);

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded( {extended : false }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use('/test', (req, res, next) => {
    res.send('hi, i am server');
});


app.use( (err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

app.listen(app.get('port'), () => {
    console.log(`standby at port ${app.get('port')}`);
})