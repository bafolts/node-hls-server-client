#!/bin/bash

avconv -f pulse -i alsa_input.usb-046d_HD_Pro_Webcam_C920_07CBC36F-02-C920.analog-stereo -async 25 -f video4linux2 -i /dev/video0 -c:a aac -strict experimental -c:v h264 -r 25 -preset ultrafast -tune zerolatency -profile:v baseline -threads auto -ar 44100 -b:a 64k -b:v 400k -hls_time 10 -hls_wrap 3 -start_number 1 camera/mystream.m3u8