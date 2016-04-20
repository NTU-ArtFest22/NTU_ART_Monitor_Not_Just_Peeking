from requests.auth import HTTPBasicAuth
import requests
import json
import base64
with open('./config/default.json') as configFile:
    configData = json.load(configFile)
    #an example of post request with basic auth and body data
    url = 'http://localhost:8000/motors/turnServoMotor'

    bodyData = {
        "num" : "1",
        "angle" : "45"
    }

    #simple version    
    response = requests.post(url,
                             auth = HTTPBasicAuth(configData["BasicAuth"]["ID"],configData["BasicAuth"]["PASS"]),
                             data = bodyData)

    print 'simple:' + response.text
    
    #raw request
    headers = {
        "Content-Type" : "application/x-www-form-urlencoded",
        "Authorization" : "Basic %s" % base64.b64encode(("%s:%s" % (configData["BasicAuth"]["ID"],configData["BasicAuth"]["PASS"])).encode('ascii'))
    }
    
    # print headers
    
    response = requests.post(url,
                             headers = headers,
                             data = bodyData)
   
    print 'raw:' + response.text
    
    #json test
    response = requests.post(url,
                             auth = HTTPBasicAuth(configData["BasicAuth"]["ID"],configData["BasicAuth"]["PASS"]),
                             json = bodyData)
     
    print 'json test:' + response.text
                    
    