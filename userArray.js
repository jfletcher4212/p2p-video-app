const error = require('./fail.js');
const truthy = require('./truthy.js');

/*This set of functions expects an array of objects:
{ username, room, id }
*/
function addUser(_arr, username, roomname, socketid){
  var retVal = _arr;
  if(retVal.filter( user => user.id == socketid ) != false ){
    return process.env.ERR_ID_TAKEN;
  } else{
    retVal.push({username: username, room: roomname, id: socketid});
    return retVal;
  }
}


function removeUser(_arr, id){
  let lookup = lookupId(_arr, id);
  if(lookup == process.env.ERR_ID_NOT_FOUND){
    return error.fail(lookup);
  } else {
    let newArray = [..._arr];
    let retval = newArray.splice(newArray.indexOf(lookup), 1); 
    return newArray;
  }
}

//expects an array arr of objects {user, room, id}, but works with any array of objects with an id field.
function lookupId(_arr, id){
  for(var i in _arr){
    if(_arr[i].id == id){
      return _arr[i];
    }
  }
    return process.env.ERR_ID_NOT_FOUND;
}

//find users with a certain room. Expects a string for room.
function findUsersByRoom( _arr, room ){
  const result = _arr.filter(arrRoom => arrRoom.room == room);
  return result;
}

//find user with a certain socket id. Expects string for id.
function findUserById( _arr, id ){
  const result = _arr.filter(arrId => arrId.id == id);
  return result;
}

//find the room a user is in. Expects string for user
function findRoomByUser( _arr, user ){
  const result = _arr.filter(arrUser => arrUser.username == user);
  console.log(result);//insert error checking
  return result[0].room;
}

function findRoomById( _arr, id ){
  const result = _arr.filter(arrId => arrId.id == id);
  console.log("findRoomById: " + id + "\n returns: ");
  console.log(result); //insert error checking
  return result;
}

module.exports = {
  addUser: addUser,
  removeUser: removeUser,
  lookupId: lookupId,
  findUsersByRoom: findUsersByRoom,
  findUserById: findUserById,
  findRoomByUser: findRoomByUser,
  findRoomById: findRoomById
};
//at some point, this should be refactored with higher order functions. For now though, brute force.