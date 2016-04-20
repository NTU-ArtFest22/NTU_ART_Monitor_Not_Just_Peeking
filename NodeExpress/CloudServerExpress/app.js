var port = 8000;
var express = require('express');
var app = express();
var helmet = require('helmet');
var config = require('config');
app.use(helmet());

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
var physicalCtrlAPI = require('./physicalCtrlAPI');
app.use('/issueCmd/', physicalCtrlAPI);

app.listen(port, function () {
  console.log('Example app listening on port ' + port);
});