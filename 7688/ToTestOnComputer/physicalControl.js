var exports = module.exports = {};
exports.turnServo = function (servo, data) {
    try {
        var angle = Number(data['angle']);
        if(isNaN(angle)) {
            return false;
        }
        console.log("turn to " + angle);
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
        var angle = Number(data['angle']);
        if(isNaN(angle)) {
            return false;
        }
        var clockwise = true;
        
        if(angle < 0) {
            angle *= -1;
            clockwise = false;
        }
        var timeToRotate = angle / ContServoInfo.angleSpeed;
        if(clockwise) {
            servo.angle(ContServoInfo.normalClockwiseVal);   
        }
        else {
            servo.angle(ContServoInfo.normalCounterClockwiseVal);
        }
        setTimeout(function () {
            servo.angle(ContServoInfo.staticVal); //stop rotate
        }, timeToRotate * 1000);
        
        return true;
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
        var angle = Number(data['angle']);
        console.log("turn angle in AC:" + angle);
        if(isNaN(angle)) {
            return false;
        }
        var clockwise = true;
        
        if(angle < 0) {
            angle *= -1;
            clockwise = false;
        }
        var timeToRotate = angle / ACMotorInfo.angleSpeed;
        powRelay.turnOn();
        if(clockwise) {
            servo.angle(dirRelay.turnOn());
        }
        else {
            servo.angle(dirRelay.turnOff());
        }
        setTimeout(function () {
            powRelay.turnOff();
        }, timeToRotate * 1000);
        
        return true;
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
