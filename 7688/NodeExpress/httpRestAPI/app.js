var port = 8000;
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var basic_auth = require('basic-auth');
var helmet = require('helmet');
var config = require('config');
var authInfo = config.get('BasicAuth');
// console.log(authInfo);
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(helmet());

var do_auth = function(req, res, next) {
  var credentials = basic_auth(req);
  if (!credentials || credentials.name !== authInfo.ID || credentials.pass !== authInfo.PASS) {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="example"');
    res.end('Access denied');
  } else {
    next();
  }
};

app.all('*', do_auth);

//routers
var motors = require('./motors');
app.use('/motors', motors);

app.listen(port, function () {
  console.log('Example app listening on port ' + port);
});