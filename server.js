// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var error = require('./fail.js');
const funcArray = require('./funcArray.js');
const socketActions = require('./socketActions.js');


var users = [];
var connections = [];

function sendMessage(data){
  io.sockets.emit('new message', {msg: data});
};

//need functions for adding and dropping elements from arrays w/out modifying said array.
//ie we want our arrays to be immutable. 

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html 
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/test", (req, res) => {
  res.sendFile(__dirname + '/views/chatroom.html');
});

io.sockets.on('connection', function(socket){
  connections = funcArray.addToArray(connections, socket);
  console.log('Connected: %s sockets connected', connections.length);
  
  //Disconnect
  socket.on('disconnect', function(data){
    connections = funcArray.removeFromArray(connections, socket);
    console.log("Disconnected: %s sockets connected", connections.length);
  });
  
  socket.on('send message', sendMessage);
  
});

// listen for requests :)
var listener = server.listen(process.env.PORT || 3000, function () {
  console.log('Listening on port ' + listener.address().port);
});

