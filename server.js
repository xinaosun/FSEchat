     // FSE chat room
    // Author: Xinao Sun

    var express = require('express');
    var app = express();
    var server = require('http').createServer(app);
    var io = require('socket.io').listen(server);
    var users = [];
    var mongo = require('mongodb').MongoClient;

    app.get('/', function(req, res){res.sendFile(__dirname + '/page.html');});
    server.listen(3000);  
    console.log("Waiting for connection...");

    //connect to mongodb
    mongo.connect('mongodb://127.0.0.1/', function(err, db){
        if(err) throw err;

        // socket connection event
        io.sockets.on('connection',function(socket) {
            
            var col = db.collection('messages');

            // emit all history messages
            // order is reversed

            col.find().limit(100).sort({_id:  1}).toArray(function(err, res){
                if(err) throw err;

                socket.emit('output', res);



            });

            // connect to server
            console.log("Someone is connecting...");

            //new user login
            socket.on('login', function(nickname) {
                if (users.indexOf(nickname) > -1) {
                    socket.emit('nickExisted');
                } else {
                    socket.userIndex = users.length;
                    socket.nickname = nickname;
                    users.push(nickname);
                    socket.emit('loginSuccess');
                    io.sockets.emit('system', nickname, users.length, 'login');
                    console.log(socket.nickname + " is connected.");

                    //mongodb
                    
                };
            });  
            
            // users disconnect event
            socket.on('disconnect', function() {
                users.splice(socket.userIndex, 1);
                socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
                console.log( socket.nickname +" disconnected");
            });
        
            // post message event
            socket.on('postMsg', function(msg) {
                var message = msg;
                var name = socket.nickname;

                // test for input
                // console.log(msg);

                // server broadcasting
                socket.broadcast.emit('newMsg', socket.nickname, msg);
                
                // db insertion
                col.insert({name: name, message: message}, function(){
                    console.log('Inserted a line of data');

                });

            });
        });
    });



   