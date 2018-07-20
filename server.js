// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var error = require('./fail.js');
const funcArray = require('./funcArray.js');
const userArray = require('./userArray.js');
const socketActions = require('./socketActions.js');

//I have too many variables right now. I want users and rooms tied together.
//The program can look up a room by the name, and find what users are in said room.
//We need to look up a room and update the user list of thsoe in the room with only those usernames that are in the room. 
var users = [];
var connections = [];

function sendMessage(data){
  io.sockets.emit('new message', data);
};
function addUser(newUser){
  console.log(newUser); 
  users = funcArray.addToArray(users, newUser);
  updateUserList();
}
function removeUser(user){
  console.log("removing " + user);
  //find username associated with socket?
}
function updateUserList(){
  console.log(users);
  io.sockets.emit('userList update', {users: users});
};

//here, data is expected to consist of {room, username,id}
function enterRoom(data){
  console.log("Entering channel " + data.room + ", " + data.username + "," + data.id);
  
}


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

//Connect. Eventually, add code to add user to chosen room
/*events to receive:
    disconnect
    reconnect
    enter room
    send new user  -- redundant, maybe? A user is inherently paired with a room.
    send message
    receive video stream
 */
io.sockets.on('connection', function(socket){
  connections = funcArray.addToArray(connections, socket);
  console.log('Connected: %s sockets connected', connections.length);
  console.log("id: " + socket.id);
  
  //Disconnect
  socket.on('disconnect', function(data){
    connections = funcArray.removeFromArray(connections, socket);
    console.log("Disconnected: %s sockets connected", connections.length);
  });
  //data expected to consist of {room, username}
  socket.on('enter room', (data) => {
    /*check if room already exists. Lookup in array # of elements with room = room 
        If it does, check size of users
            If it is less than 2, add {room, user} to room, add socket to channel with id room
            If it is 2 or more, reject join request, try again.
        If it doesn't, add to array, add socket to channel with id room.
      */
    
    users = userArray.addUser(users, {user: data.user, room: data.room, id: socket.id});
    //insert check here.
    socket.join(data.room, () => {
      //io.to(data.room).emit('');
    });
    enterRoom({...data, id: socket.id});
  });
  socket.on('send new user', (data) =>{
    addUser(data);
  });
  socket.on('send message', sendMessage);
  
});

// listen for requests :)
var listener = server.listen(process.env.PORT || 3000, function () {
  console.log('Listening on port ' + listener.address().port);
});

