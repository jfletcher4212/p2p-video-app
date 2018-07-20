const error = require('./fail.js');

/*This set of functions expects an array of objects:
{ user, room, id }
*/
function addUser(_arr, username, roomname, socketid){
  return [..._arr].push({user: username, room: roomname, id: socketid});
}

function removeUser(_arr, id){
  var lookup = lookupId(_arr, id);
  if(lookup == -1){
    error.fail("ID not found");
    return _arr;
  } else {
    const newArray = [..._arr];
    return newArray.splice(lookup);
  }
}

//expects an array arr of {user, room, id}
function lookupId(_arr, id){
  for(var i in _arr){
    if(_arr[i].id == id){
      return _arr[i];
    }
    return -1;
  }
}

module.exports = {
  addUser: addUser,
  removeUser: removeUser,
  lookupId: lookupId
};