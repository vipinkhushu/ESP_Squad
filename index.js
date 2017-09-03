var express = require('express');
var session = require('express-session');
var ejs = require('ejs');
var bodyParser = require('body-parser');

app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(session({secret: 'ssshhhhh',resave: true,saveUninitialized: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


routes=require('./routes/index');
keys=require('./keys/config.json');
db=require('./db/index');

app.listen(app.get('port'), function() {
	console.log('App running on port', app.get('port'))
});