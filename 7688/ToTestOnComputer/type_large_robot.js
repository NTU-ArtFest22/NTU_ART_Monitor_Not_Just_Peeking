module.exports = function(noFirmata, firmata, devices, deviceConfig, channel) {
    var phyCtrl = require("./physicalControl.js");
    var response = {
        uid: "",
        status: "",
        msg: ""    
    };
    
    var config = {
        mNoFirmata : noFirmata,
        mFirmata: firmata,
        mDevices: devices,
        mDeviceConfig: deviceConfig,
        mChannel: channel
    };
    
    var resType = {
        success: 0,
        wrongFormat: 1,
        unknownTarget: 2,
        targetNotExist: 3
    };
    
    var canBeIgnored = function (data) {
        return ("status" in data); 
    };
    
    var setResponse = function (type) {
        if(type === resType.success) {
            response.status = "success";
            response.msg = "";
        }
        else if(type === resType.wrongFormat) {
            response.status = "fail";
            response.msg = "wrong format";
        }
        else if(type === resType.unknownTarget) {
            response.status = "fail";
            response.msg = "unknown target";
        }
        else if(type === resType.targetNotExist) {
            response.status = "fail";
            response.msg = "target not existing";
        }
    }
    
    var msgHandler = function (data) {
        if(!config.mNoFirmata && !config.mFirmata) {
            console.log("please initialize");
            return;
        }
        
        var noResponse = true;
        
        try {
            console.log("incoming:" + data);
            jsonObj = JSON.parse(data);
            
            if(canBeIgnored(jsonObj)) {//ignore
                return;
            } 
            
            if("uid" in jsonObj) {
                response.uid = jsonObj.uid;
                noResponse = false;
            }
            else {
                console.log("no response to this request");
            }
            
            var targetToCtrl = jsonObj["target"];
            setResponse(resType.success);
            if('baseServo' === targetToCtrl) {
                var powRelay = config.mDevices['baseServo_powRelay'];
                var dirRelay = config.mDevices['baseServo_dirRelay'];
                if(!dirRelay || !powRelay) {
                    setResponse(resType.targetNotExist); 
                }
                else if(!phyCtrl.turnACMotor(dirRelay,powRelay,jsonObj)) {
                    setResponse(resType.wrongFormat);
                }
            }
            else if('eyeServo' === targetToCtrl) {
                var eyeServo = config.mDevices['eyeServo'];
                if(!eyeServo) {
                    setResponse(resType.targetNotExist);
                }else if(!phyCtrl.turnContServo(eyeServo, jsonObj)) {
                    setResponse(resType.wrongFormat);
                }
            }
            else if('clapper' === targetToCtrl) {
                var enablePin = config.mDevices['clapper_enablePin'];
                var dirPin = config.mDevices['clapper_dirPin'];
                var stepPin = config.mDevices['clapper_stepPin'];
                if(!enablePin || !dirPin || !stepPin) {
                    setResponse(resType.targetNotExist);
                }
                else if(!phyCtrl.triggerClapper(enablePin, dirPin, stepPin)) {
                    setResponse(resType.wrongFormat);
                }
            }
            else if('normalServo' === targetToCtrl) {
                var normalServo = config.mDevices['normalServo'];
                if(!normalServo) {
                    setResponse(resType.targetNotExist);
                }
                else if(!phyCtrl.turnServo(normalServo, jsonObj)) {
                    setResponse(resType.wrongFormat);
                }
            }
            else {
                console.log("unknown device");
                setResponse(resType.unknownTarget);
            }
        }
        catch(err) {
            console.log(err);
            setResponse(resType.wrongFormat);
        }
        
        if(!noResponse) {
            channel.publish(JSON.stringify(response));
        }
    };
    
    return {
        msgHandler: msgHandler  
    };
    
};