var express = require('express');
var router = express.Router();
var errorCode = 406;


// middleware that is specific to this router
// router.use(function timeLog(req, res, next) {
//   console.log('Time: ', Date.now());
//   next();
// });

// router.get('/',function(req, res) {
//   res.send('motors control');
// });

// router.get('/:motorNum/:angle',function(req, res) {
//   res.send('motor ' + req.params.motorNum + ' turn to ' + req.params.angle);
// });

router.post('/',function(req, res) {
//   console.log(req.body);
  var bodyData = req.body;
  try {
    if('servo' in bodyData && 'angle' in bodyData) {
      res.send('servo ' + bodyData.servo + ' turn to ' + bodyData.angle);  
    }
  }
  catch(err) {
    res.status(errorCode).send(err.toString());
    return;
  }
  
});

module.exports = router;