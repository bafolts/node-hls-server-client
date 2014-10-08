node-hls-server-client
======================

An HLS server and client written in node.

## HLS Proxy Client
The HLS proxy client uses node to stream any changes to a live HLS stream to an HLS server. Useful for streaming from a non-static IP to a server on a static IP.

## HLS Server
The HLS server uses node to stream the segments and playlist file from a static IP. For browsers which don't support HLS the VideoJS library is used. The segments are stored in memory and retrieved from the HLS Proxy Client.

## Usage

This is a work in progress. I created this tool to live stream my sister's wedding from a cell phone. Support for other clients will be added as people need to utilize other software or hardware. I used a Logitech 920C HD Webcam for the current version.

### On HLS segmenter

#### To start the recording HLS
```
./start_camera
```
#### To send the data to the HLS Server
```
node client.js --host=127.0.0.1 --port=8081 --auth=123somehash321
```
### On HLS server

### To start the server
```
node server.js --port=8081 --auth=123somehash321
```
