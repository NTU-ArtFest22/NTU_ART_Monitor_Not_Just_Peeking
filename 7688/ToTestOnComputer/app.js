//params
var firstPriorityNoInterruptTime = 10;
var normalPriorityNoInterruptTime = 10;

var serverAddr = '140.112.91.176';
var serverPort = '1883';
//constant
var topicPrefix = 'robot';
var firmataAdaptorName = 'firmata';
var deviceDriverKey = 'driver';
var deviceNameKey = 'name';
var devicePinKey = 'pin';

var firstPriorityUID = new Set([
  "showCase"
]);

var utilsClass = require("./myUtils.js");
var utils = utilsClass();
var setResponse = utils.setResponse;
var resType = utils.resType;
var response = {
    uid: "",
    status: "",
    msg: ""    
};
var priorityKey = "priority";
var currentServedClient = {
    uid: null
};

// var FastPriorityQueue = require("fastpriorityqueue");
// var clientQueue = new FastPriorityQueue(function(a,b) {
//   return (a[priorityKey] < b[priorityKey]);
// });

var clientQueue = [];

var firstPriorityTimeoutObj = null;
var normalPriorityTimeoutObj = null;

var extend = require('util')._extend;
var Cylon = require('cylon');
var mqtt = require('mqtt');

var fs = require('fs');
var deviceConfigJsonArray = null;
var initConfig = {
};

var robotInfo = JSON.parse(fs.readFileSync('./robotInfo.json'));
var robotID = robotInfo.id;
var robotType = robotInfo.type;
var channelName = topicPrefix + robotID;

var os = require('os');
var arduinoPort;
if(is7688()) {
  arduinoPort = '/dev/ttyS0';
}
else if(isOSX()) {
  arduinoPort = '/dev/tty.usbmodem1411';
}
else if(isLinux()) {
  arduinoPort = '/dev/ttyACM0';
}

var deviceConfig = parseDeviceConfig(initConfig, getRobotDevicesConfigName(robotType));
var phyCtrl = require("./physicalControl.js");
var authInfo = JSON.parse(fs.readFileSync('./authInfo.json'));

var robotCtrlClass = require("./robotCtrl.js");
var robotCtrl;

var adaptorsToConnect = {
};

var mqttOptions = extend({
  reconnectPeriod: 500
}, authInfo);

var mqttClient = null;

adaptorsToConnect[firmataAdaptorName] = {
  adaptor: 'firmata',
  port: arduinoPort
};

Cylon.robot({
  connections: adaptorsToConnect,
 
  devices: deviceConfig,
  
  work: function(my) {
    console.log("start to work!");
    mqttClient = mqtt.connect('mqtt://' + serverAddr + ':' + serverPort, mqttOptions);
    mqttClient.on('connect', function() {
      mqttClient.subscribe(channelName);
      mqttClient.publish(channelName, JSON.stringify({
        status: channelName + " connected"
      }));
      console.log("mqtt connected and subscribe " + channelName);
    });
    
    robotCtrl = robotCtrlClass(my.connections[firmataAdaptorName], robotInfo, my.devices, deviceConfig, mqttClient, channelName, response);
    
    var jsonObj = null;
    
    mqttClient.on('reconnect', function() {
      console.log("mqtt reconnecting...");
    });
    
    mqttClient.on('close', function() {
      console.log("mqtt just disconnected");
    });
    
    mqttClient.on('offline', function() {
      console.log("mqtt offline now");
    });
    
    mqttClient.on('message', function(topic, data) {
      if(!(firmataAdaptorName in my.connections)) {
        console.log("please connect with firmata");
        return;
      }
      
      try {
        console.log("msg:" + data);
        jsonObj = JSON.parse(data);
        
        if(utils.canBeIgnored(jsonObj)) {//ignore
          return;
        } 
        
        if("uid" in jsonObj) {
          response.uid = jsonObj.uid;
        }
        else {
          console.log("no response to this request and discard it");
          return; //discard no uid cmd
        }
        
        var isSpecialClient = firstPriorityUID.has(jsonObj.uid);
        
        if(isSpecialClient || currentServedClient.uid === jsonObj.uid) {
          
          currentServedClient.uid = jsonObj.uid;
          
          robotCtrl.routing(jsonObj);
          
          if(isSpecialClient) {
            if(firstPriorityTimeoutObj) {
              clearTimeout(firstPriorityTimeoutObj);
            }
            firstPriorityTimeoutObj = setTimeout(function() {
              currentServedClient.uid = null;
            },firstPriorityNoInterruptTime * 1000); 
          }
          
        }
        else {
          
          clientQueue.push(jsonObj);
          
          setResponse(response, resType.waiting);
          mqttClient.publish(channelName, JSON.stringify(response));
        }
        
      }
      catch(err) {
        console.log(err);
        setResponse(response, resType.selfDefinedFailedMsg, err.toString());
        mqttClient.publish(channelName, JSON.stringify(response));
      }
      
    });
    
    var isRetrieving = false;
    setInterval(function() {
      if(!isRetrieving && currentServedClient.uid === null && clientQueue.length > 0) { //serve next client
        isRetrieving = true;
        var nextClientToServe = clientQueue.shift();
        currentServedClient.uid = nextClientToServe.uid;
        
        robotCtrl.routing(nextClientToServe);
        
        response.uid = currentServedClient.uid;
        setResponse(response, resType.isYourTurn);
        mqttClient.publish(channelName, JSON.stringify(response));
        
        isRetrieving = false;
        
        if(normalPriorityTimeoutObj) {
          clearTimeout(normalPriorityTimeoutObj);
        }
        normalPriorityTimeoutObj = setTimeout(function() {
          currentServedClient.uid = null;
        }, normalPriorityNoInterruptTime * 1000);
        
      }
    }, 10); //check every 10ms
    
  }
  
}).start();

function getRobotDevicesConfigName(robotType) {
  return "./type_" + robotType + "_devices.json";
}

function parseDeviceConfig(initConfig, filePath) {
  var content = fs.readFileSync(filePath);
  deviceConfigJsonArray = JSON.parse(content);
  var deviceConfig = extend({}, initConfig); //copy from init config
  
  for(var i = 0;i < deviceConfigJsonArray.length;i++) {
    var singleDeviceConfig = deviceConfigJsonArray[i];
    if(deviceDriverKey in singleDeviceConfig && deviceNameKey in singleDeviceConfig && devicePinKey in singleDeviceConfig) {
      var deviceConfigKey = singleDeviceConfig[deviceNameKey];
      deviceConfig[deviceConfigKey] = {};
      deviceConfig[deviceConfigKey][deviceDriverKey] = singleDeviceConfig[deviceDriverKey];
      deviceConfig[deviceConfigKey][devicePinKey] = singleDeviceConfig[devicePinKey];
      deviceConfig[deviceConfigKey]["connection"] = firmataAdaptorName;
    }
    else {
      console.log('no ' + deviceDriverKey + ' or ' + deviceNameKey + ' or ' + devicePinKey + ',please specify it in ' + filePath);
      exit(-1);
    }
  }
  
  return deviceConfig;
}

function is7688() {
  return (os.platform() === "linux" && os.arch() === "mipsel");
}

function isOSX() {
  return (os.platform() === "darwin");
}

function isLinux() {
  return (os.platform() === "linux");
}
