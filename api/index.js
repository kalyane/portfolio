const express = require('express');
const bodyparser = require('body-parser');
const path = require('path');

// creating express app
var app = express();

// configuring express server
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// defining public directories
app.use('/static', express.static(path.join(__dirname, '../public')));


// establish the server connection port
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}..`));

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

// add routes to the application
app.get('/', function(req, res) {
    res.render('index')
});

// if none of the previous routes match, then render 404 page
/*
app.all('*', (req, res) => {
    res.redirect('/404')
})*/

module.exports = app;