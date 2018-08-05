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
  io.to(data.room).emit('new message', data);
};


function updateUserList(room){
  console.log('users is now: ');
  console.log(users);
  //get a subarray of users, consisting of those in the appropriate room/channel
  let usersInRoom = userArray.findUsersByRoom(users, room);
  console.log("users in room " + room + " are: ");
  console.log(usersInRoom);
  io.to(room).emit('userList update', {users: usersInRoom}); //!!!consider NOT sending all id's, usernames, etc. to every user.
  //eventually, change the value passed above to a simple object consisting of only usernames that have a specific room 
  //also, change to io.to(room) instead of all sockets.minimize footprint of updating.
};

//data is expected to consist of {room, username,id}
function enterRoom(data){
  console.log("Entering channel " + data.room + ", " + data.username + "," + data.id);
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
  console.log("removing " + userid);
  //find username associated with socket?
  userArray.findRoomById(users, userid);
  let newUserList = userArray.removeUser(users, userid);
  if( newUserList == process.env.ERR_ID_NOT_FOUND ){
    //!!!Log user list at this time and the id we tried to remove, for debugging purposes.
    console.log("Erroroccurred in removeUser");
  } else {
    //okay to copy to main users array
    users = newUserList;
    updateUserList(userArray.findRoomById(users, userid));
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
    
    //find user's info in users array,
    //if it exists, remove their entry and send out update
    if(existy(userArray.findUserById( users, socket.id ))){
      removeUser(socket.id);
    }
  });
  
  
  //data expected to consist of {room, username}
  socket.on('enter room', (data) => {
    /*!!!check if room already exists. Lookup in array # of elements with room = room 
        If it does, check size of users
            If it is less than 2, add {room, user} to room, add socket to channel with id room
            If it is 2 or more, reject join request, try again.
        If it doesn't, add to array, add socket to channel with id room.
      */
    
    //users = userArray.addUser(users, {user: data.user, room: data.room, id: socket.id});
    //insert check here.
    if(true){ 
      enterRoom({...data, id: socket.id});
      socket.join(data.room, () => {
        sendMessage({message: data.username + " has entered the room", username: "Server", room: data.room});
        console.log("User has joined room: " + data.room );
        updateUserList(data.room);
        /*console.log("Rooms are: "); 
        console.log( io.sockets.adapter.rooms);*/
      });
    }
  });
  
  socket.on('send message', sendMessage);
  
});



// listen for requests
var listener = server.listen(process.env.PORT || 3000, function () {
  console.log('Listening on port ' + listener.address().port);
});

