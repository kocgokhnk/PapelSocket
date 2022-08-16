"use strict";
var path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();
const server = require('https').createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
}, app);
/*.createServer();*/


const options = {};
const io = require('socket.io')(server, options);
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true } ));

let socketUsers = []
let admin_id_from_session = []

var connected_adminID;
var connected_courseID;


io.sockets.on('connection', function(socket) {
    console.log('Socket connected. ID: ' + socket.id);
    socket.on('refresh', function() {
        console.log('Refresh received from ID: ' + socket.id);
    });
    socket.on("register", function(adminId){
        console.log("Socket registered_admin: ", adminId);
        socketUsers.push({
            adminId, socket, socketId: socket.id
        })

        setTimeout(() => {
            admin_id_from_session.push({
                adminId
            })
        }, 2000);

    })
    socket.on("send_token", function(bitmap){
        console.log("Field: ", bitmap);

        const paddedBin = BigInt('0x' + bitmap.toString('hex')).toString(2).padStart(bitmap.length * 8, '0') // convert binary
        //console.log("each value: "+paddedBin);

        if(paddedBin.at(2)!=1 || paddedBin.at(10)!=1 || paddedBin.at(11)!=1 || paddedBin.at(12)!=1 || paddedBin.at(42)!=1 || paddedBin.at(62)!=1 ){
            console.log("err")
            socket.emit("response","err")
        }else {
            console.log("210")
            socket.emit("response",210)
        }

    })

    socket.on('disconnect', function() {
        console.log('Disconnect received from ID: ' +socket.id);
        const index = socketUsers.findIndex(socketUser => socketUser.socketId === socket.id)
        if(index === -1){
            return;
        }
        socketUsers.splice(index, 1)
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});