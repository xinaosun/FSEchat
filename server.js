var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    users = [];

    app.get('/', function(req, res){res.sendFile(__dirname + '/page.html');});
    server.listen(3000);  
  
    //socket 
    io.sockets.on('connection',function(socket) {
       console.log("An user is connected.");
    
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
        };
    });  
        
        socket.on('disconnect', function() {
        users.splice(socket.userIndex, 1);
        socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
        console.log("One User Disconnect");
        });
        
        //无法显示其他用户的信息
        socket.on('postMsg', function(msg) {
            socket.broadcast.emit('newMsg', socket.nickname, msg);
    });
});
