var http = require('http'),
    url = require('url'),
    sys = require('sys'),
    fs = require('fs'),
    auth = null,
    port = 8081,
    SegmentBuffers = {},
    i = 2,
    length = process.argv.length;

for (; i < length; i++) {
    if (process.argv[i].indexOf('--auth=') === 0) {
        auth = process.argv[i].substring(7);
    } else if (process.argv[i].indexOf('--port') === 0) {
        port = process.argv[i].substring(7) * 1;
    }
}

http.createServer(function (req, res) {

    if (req.method === 'GET') {
        if (req.url === '/uploads/mystream.m3u8') {
            displayPlaylist(req, res);
        } else if (req.url.indexOf('/uploads/mystream') === 0) {
            displayStream(req, res);
        } else if (req.url === '/js/videojs-media-sources.js' || req.url === '/js/videojs.hls.min.js') {
            displayJsFile(req, res, req.url);
        } else {
            displayVideo(req, res);
        }
    } else if (req.method === 'POST') {
        uploadVideo(req, res);
    } else {
        displayError(req, res);
    }

}).listen(port);

function displayJsFile(req, res, fname) {

    fs.stat(fname.substring(1), function (err, stats) {
        var readStream = fs.createReadStream(fname.substring(1));
        res.writeHead(200, {
            'Content-Type': 'application/javascript',
            'Content-Length': stats.size
        });
        readStream.pipe(res);
    });

}

function displayStream(req, res) {

    var n = req.url.substring(9);

    if (n in SegmentBuffers) {
        res.writeHead(200, {
            'Content-Type': 'video/MP2T',
            'Content-Length': SegmentBuffers[n].length
        });
        res.end(SegmentBuffers[n]);
    } else {
        res.writeHead(404);
        res.end();
    }

}

function displayPlaylist(req, res) {

    var n = req.url.substring(9);

    if (n in SegmentBuffers) {
        res.writeHead(200, {
            'Content-Type': 'application/x-mpegURL'
        });
        res.end(SegmentBuffers[n]);
    } else {
        res.writeHead(404);
        res.end();
    }

}

function displayVideo(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});

    res.write('<!doctype html><html><head><meta charset="utf-8">');
    res.write('<title>Camera Test</title>');
    res.write('<link href="//vjs.zencdn.net/4.8/video-js.css" rel="stylesheet">');
    res.write('<script src="//vjs.zencdn.net/4.8/video.js"></script>');
    res.write('<script src="/js/videojs-media-sources.js"></script>');
    res.write('<script src="/js/videojs.hls.min.js"></script>');
    res.write('</head><body onload="videojs(\'video\')">');
    res.write('<video autoplay id="video" class="video-js vjs-default-skin" height="480" width="640" controls><source src="/uploads/mystream.m3u8" type="application/x-mpegURL" /></video>');
    res.write('</body></html>');

    res.end();
}

function uploadVideo(req, res) {
    if (auth !== null && req.headers.Authorization !== auth) {
        displayForbidden(res);
    } else {
        var n = req.url.substring(1),
            s = [];

        if (!(n in SegmentBuffers)) {
            SegmentBuffers[n] = new Buffer(req.headers['Content-Length'] * 1);
        }
        req.on('data', function (d) {
            s.push(d);
        });
        req.on('end', function () {
            SegmentBuffers[n] = Buffer.concat(s);
            res.end();
        });
    }
}

function displayForbidden(req, res) {
    res.writeHead(403, {'Content-Type': 'text/plain'});
    res.end('Permission Denied');
}

function displayError(req, res) {
    res.writeHead(500, {'Content-Type': 'text/plain'});
    res.end('Unknown Error');
}

console.log('Server up and listening on port ' + port);
