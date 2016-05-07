module.exports = function() {
    var resType = {
        success: 0,
        wrongFormat: 1,
        unknownTarget: 2,
        targetNotExist: 3,
        waiting: 4,
        selfDefinedFailedMsg: 5,
        isYourTurn: 6
    };
    
    var priority = {
        first: 0,
        high: 50,
        normal: 100
    };
    
    var canBeIgnored = function (data) {
        return ("status" in data); 
    };
    
    var setResponse = function (response, type, otherMsg) {
        if(type === resType.success) {
            response.status = "success";
            response.msg = "";
        }
        else if(type === resType.selfDefinedFailedMsg) {
            response.status = "fail";
            response.msg = otherMsg;
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
        else if(type === resType.waiting) {
            response.status = "unknown";
            response.msg = "waiting in queue";
        }
        else if(type === resType.isYourTurn) {
            response.status = "unknown";
            response.msg = "is your turn";
        }
    };
    
    return {
        canBeIgnored: canBeIgnored,
        setResponse: setResponse,
        resType: resType,
        priority: priority
    };
};
    