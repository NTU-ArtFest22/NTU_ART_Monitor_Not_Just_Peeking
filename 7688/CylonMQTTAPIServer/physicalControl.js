var exports = module.exports = {};
exports.turnServo = function (servo, data, callback) {
    var errMsg = "";
    var failedHandler = function() {
        if(callback) {
            callback(false, errMsg);
            errMsg = "";
        }
    };
    
    var succeedHandler = function() {
        if(callback) {
            callback(true);
        }
    };
    
    try {
        var angle = Number(data['angle']);
        if(isNaN(angle)) {
            errMsg = 'angle cannot be parsed';
            failedHandler();
            return;
        }
        else {
            servo.angle(angle);
            succeedHandler();   
        }
    }
    catch(err) {
        console.log(err);
        errMsg = err.toString();
        failedHandler();
    }
};

var ContServoInfo = {
    angleSpeed: 360 / 2.0,
    normalClockwiseVal: 120,
    normalCounterClockwiseVal: 60,
    staticVal: 80
};

exports.turnContServo = function (servo, data, callback) {
    var errMsg = "";
    var failedHandler = function() {
        if(callback) {
            callback(false, errMsg);
            errMsg = "";
        }
    };
    
    var succeedHandler = function() {
        if(callback) {
            callback(true);
        }
    };
    
    try {
        if('rotate' in data) {
            if(data['rotate'] === 'stop') {
                servo.angle(ContServoInfo.staticVal); //stop rotate
                succeedHandler();
                return;
            }
            
            var timeToRotate = 0;
            if('angle' in data) {
                var angle = Number(data['angle']);
                if(isNaN(angle)) {
                    errMsg = 'angle cannot be parsed';
                    failedHandler();
                    return;
                }
                
                if(angle < 0) {
                    angle *= -1;
                }
                timeToRotate = angle / ContServoInfo.angleSpeed;
            
            }
            else {
                timeToRotate = -1;
            }
            
            var constantlyRotatingHandler = function() {
                if(timeToRotate < 0) {
                    succeedHandler();
                }
                //otherwise handle it later
            };
            
            if(data['dir'] === 'clockwise') { //clockwise
                servo.angle(ContServoInfo.normalClockwiseVal);
            }
            else { //counter-clockwise
                servo.angle(ContServoInfo.normalCounterClockwiseVal);
            }
            constantlyRotatingHandler();
            
            if(timeToRotate > 0) {
                setTimeout(function () {
                    servo.angle(ContServoInfo.staticVal); //stop rotate
                    succeedHandler();
                }, timeToRotate * 1000);
            }
            
            return;
        }
        else {
            errMsg = 'no rotate specified';
            failedHandler();
            return;
        }
        
    }
    catch(err) {
        console.log(err);
        errMsg = err.toString();
        failedHandler();
        return;
    }    
};

var ACMotorInfo = {
    angleSpeed: 360 / 9,
};

exports.turnACMotor = function(dirRelay, powRelay, data, callback) {
    var errMsg = "";
    var failedHandler = function() {
        if(callback) {
            callback(false, errMsg);
            errMsg = "";
        }
    };
    
    var succeedHandler = function() {
        if(callback) {
            callback(true);
        }
    };
    
    try {
        if('rotate' in data) {
            if(data['rotate'] === 'stop') {
                powRelay.turnOff();
                succeedHandler();
                return;
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
                    errMsg = 'angle cannot be parsed';
                    failedHandler();
                    return;
                }
                
                if(angle < 0) {
                    angle *= -1;
                }
                
                powRelay.turnOn();
                setTimeout(function () {
                    powRelay.turnOff();
                    succeedHandler();
                }, (angle / ACMotorInfo.angleSpeed) * 1000);
                
            }
            else {
                powRelay.turnOn();
                succeedHandler();
            }
            
            return;
        }
        else {
            errMsg = 'no rotate specified';
            failedHandler();
            return;
        }
        
    }
    catch(err) {
        console.log(err);
        errMsg = err.toString();
        failedHandler();
        return;
    } 
};

var currentDir = 0;
var clapperInfo = {
    numMovesInADir : 60,
    timeForReversing : 50,
    totalRounds : 50
};

exports.triggerClapper = function(enablePin, dirPin, stepPin, callback) {
    var errMsg = "";
    var failedHandler = function() {
        if(callback) {
            callback(false, errMsg);
            errMsg = "";
        }
    };
    
    var succeedHandler = function() {
        if(callback) {
            callback(true);
        }
    };
    
    try {
        enablePin.digitalWrite(0);
        var dirFlag = true;
        var round = 0;
        dirPin.digitalWrite(currentDir);
        var i = 0;
        var initStepState = 0;
        var toSetTimeOut = true;
        var intervalObj = setInterval(function () {
            if(i >= clapperInfo.numMovesInADir) {
                if(toSetTimeOut) {
                    toSetTimeOut = false;
                    setTimeout(function () {
                        i = 0;
                        toSetTimeOut = true;
                        currentDir = 1 - currentDir;
                        dirPin.digitalWrite(currentDir);
                        round++;
                        if(round >= clapperInfo.totalRounds) {
                            clearInterval(intervalObj);
                            enablePin.digitalWrite(1, succeedHandler); //disable
                        }
                    }, clapperInfo.timeForReversing);  
                }
            } 
            else {   
                stepPin.digitalWrite(initStepState);
                initStepState = 1 - initStepState;
                i++;   
            }  
        }, 0);
    }
    catch(err) {
        console.log(err);
        errMsg = err.toString();
        failedHandler();
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
