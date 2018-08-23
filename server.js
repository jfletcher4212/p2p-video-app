// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const _ = require('underscore');

const error = require('./fail.js');
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
  io.to(data.room).emit('new message', data);
};

function updateUserList(room){
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
    console.error("Error happened in enterRoom")
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
    receive ICE candidates?
    
 */
io.sockets.on('connection', function(socket){
  connections = funcArray.addToArray(connections, socket);
  console.log('Connected: %s sockets connected', connections.length);
  
  function getOtherUser(arr, id){
    console.log(id);
    let otherUser = userArray.findOtherUsersInRoom(arr, id); 
    console.log(otherUser);
    if(_.isEqual(otherUser, [])){
      return null;
    } else {
      return otherUser[0];
    }
  };
  
  /*the following two functions are expected to send JSON objects representing the offer to start a call, 
   * as well as ICE candidates as part of negotiations for starting the call. The primary purpose for both
   * is to simply pass messages between the two users, with the only variance being in the way the message
   * is handled on the client end. It's possible to condense the two functions into one, by passing the emit
   * message as a part of the data, but that would add additional overhead to save a small amount of LoC
   *Note that the checks will negate a call being started if no other user is found in the room. We can
   * send a message back to raise an error message here, if we so choose. (!!!)
   */
  socket.on('start call', (data) => {
    let otherUser = getOtherUser(users, socket.id);
    if( !(_.isNull(otherUser)) ){
      console.log('Initiating call in room: ' + otherUser.room);
      io.to(otherUser.id).emit('call offer',data); 
    }
  });
  socket.on('ice candidate', (data) => {
    let otherUser = getOtherUser(users, socket.id);
    if( !(_.isNull(otherUser)) ){
      console.log('Sending ice candidate in room: ' + otherUser.room);
      io.to(otherUser.id).emit('new ice candidate', data); 
    }
  });
  
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
    //Sanitize the data sent by the client, just in case a malformed request manages to be sent
    data.room = sanitizer.sanitizeData(data.room);
    data.username = sanitizer.sanitizeData(data.username);
    let roomSize = userArray.findUsersByRoom(users, data.room);
    if(data.room == ''){
      socket.emit('enter room', process.env.ERR_ROOMNAME_INVALID);
    } else if(data.username == ''){
      socket.emit('enter room', process.env.ERR_USERNAME_INVALID);
    } else if (roomSize.length === 1){ //username and roomname are OK, and another user is in the room, ready to call.
      console.log("Other user found. Info is: ");
      console.log(userArray.findUsersByRoom(users, data.room));
      enterRoom({...data, id: socket.id});
      socket.join(data.room, () => {
        sendMessage({message: data.username + " has entered the room", username: "Server", room: data.room});
        updateUserList(data.room);
      });
      socket.emit('enter room', 1);
      //!!!initiate ICE candidates, stun stuff, and start sending feed
      //Send signal to the user entering the room to begin creating an offer. 
      // https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Signaling_and_video_calling for reference of below.
      //!!!Create new socket.on('SDP message received') that transfers the offer to the other user. note: need type(offer or answer), callee and caller usernames, and SDP(string describing local end of the connection)
      //!!!begin exchanging ICE candidates. need: type ("new-ice-candidate"), target (direct the message to this user only), and candidate (SDP candidate string, describing proposed connection method).
      //NOTE: Once ICE candidates have been sent and an agreement reached, the two clients will send video directly to each other, without our needing to do anything but send messages as requested.
    } else if(roomSize.length === 0){  //username and roomname are OK, and room is empty
      enterRoom({...data, id: socket.id});
      socket.join(data.room, () => {
        sendMessage({message: data.username + " has entered the room", username: "Server", room: data.room});
        updateUserList(data.room);
      });
      socket.emit('enter room', 1);
    } else{
      socket.emit('room full', process.env.ERR_ROOM_FULL);
    }
  });
  socket.on('send message', sendMessage);
  //message = {type: 'offer or 'answer', callee: string, caller: string (both usernames), SDP: string (describes local end of connection)}
  socket.on('SDP message', (message) => {});
  //message = {type: 'new-ice-candidate', target: string (username of user message is directed to), candidate: string (SDP string describing proposed connnection method)
  socket.on('ICE message', (message) => {});
});




// listen for requests
var listener = server.listen(process.env.PORT || 3000, function () {
  console.log('Listening on port ' + listener.address().port);
});

