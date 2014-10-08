var http = require('http'),
    fs = require('fs'),
    host = 'localhost',
    port = '8081',
    auth = null,
    lastFile = null,
    lastM3U = false,
    i = 2,
    length = process.argv.length;

for (; i < length; i++) {
    if (process.argv[i].indexOf('--host=') === 0) {
        host = process.argv[i].substring(7);
    } else if (process.argv[i].indexOf('--port=') === 0) {
        port = process.argv[i].substring(7);
    } else if (process.argv[i].indexOf('--auth=') === 0) {
        auth = process.argv[i].substring(7);
    }
}

function getOption(url) {
    return {
        host: host,
        port: port,
        path: '/' + url,
        encoding: null,
        method: 'POST'
    };
}

fs.exists('camera', function (exists) {
    if (exists) {
        beginPolling();
        logCameraPolling();
    } else {
        logCameraDirectoryError();
    }
});

function logCameraDirectoryError() {
    console.log('Directory \'camera\' does not exist, must not be streaming.');
}

function logCameraPolling() {
    console.log('Polling for changes within \'camera\'.');
}

function beginPolling() {
    fs.watch('camera', function (event, filename) {
        if (filename === 'mystream.m3u8') {
            if (lastM3U) {
                uploadFile(lastFile + '');
                lastM3U = false;
            } else {
                lastM3U = true;
            }
        } else {
            lastFile = filename;
            lastM3U = false;
        }
    });
}

function uploadFile(filename) {

    if (filename !== 'mystream.m3u8') {
        var i = filename.substring(8, filename.lastIndexOf('.')) * 1 - 1;
        if (i == -1) {
            i = 2;
        }
        filename = 'mystream' + i + '.ts';
    }
    console.log('Sending ' + filename);
    fs.stat('camera/' + filename, function (err, stats) {
        var iSent = 0,
            o = getOption(filename),
            f = fs.createReadStream('camera/' + filename),
            r;

        o.headers = {
            'Content-Length': stats.size
        };

        if (auth !== null) {
            o.headers.Authorization = auth;
        }

        r = http.request(o, function (res) {
            res.on('data', function (data) {});
            res.on('end', function () {
                if (filename !== 'mystream.m3u8') {
                    uploadFile('mystream.m3u8');
                }
            });
        });

        f.on('data', function (data) {
            r.write(data);
            iSent += data.length;
            if (iSent === stats.size) {
                r.end();
            }
        });

    });

}
