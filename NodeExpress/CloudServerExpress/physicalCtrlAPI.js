var express = require('express');
var app = express();
var config = require('config');
var authInfo = config.get('BasicAuth');
var request = require('request');
var fs = require('fs');
var successCode = 200;
var errorCode = 406;
var deviceAddrs = fs.readFileSync('config/deviceAddrs', 'utf8').split('\n');
setupRouter();

function setupRouter() {
  var router = express.Router();
  var toReqOpt = {
    method : "POST",
    url : undefined,
    form : undefined,
    auth : {
      user : authInfo.ID,
      pass : authInfo.PASS
    }
  };
  
  router.post('/',function(req, res) {
    var bodyData = req.body;
    try {
      // console.log(bodyData);
      var deviceID = Number(bodyData.device);
      if(isNaN(deviceID) || deviceID >= deviceAddrs.length) {
        res.status(errorCode).send('invalid device id');
        return;
      }
      
      var deviceAddr = deviceAddrs[deviceID];
      deviceAddr = "http://localhost:8080/"; //for testing
      
      if('servo' in bodyData && 'angle' in bodyData) {
        console.log('device ID ' + deviceID + ',servo ' + bodyData.servo + ' turn to ' + bodyData.angle);
        toReqOpt.url = deviceAddr + 'motors';
        toReqOpt.form = bodyData;
        request(toReqOpt, function(reqErr, reqRes, reqBody) {
          if(reqRes.statusCode == successCode) {
            console.log('successfully issued command to a device');
          }
          res.send(reqBody);
        });
        return;
      }
      else {
        res.status(errorCode).send('unrecognized cmd');
        return;
      }
      
    }
    catch(err) {
      console.log('exception:' + err.toString());
      res.status(errorCode).send(err.toString());  
      return;
    }
    
  });
  
  module.exports = router;
}

