var exports = module.exports = {};
exports.turnServo = function (servo, data) {
    try {
        var angle = Number(data['angle']);
        if(isNaN(angle)) {
            return false;
        }
        servo.angle(angle);
        return true;
    }
    catch(err) {
        console.log(err);
        return false;
    }
};

var ContServoInfo = {
    angleSpeed: 360 / 2.0,
    normalClockwiseVal: 120,
    normalCounterClockwiseVal: 60,
    staticVal: 91
};

exports.turnContServo = function (servo, data) {
    try {
        if('rotate' in data) {
            if(data['rotate'] === 'stop') {
                servo.angle(ContServoInfo.staticVal); //stop rotate
            }
            
            var timeToRotate = 0;
            if('angle' in data) {
                var angle = Number(data['angle']);
                if(isNaN(angle)) {
                    return false;
                }
                
                if(angle < 0) {
                    angle *= -1;
                }
                var timeToRotate = angle / ContServoInfo.angleSpeed;
            
            }
            else {
                timeToRotate = -1;
            }
            
            if(data['dir'] === 'clockwise') { //clockwise
                servo.angle(ContServoInfo.normalClockwiseVal);   
            }
            else { //counter-clockwise
                servo.angle(ContServoInfo.normalCounterClockwiseVal);
            }
            
            if(timeToRotate > 0) {
                setTimeout(function () {
                    servo.angle(ContServoInfo.staticVal); //stop rotate
                }, timeToRotate * 1000);
            }
            
            return true;
        }
        else {
            return false;
        }
        
    }
    catch(err) {
        console.log(err);
        return false;
    }    
};

var ACMotorInfo = {
    angleSpeed: 360 / 9,
};

exports.turnACMotor = function(dirRelay, powRelay, data) {
    try {
        if('rotate' in data) {
            if(data['rotate'] === 'stop') {
                powRelay.turnOff();
                return true;
            }
            
            if(data['dir'] === 'clockwise') { //clockwise
                dirRelay.turnOn();
            }
            else { //counter-clockwise
                dirRelay.turnOff();
            }
            
            if('angle' in data) {
                var angle = Number(data['angle']);
                if(isNaN(angle)) {
                    return false;
                }
                
                if(angle < 0) {
                    angle *= -1;
                }
                
                var timeToRotate = angle / ACMotorInfo.angleSpeed;
                
                powRelay.turnOn();
                setTimeout(function () {
                    powRelay.turnOff();
                }, timeToRotate * 1000);
                
            }
            else {
                powRelay.turnOn();
            }
            
            return true;
        }
        else {
            return false;
        }
        
    }
    catch(err) {
        console.log(err);
        return false;
    } 
};

var currentDir = 0;

exports.triggerClapper = function(enablePin, dirPin, stepPin) {
    try {
        enablePin.digitalWrite(0);
        var dirFlag = true;
        var round = 0;
        dirPin.digitalWrite(currentDir);
        var i = 0;
        var initStepState = 0;
        var toSetTimeOut = true;
        var intervalObj = setInterval(function () {
            if(i >= 60) {
                if(toSetTimeOut) {
                    toSetTimeOut = false;
                    setTimeout(function () {
                        i = 0;
                        toSetTimeOut = true;
                        currentDir = 1 - currentDir;
                        dirPin.digitalWrite(currentDir);
                        round++;
                        if(round >= 50) {
                            clearInterval(intervalObj);
                            enablePin.digitalWrite(1);
                        }
                    }, 50);  
                }
            } 
            else {   
                stepPin.digitalWrite(initStepState);
                initStepState = 1 - initStepState;
                i++;   
            }   
            
            
        }, 0);
        return true;
    }
    catch(err) {
        console.log(err);
        return false;
    }
};

exports.relayTest = function(relay, data) {
    try {
        var value = 1;
        setInterval(function() {
            if(value === 1) {
                relay.turnOn();   
            }
            else {
                relay.turnOff();
            }
            value = 1 - value;
            
        }, 1000);
        
        return true;
        
    }
    catch(err) {
        console.log(err);
        return false;
    }
};
