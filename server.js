// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var error = require('./fail.js');
const _ = require('underscore');
const funcArray = require('./funcArray.js');
const userArray = require('./userArray.js');
const socketActions = require('./socketActions.js');
const sanitizer = require('./sanitizer.js');

//The program can look up a room by the name, and find what users are in said room.
//We need to look up a room and update the user list of thsoe in the room with only those usernames that are in the room. 
var users = [];
var connections = [];

function existy(val){
  return val != null;
};

function truthy(val){
  return (val !== false) && existy(val);  
};


//data is expected to consist of {message, username, room}
function sendMessage(data){
  //sanitize message prior to sending.
  console.log("Sending message to room: " + data.room);
  data.message = sanitizer.sanitizeData(data.message);
  console.log(data);
  io.to(data.room).emit('new message', data);
};


function updateUserList(room){
  console.log('users is now: ');
  console.log(users);
  //get a subarray of users, consisting of those in the appropriate room/channel
  let usersInRoom = userArray.findUsersByRoom(users, room);
  console.log("users in room " + room + " are: ");
  console.log(usersInRoom);
  io.to(room).emit('userList update', {users: usersInRoom}); //!!!consider paring this down to just the users value for each entry.
  //currently sends username, room, id for each user in the room.
  //_.pluck(list, propertyName) will probably do the job.
};

//data is expected to consist of {room, username,id}
function enterRoom(data){
  let newUserList = userArray.addUser(users, data.username, data.room, data.id); //!!!check for error code before changing users
  if( newUserList == process.env.ERR_ID_TAKEN ){
    console.log("Error happened in enterRoom")
    //!!!send alert to client to refresh and try again
    //Note: low priority. Odds of randomly generated socket id being a match is slim, if not nonexistent due to socket io's implementation.
  } else {
    //new user list has been verified, okay to copy to main users array.
    users = newUserList;
    updateUserList(data.room);
  }
}

//userid is expected to consist of an id string, for now socket.id
function removeUser(userid){
  let user = userArray.findRoomById(users, userid)[0];
  let newUserList = userArray.removeUser(users, userid);
  if( newUserList == process.env.ERR_ID_NOT_FOUND ){
    //!!!Log user list at this time and the id we tried to remove, for debugging purposes.
    console.log("Error Occurred in removeUser");
  } else {
    //okay to copy to main users array
    console.log("removing user: " + user.username);
    users = newUserList;
    updateUserList(user.room);
  }
}

// http://expressjs.com/en/starter/static-files.html 
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (req, res) => {
  res.sendFile(__dirname + '/views/chatroom.html');
});

//Connect. Eventually, add code to add user to chosen room
/*events to receive:
    disconnect
    reconnect
    enter room
    send new user  -- redundant. A user is inherently paired with a room.
    send message
    receive video stream
 */
io.sockets.on('connection', function(socket){
  connections = funcArray.addToArray(connections, socket);
  console.log('Connected: %s sockets connected', connections.length);
  
  //Disconnect
  socket.on('disconnect', function(data){
    connections = funcArray.removeFromArray(connections, socket);
    console.log("Disconnected: %s sockets connected", connections.length);
    //!!!send message about disconnect to remaining users
    
    //find user's info in users array,
    //if it exists, remove their entry and send out update
    let socketUser = userArray.findUserById( users, socket.id );
    if(existy(socketUser) && !(_.isEqual(socketUser, []))){
      removeUser(socket.id);
      sendMessage({message: socketUser[0].username + " has left the room", username: "Server", room: socketUser[0].room});
    }
  });
  
  
  //data expected to consist of {room, username}
  socket.on('request room', (data) => {
    //!!!sanitize room and username here.
    data.room = sanitizer.sanitizeData(data.room);
    data.username = sanitizer.sanitizeData(data.username);
    if(data.room == ''){
      socket.emit('enter room', process.env.ERR_ROOMNAME_INVALID);
    } else if(data.username == ''){
      socket.emit('enter room', process.env.ERR_USERNAME_INVALID);
    } else if(userArray.findUsersByRoom(users, data.room).length < 2){ 
      enterRoom({...data, id: socket.id});
      socket.emit('enter room', 1);
      socket.join(data.room, () => {
        sendMessage({message: data.username + " has entered the room", username: "Server", room: data.room});
        console.log("User has joined room: " + data.room );
        updateUserList(data.room);
        /*console.log("Rooms are: "); 
        console.log( io.sockets.adapter.rooms);*/
      });
    } else{
      socket.emit('enter room', process.env.ERR_ROOM_FULL);
    }
  });
  
  socket.on('send message', sendMessage);
  
});



// listen for requests
var listener = server.listen(process.env.PORT || 3000, function () {
  console.log('Listening on port ' + listener.address().port);
});

