module.exports = function(noFirmata, firmata, devices, deviceConfig, channel) {
    var phyCtrl = require("./physicalControl.js");
    var utilsClass = require("./myUtils.js");
    var utils = utilsClass();
    var setResponse = utils.setResponse;
    var resType = utils.resType;
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
    
    var msgHandler = function (data) {
        if(!config.mNoFirmata && !config.mFirmata) {
            console.log("please initialize");
            return;
        }
        
        var noResponse = true;
        
        try {
            console.log("msg:" + data);
            jsonObj = JSON.parse(data);
            
            if(utils.canBeIgnored(jsonObj)) {//ignore
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
            setResponse(response, resType.success);
            if('baseServo' === targetToCtrl) {
                var powRelay = config.mDevices['baseServo_powRelay'];
                var dirRelay = config.mDevices['baseServo_dirRelay'];
                if(!dirRelay || !powRelay) {
                    setResponse(response, resType.targetNotExist); 
                }
                else if(!phyCtrl.turnACMotor(dirRelay, powRelay, jsonObj)) {
                    setResponse(response, resType.wrongFormat);
                }
            }
            else if('eyeServo' === targetToCtrl) {
                var eyeServo = config.mDevices['eyeServo'];
                if(!eyeServo) {
                    setResponse(response, resType.targetNotExist);
                }else if(!phyCtrl.turnContServo(eyeServo, jsonObj)) {
                    setResponse(response, resType.wrongFormat);
                }
            }
            else if('clapper' === targetToCtrl) {
                var enablePin = config.mDevices['clapper_enablePin'];
                var dirPin = config.mDevices['clapper_dirPin'];
                var stepPin = config.mDevices['clapper_stepPin'];
                if(!enablePin || !dirPin || !stepPin) {
                    setResponse(response, resType.targetNotExist);
                }
                else if(!phyCtrl.triggerClapper(enablePin, dirPin, stepPin)) {
                    setResponse(response, resType.wrongFormat);
                }
            }
            else if('testRelay' === targetToCtrl) {
                var relay = config.mDevices['testRelay'];
                if(!relay) {
                    setResponse(response, resType.targetNotExist);
                }
                else if(!phyCtrl.relayTest(relay, null)) {
                    setResponse(response, resType.wrongFormat);
                }
            }
            
            else {
                setResponse(response, resType.targetNotExist);
            }
        }
        catch(err) {
            console.log(err);
            setResponse(response, resType.wrongFormat);
        }
        
        if(!noResponse) {
            channel.publish(JSON.stringify(response));
        }
    };
    
    return {
        msgHandler: msgHandler  
    };
    
};

// if('normalServo' === targetToCtrl) {
//     var normalServo = config.mDevices['normalServo'];
//     if(!normalServo) {
//         setResponse(response, resType.targetNotExist);
//     }
//     else if(!phyCtrl.turnServo(normalServo, jsonObj)) {
//         setResponse(response, resType.wrongFormat);
//     }
// }