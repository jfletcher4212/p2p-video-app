const assert = require('assert');
const userArray = require('./userArray.js');
const mocha = require('mocha');
const _ = require('underscore');
/*
 * USERARRAY UNIT TESTS
 * addUser,
 * removeUser,
 * lookupId,
 * findUsersByRoom,
 * findUserById,
 * findRoomByUser,
 * findRoomById
 */

const testLookupUsers = [
  {username: "alice",   id: "1234"}, 
  {username: "bob",     id: "555",    room: "xyz"},
  {username: "charlie", id: "abc123", status: "active"}
];
const testArray = [ 
  "Test",
  23,
  ...testLookupUsers
];

const testAddUser = [];

const testRemoveUser = [
  {username: "alice",   id: "1234"}, 
  {username: "charlie", id: "abc123", status: "active"}
];

const testFind = [
  {username: "alice",   id: "1234",   room: "newRoom"},
  {username: "bob",     id: "555",    room: "newRoom"},
  {username: "charlie", id: "abc123", room: "xyz"},
  {username: "eve",     id: "evil",   room: "red"}
];

//lookupId - returns an object on successful result, the first object with matching id.
mocha.it('lookupId returns the first object in an array with the given id string', () => {
  assert.equal(userArray.lookupId(testLookupUsers, "1234"), testLookupUsers[0]);
});
//returns -1 on failure
mocha.it('lookupId returns error message on a failed lookup', () => {
  assert.equal(userArray.lookupId(testLookupUsers, "blue"), process.env.ERR_ID_NOT_FOUND);
});
//works correctly with a mixed-element array
mocha.it('lookupId returns an id with an array of mixed data types', () => {
  assert.equal(userArray.lookupId(testArray, "555"), testLookupUsers[1]);
});

//addUser(_arr, username, roomname, socketid) note: objects should be checked using underscore's _.isEqual(object1, object2) function.
mocha.it('addUser adds a user object to a given array', () => {
  assert.equal(  _.isEqual(userArray.addUser(testAddUser, "newUser", "newRoom", "5000"), [{username: "newUser", room: "newRoom", id: "5000"}]), true);
});

//A user with the same id should not be added and return an error instead
mocha.it('addUser returns an error code if a user with an existing id is added', () => {
  assert.equal(userArray.addUser([{username: "newUser", room: "room", id: "1234"}], "otherUser", "otherRoom", "1234"), process.env.ERR_ID_TAKEN);
});

//removeUser(_arr, id) - Remember to use _.isEqual for object comparison
mocha.it('removeUser removes a user object with given id from a given array', () => {
  assert.equal(_.isEqual(userArray.removeUser(testRemoveUser, "abc123"), [{username: "alice",   id: "1234"}] ), true);
});
//return an error code if no matching entry is found.
mocha.it('removeUser reports an error if trying to remove an id that does not exist in the given array', () => {
  assert.equal(userArray.removeUser(testRemoveUser, "invalid id"), process.env.ERR_ID_NOT_FOUND);
});

//findUsersByRoom(_arr, room)
mocha.it('findUsersByRoom returns a list of users with matching room', () => {
  assert.equal(_.isEqual(userArray.findUsersByRoom(testFind, "newRoom"), [
    {username: "alice",   id: "1234", room: "newRoom"},
    {username: "bob", id: "555", room: "newRoom"}
  ] ), true);
});
mocha.it('findUsersByRoom reports an empty array if no matches are found', () => {
  assert.equal(_.isEqual(userArray.findUsersByRoom(testFind, "garbageEntry"), []), true);
});
mocha.it('findUsersByRoom reports an empty array if an invalid data type is given for the room name', () => {
  assert.equal(_.isEqual(userArray.findUsersByRoom(testFind, {datatype: "string"}), []), true);
});

//findUserById( _arr, id )
mocha.it('findUserById finds and returns the user with the given id', () => {
  assert.equal(_.isEqual(userArray.findUserById(testFind, "555"), [testFind[1]]), true);
});
mocha.it('findUserById reports an empty array if the id does not exist', () => {
  assert.equal(_.isEqual(userArray.findUserById(testFind, "nonexistant id"), []), true);
});

//findRoomById( _arr, id )
/*mocha.it('findRoomById finds and returns the rooms a given id is in', () => {
  assert.equal(_.isEqual(userArray.findRoomById()), true);
}); unncecessary, acts identical to  findUserById*/
//findRoomByUser( _arr, user )
/*mocha.it('', () => {
  assert.equal(userArray.findRoomByUser());
}); not used as of yet, will test if becomes necessary.
*/
