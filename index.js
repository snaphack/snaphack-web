var fs = require('fs');
var path = require('path');

var express = require('express');
var multer = require('multer');

var app = express();

var config = {
  port: 80
}

var staticPath = path.join(__dirname, 'frontend/static');
app.use('/static', express.static(staticPath));

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '/snaps'));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

var upload = multer({
  dest: 'snaps/',
  storage: storage
});

app.post('/upload-snap', upload.single('snap'), function(req, res, next) {
  console.log("Something POSTed /upload-snap...");
  console.log(req.file)

  res.status(200);
  res.end();
});

function getPosition(string, subString, index) {
  return string.split(subString, index).join(subString).length;
}

var snapsFolder = path.join(__dirname, 'snaps');
app.use('/snaps', express.static(snapsFolder));

app.get('/get-snaps', function(req, res) {
  var snaps = [];

  fs.readdir(snapsFolder, function(err, files) {

    // thank mr jobs
    if(files.includes('.DS_Store')) {
      var ind = files.indexOf('.DS_Store');
      files.splice(ind, 1);
    }

    files.forEach(function(file) {

      var url = "http://" + req.get('host') + "/snaps/" + file;
      var from = file.substring(0, file.indexOf('-'));
      var date = file.substring(file.indexOf('-') + 1 , file.length);
      date = parseInt(date.substring(0, date.indexOf('.')));
      var length = file.substring(getPosition(file, '-', 2) + 1, file.indexOf('.'));

      snaps.push({
        url: url,
        filename: file,
        from: from,
        date: date,
        length: length
      });
    })

    res.json(snaps);
  });
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'frontend/index.html'));
});

app.listen(config.port, function () {
  console.log('Example app listening on', config.port);
});
