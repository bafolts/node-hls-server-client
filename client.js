var http = require('http'),
    fs = require('fs'),
    exec = require('child_process').exec;

function getOption(url) {
  return {
    host: '71.196.237.192',
    port: '8082',
    path: '/'+url,
    encoding: null,
    method: 'POST'
  }  
}

console.log("Watching for changes in uploads");

var lastFile = null;
var lastM3U = false;

fs.watch('camera', function (event, filename) {
  if (filename === 'mystream.m3u8') {
    if (lastM3U) {
      uploadFile(lastFile + "");
      lastM3U = false;      
    } else {
      lastM3U = true;
    }
  } else {
    lastFile = filename;
    lastM3U = false;
  }
});

function uploadFile(filename) {

  if (filename !== "mystream.m3u8") {
    var i = filename.substring(8, filename.lastIndexOf("."))*1 - 1;
    if (i == -1) {
      i = 2
    }
    filename = 'mystream' + i + '.ts';
  }
  console.log("Sending " + filename);
  fs.stat('camera/' + filename, function (err, stats) {
    var iSent = 0;
    var o = getOption(filename);
    o.headers = {
      "Content-Length": stats.size
    };
    var r = http.request(o, function (res) {
      res.on('data', function (data) {
	//console.log(data)
      })
      res.on('end', function () {
	if (filename !== "mystream.m3u8") {
	  uploadFile("mystream.m3u8");
	}
      })
    });
    var f = fs.createReadStream('camera/' + filename);
    
    f.on('data', function (data) {
      r.write(data);
      iSent += data.length;
      if (iSent === stats.size) {
	r.end();
      }
    })
    
  });

}
