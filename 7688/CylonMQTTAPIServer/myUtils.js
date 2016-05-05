module.exports = function() {
    var resType = {
        success: 0,
        wrongFormat: 1,
        unknownTarget: 2,
        targetNotExist: 3
    };
    
    var canBeIgnored = function (data) {
        return ("status" in data); 
    };
    
    var setResponse = function (response, type) {
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
    };
    
    return {
        canBeIgnored: canBeIgnored,
        setResponse: setResponse,
        resType: resType
    };
};
    