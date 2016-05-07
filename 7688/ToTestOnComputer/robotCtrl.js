module.exports = function(firmata, robotInfo, devices, deviceConfig, channel, response) {
    var phyCtrl = require("./physicalControl.js");
    var utilsClass = require("./myUtils.js");
    var utils = utilsClass();
    var setResponse = utils.setResponse;
    var resType = utils.resType;
    
    var mFirmata = firmata;
    var mDevices = devices;
    var mDeviceConfig = deviceConfig;
    var mChannel = channel;
    var mResponse = response;
    
    var setResponseAndPublishIt = function(typeOfRes) {
        setResponse(mResponse, typeOfRes);
        mChannel.publish(JSON.stringify(mResponse));
    };
    
    var phyCtrlCallback = function(success, errMsg) {
        if(success) {
            setResponse(mResponse, resType.success);
        }
        else {
            setResponse(mResponse, resType.selfDefinedFailedMsg, errMsg);
        }
        mChannel.publish(JSON.stringify(mResponse));
    };
    
    var routing = {};
    
    routing["large"] = function (jsonObj) {
        var targetToCtrl = jsonObj["target"];
        
        if('baseServo' === targetToCtrl) {
            var powRelay = mDevices['baseServo_powRelay'];
            var dirRelay = mDevices['baseServo_dirRelay'];
            if(!dirRelay || !powRelay) {
                setResponseAndPublishIt(resType.targetNotExist);
            }
            else {
                phyCtrl.turnACMotor(dirRelay, powRelay, jsonObj, phyCtrlCallback);
            }
        }
        else if('eyeServo' === targetToCtrl) {
            var eyeServo = mDevices['eyeServo'];
            if(!eyeServo) {
                setResponseAndPublishIt(resType.targetNotExist);
            }
            else {
                phyCtrl.turnContServo(eyeServo, jsonObj, phyCtrlCallback);
            }
        }
        else if('clapper' === targetToCtrl) {
            var enablePin = mDevices['clapper_enablePin'];
            var dirPin = mDevices['clapper_dirPin'];
            var stepPin = mDevices['clapper_stepPin'];
            if(!enablePin || !dirPin || !stepPin) {
                setResponseAndPublishIt(resType.targetNotExist);
            }
            else {
                phyCtrl.triggerClapper(enablePin, dirPin, stepPin, phyCtrlCallback);
            }
        }
        else if('testRelay' === targetToCtrl) {
            var relay = mDevices['testRelay'];
            if(!relay) {
                setResponseAndPublishIt(resType.targetNotExist);
            }
            else if(!phyCtrl.relayTest(relay, null)) {
                setResponse(mResponse, resType.wrongFormat);
            }
        }
        else {
            setResponseAndPublishIt(resType.targetNotExist);
        }
    };
    
    routing["small"] = function (jsonObj) {
        var targetToCtrl = jsonObj["target"];
        
        if('baseServo' === targetToCtrl) {
            var baseServo = config.mDevices['baseServo'];
            if(!baseServo) {
                setResponseAndPublishIt(resType.targetNotExist);
            }
            else {
                phyCtrl.turnContServo(baseServo, jsonObj, phyCtrlCallback);
            }
        }
        else if('clapper' === targetToCtrl) {
            var enablePin = mDevices['clapper_enablePin'];
            var dirPin = mDevices['clapper_dirPin'];
            var stepPin = mDevices['clapper_stepPin'];
            if(!enablePin || !dirPin || !stepPin) {
                setResponseAndPublishIt(resType.targetNotExist);
            }
            else {
                phyCtrl.triggerClapper(enablePin, dirPin, stepPin, phyCtrlCallback);
            }
        }
        else if('testRelay' === targetToCtrl) {
            var relay = mDevices['testRelay'];
            if(!relay) {
                setResponseAndPublishIt(resType.targetNotExist);
            }
            else if(!phyCtrl.relayTest(relay, null)) {
                setResponseAndPublishIt(resType.wrongFormat);
            }
        }
        else {
            setResponseAndPublishIt(resType.targetNotExist);
        }
    };
    
    return {
        routing: routing[robotInfo.type]
    };
    
};
