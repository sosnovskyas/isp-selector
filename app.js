var express = require('express');
var app = express();

var fs = require("fs");
var path = require('path');
var appDir = path.dirname(require.main.filename);

var config = JSON.parse(fs.readFileSync(appDir + '/config.json', 'utf8'));

var MMDBReader = require('mmdb-reader');
var reader = new MMDBReader('/usr/share/GeoIP2-ISP.mmdb');
var clientIpAddress;
var showPage;


app.get('/', function(req, res) {
  var content;
  var result;
  var ruleNum;
  var fullPath;
  clientIpAddress = req.headers['x-forwarded-for'];
  clientReqObj = reader.lookup(clientIpAddress);//['isp'];
  rulesObj = config['rules'];

  for(var attr in rulesObj){
    // set ISP list in this rule
    var curIspList = rulesObj[attr]['isp'];

    for(var curIsp in curIspList){
      // chech ISP in list with client ISP
      if ( clientReqObj['isp'] == curIspList[curIsp]) {
        showPage = rulesObj[attr]['url'];
        ruleNum = attr;
        break;
      }
      result += curIspList[curIsp];
    }
    //result += rulesObj[attr];
  }

  fullPath = __dirname +
  '/public/' +
  rulesObj[ruleNum]['vertical'] + '/' +
  rulesObj[ruleNum]['geo'] + '/' +
  rulesObj[ruleNum]['land'];
  content = fs.readFileSync(fullPath + '/index.html', 'utf-8');
  app.use(express.static(fullPath));
  //res.send(fullPath + content);
  res.send(content);
});


var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port)

});