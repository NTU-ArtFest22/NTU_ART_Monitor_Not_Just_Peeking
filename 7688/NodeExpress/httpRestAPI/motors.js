var express = require('express');
var router = express.Router();

// middleware that is specific to this router
// router.use(function timeLog(req, res, next) {
//   console.log('Time: ', Date.now());
//   next();
// });

router.get('/',function(req, res) {
  res.send('motors control');
});

// router.get('/:motorNum/:angle',function(req, res) {
//   res.send('motor ' + req.params.motorNum + ' turn to ' + req.params.angle);
// });

router.post('/turnServoMotor',function(req, res) {
//   console.log(req.body);
  res.send('motor ' + req.body.num + ' turn to ' + req.body.angle);
});

module.exports = router;