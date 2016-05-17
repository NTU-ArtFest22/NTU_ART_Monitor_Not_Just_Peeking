module.exports = function(firmata, robotInfo, devices, deviceConfig, mqttClient, channelName, response, currentServedClient) {
    //params
    var normalPriorityNoInterruptTime = 10;
    
    var outputInfo = {};
    
    var phyCtrlClass = require("./physicalControl.js");
    var phyCtrl = phyCtrlClass();
    var utilsClass = require("./myUtils.js");
    var utils = utilsClass();
    var setResponse = utils.setResponse;
    var resType = utils.resType;
    
    var mFirmata = firmata;
    var mDevices = devices;
    var mDeviceConfig = deviceConfig;
    var mChannelName = channelName;
    var MqttClient = mqttClient;
    var mResponse = response;
    var mCurrentServedClient = currentServedClient;
    
    var timeoutObj = null;
    
    var setResponseAndPublishIt = function(typeOfRes, errMsg) {
        setResponse(mResponse, typeOfRes, errMsg);
        MqttClient.publish(mChannelName, JSON.stringify(mResponse));
        
        if(timeoutObj) {
          clearTimeout(timeoutObj);
        }
        timeoutObj = setTimeout(function() {
          mCurrentServedClient.uid = null;
        }, normalPriorityNoInterruptTime * 1000);
    };
    
    var phyCtrlCallback = function(success, errMsg) {
        if(success) {
            setResponseAndPublishIt(resType.success, "");
        }
        else {
            setResponseAndPublishIt(resType.selfDefinedFailedMsg, errMsg);
        }
        
    };
    
    var routing = {};
    var loopInfo = null;
    
    if(robotInfo.type === "large") {
        outputInfo["baseServo"] = phyCtrl.ACMotor(mDevices['baseServo_clockRelay'], mDevices['baseServo_counterClockRelay']);
        outputInfo["eyeServo"] = phyCtrl.ContServo(mDevices['eyeServo']);
        loopInfo = phyCtrl.setInnerLoop([outputInfo["baseServo"], outputInfo["eyeServo"]]);
        
    }
    else if(robotInfo.type === "small") {
        outputInfo["baseServo"] = phyCtrl.ContServo(mDevices['baseServo']);
        loopInfo = phyCtrl.setInnerLoop([outputInfo["baseServo"]]);
        
    }
    
    outputInfo["clapper"] = phyCtrl.Clapper(mDevices['clapper_enablePin'], mDevices['clapper_dirPin'], mDevices['clapper_stepPin']);
    
    routing["large"] = function (jsonObj) {
        var targetToCtrl = jsonObj["target"];
        
        if('baseServo' === targetToCtrl) {
            this.baseServo.operate(jsonObj, phyCtrlCallback);
        }
        else if('eyeServo' === targetToCtrl) {
            this.eyeServo.operate(jsonObj, phyCtrlCallback);
        }
        else if('clapper' === targetToCtrl) {
            this.clapper.operate(phyCtrlCallback);
        }
        else {
            setResponseAndPublishIt(resType.targetNotExist);
        }
    };
    
    routing["small"] = function (jsonObj) {
        var targetToCtrl = jsonObj["target"];
        
        if('baseServo' === targetToCtrl) {
            this.baseServo.operate(jsonObj, phyCtrlCallback);
        }
        else if('clapper' === targetToCtrl) {
            this.clapper.operate(phyCtrlCallback);
        }
        else {
            setResponseAndPublishIt(resType.targetNotExist);
        }
    };
    
    outputInfo["routing"] = routing[robotInfo.type];
    
    return outputInfo;
    
};
