module.exports = function() {
    var fs = require('fs');
    var motorState = {
        still: 0,
        clockwise: 1,
        counterClockwise: 2  
    };

    var contServoInfo = JSON.parse(fs.readFileSync('./contServoInfo.json'));
    
    var ContServo = function(servo) {
        return {
            servo: servo,
            normalClockwiseVal: contServoInfo.normalClockwiseVal,
            normalCounterClockwiseVal: contServoInfo.normalCounterClockwiseVal,
            staticVal: contServoInfo.staticVal,
            angleSpeed: contServoInfo.angleSpeed,
            minAngle: contServoInfo.minAngle,
            maxAngle: contServoInfo.maxAngle,
            currentState: motorState.still,
            preState: motorState.still,
            currentAngle: 0,
            stop: function() {
                this.servo.angle(this.staticVal); //stop rotate
                this.currentState = motorState.still;
                // console.log('stop in contServo');
            },
            
            operate: function (data, callback) {
                var failedHandler = function(errMsg) {
                    if(callback) {
                        callback(false, errMsg);
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
                            this.stop();
                            succeedHandler();
                            return;
                        }
                        else if(data['rotate'] === 'start') {
                            if(data['dir'] === 'clockwise') { //clockwise
                                this.servo.angle(this.normalClockwiseVal);
                                this.currentState = motorState.clockwise;   
                            }
                            else { //counter-clockwise
                                this.servo.angle(this.normalCounterClockwiseVal);
                                this.currentState = motorState.counterClockwise;
                            }
                            
                            succeedHandler();
                            
                            return;
                        }
                        
                    }
                    else {
                        failedHandler('no rotate specified');
                        return;
                    }
                    
                }
                catch(err) {
                    console.log(err);
                    failedHandler(err.toString());
                    return;
                }    
            }
        };
    };
    
    var ACMotorInfo = JSON.parse(fs.readFileSync('./ACMotorInfo.json'));
    var ACMotor = function(clockRelay, counterClockRelay) {
        return {
            clockRelay: clockRelay,
            counterClockRelay: counterClockRelay,
            angleSpeed: ACMotorInfo.angleSpeed,
            minAngle: ACMotorInfo.minAngle,
            maxAngle: ACMotorInfo.maxAngle,
            currentState: motorState.still,
            preState: motorState.still,
            currentAngle: 0,
            stop: function() {
                this.clockRelay.turnOff();
                this.counterClockRelay.turnOff();
                this.currentState = motorState.still;
            },
            
            operate: function(data, callback) {
                var failedHandler = function(errMsg) {
                    if(callback) {
                        callback(false, errMsg);
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
                            this.stop();
                            succeedHandler();
                            return;
                        }
                        else if(data['rotate'] === 'start') {
                            
                            if(data['dir'] === 'clockwise') { //clockwise
                                this.clockRelay.turnOn();
                                this.counterClockRelay.turnOff();
                                this.currentState = motorState.clockwise;
                            }
                            else { //counter-clockwise
                                this.counterClockRelay.turnOn();
                                this.clockRelay.turnOff();
                                this.currentState = motorState.counterClockwise;
                            }
                            
                            succeedHandler();
                            return;
                        }
                        
                    }
                    else {
                        failedHandler('no rotate specified');
                        return;
                    }
                    
                }
                catch(err) {
                    console.log(err);
                    failedHandler(err.toString());
                    return;
                } 
            }
        };
    };

    var Clapper = function(enablePin, dirPin, stepPin) {
        return {
            enablePin: enablePin,
            dirPin: dirPin,
            stepPin: stepPin,
            numMovesInADir : 60,
            timeForReversing : 50,
            totalRounds : 50,
            currentDir: 0,
            operate: function(callback) {
        
                var failedHandler = function(errMsg) {
                    if(callback) {
                        callback(false, errMsg);
                    }
                };
                
                var succeedHandler = function() {
                    if(callback) {
                        callback(true);
                    }
                };
                
                try {
                    this.enablePin.digitalWrite(0);
                    var dirFlag = true;
                    var round = 0;
                    this.dirPin.digitalWrite(this.currentDir);
                    var i = 0;
                    var initStepState = 0;
                    var toSetTimeOut = true;
                    var intervalObj = setInterval(function () {
                        if(i >= this.numMovesInADir) {
                            if(toSetTimeOut) {
                                toSetTimeOut = false;
                                setTimeout(function () {
                                    i = 0;
                                    toSetTimeOut = true;
                                    this.currentDir = 1 - this.currentDir;
                                    this.dirPin.digitalWrite(this.currentDir);
                                    round++;
                                    if(round >= this.totalRounds) {
                                        clearInterval(intervalObj);
                                        this.enablePin.digitalWrite(1, succeedHandler); //disable
                                    }
                                }, this.timeForReversing);  
                            }
                        } 
                        else {   
                            this.stepPin.digitalWrite(initStepState);
                            initStepState = 1 - initStepState;
                            i++;   
                        }  
                    }, 0);
                }
                catch(err) {
                    console.log(err);
                    failedHandler(err.toString());
                }
            }
            
        };  
    };

    var relayTest = function(relay, data) {
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
    
    var turnNormalServo = function (servo, data, callback) {
        var failedHandler = function(errMsg) {
            if(callback) {
                callback(false, errMsg);
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
                failedHandler('angle cannot be parsed');
                return;
            }
            else {
                servo.angle(angle);
                succeedHandler();   
            }
        }
        catch(err) {
            console.log(err);
            failedHandler(err.toString());
        }
        
    };
    
    return {
        turnNormalServo: turnNormalServo,
        ContServo: ContServo,
        ACMotor: ACMotor,
        Clapper: Clapper,
        relayTest: relayTest,
        motorState: motorState,
        setInnerLoop: function(motors) {
            var innerLoopPeriod = 0.01;
            var mMotors = motors;
            var updateAngle = function(motorInfo, updatingPeriod) {
                if(motorInfo.currentState != motorState.still) {
                    // console.log('angle:' + motorInfo.currentAngle);
                    if(motorInfo.preState === motorState.still) {
                        if(motorInfo.currentAngle >= motorInfo.maxAngle) {
                            motorInfo.currentAngle = motorInfo.maxAngle - 1;
                        }
                        else if(motorInfo.currentAngle <= motorInfo.minAngle) {
                            motorInfo.currentAngle = motorInfo.minAngle + 1;
                        }
                    }
                    
                    if(motorInfo.currentAngle >= motorInfo.maxAngle || motorInfo.currentAngle <= motorInfo.minAngle) {
                        // console.log('it stopped');
                        motorInfo.stop();   
                    }
                    else if(motorInfo.currentState === motorState.clockwise) {
                        motorInfo.currentAngle += (motorInfo.angleSpeed * updatingPeriod);            
                    }  
                    else if(motorInfo.currentState === motorState.counterClockwise) {
                        motorInfo.currentAngle -= (motorInfo.angleSpeed * updatingPeriod);
                    }    
                }
                
                motorInfo.preState = motorInfo.currentState;
                
            };
            
            var intervalObj = setInterval(function() {
                for(var i = 0;i < mMotors.length;i++) {
                    updateAngle(mMotors[i], innerLoopPeriod);
                }
            }, innerLoopPeriod);
            
            return {
                intervalObj: intervalObj
            };
            
        }
    };
  
};
