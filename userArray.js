const error = require('./fail.js');
const truthy = require('./truthy.js');

/*This set of functions expects an array of objects:
{ username, room, id }
*/
function addUser( _arr, username, roomname, socketid ){
  var retVal = _arr;
  if( retVal.filter( user => user.id == socketid ) != false ){
    return process.env.ERR_ID_TAKEN;
  } else{
    retVal.push( {username: username, room: roomname, id: socketid} );
    return retVal;
  }
}


function removeUser( _arr, id ){
  let lookup = lookupId( _arr, id );
  if( lookup == process.env.ERR_ID_NOT_FOUND ){
    return error.fail( lookup );
  } else {
    let newArray = [..._arr];
    let retval = newArray.splice( newArray.indexOf(lookup), 1 ); 
    return newArray;
  }
}

//expects an array arr of objects {user, room, id}, but works with any array of objects with an id field.
function lookupId( _arr, id ){
  for( var i in _arr ){
    if( _arr[i].id == id ){
      return _arr[i];
    }
  }
    return process.env.ERR_ID_NOT_FOUND;
}

//find users with a certain room. Expects a string for room. Returns array consisting of all users in the given room.
function findUsersByRoom( _arr, room ){
  const result = _arr.filter( arrUser => arrUser.room == room );
  return result;
}

//find user with a certain socket id. Expects string for id. Returns array consisting all users (presumably only 1) with given id
function findUserById( _arr, id ){
  const result = _arr.filter( arrUser => arrUser.id == id );
  return result;
}

//find all users other than one with a given id. Returns array consisting of all users without given id. The opposite of findUserById
function findOtherUsersById( _arr, id ){
  const result = _arr.filter( arrUser => arrUser.id != id )
  return result;
}

//find the room a user is in. Expects string for user. Returns string with the room the user is in. Note: Functions similarly to findUserById, but returns a string instead of array.
function findRoomByUser( _arr, user ){
  const result = _arr.filter( arrUser => arrUser.username == user );
  console.log(result);//insert error checking
  return result[0].room;
}

function findRoomById( _arr, id ){
  const result = _arr.filter( arrUser => arrUser.id == id );
  return result;
}

function findOtherUsersInRoom(users, id){
  let roomname = findRoomById(users, id); //array
  if(!(roomname[0])) return [];
  let roomusers = findUsersByRoom(users, roomname[0].room); //array
  let retVal = findOtherUsersById(roomusers, id); //array
  return retVal;
};

module.exports = {
  addUser: addUser,
  removeUser: removeUser,
  lookupId: lookupId,
  findUsersByRoom: findUsersByRoom,
  findUserById: findUserById,
  findOtherUsersById: findOtherUsersById,
  findRoomByUser: findRoomByUser,
  findRoomById: findRoomById,
  findOtherUsersInRoom: findOtherUsersInRoom,
};
//at some point, this should be refactored with higher order functions. For now though, brute force.