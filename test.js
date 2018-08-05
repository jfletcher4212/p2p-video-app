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

assert.equal(true, true);
//lookupId - returns an object on successful result, the first object with matching id.
mocha.it('Correctly returns the first object in an array with the given id string', () => {
  assert.equal(userArray.lookupId(testArray, "1234"), testLookupUsers[0]);
});
//returns -1 on failure
mocha.it('Correctly returns error message on a failed lookup', () => {
  assert.equal(userArray.lookupId(testLookupUsers, "blue"), process.env.ERR_ID_NOT_FOUND);
});
//works correctly with a mixed-element array
mocha.it('Correctly returns an id with an array of mixed data types', () => {
  assert.equal(userArray.lookupId(testArray, "555"), testLookupUsers[1]);
});

//addUser(_arr, username, roomname, socketid) note: objects should be checked using underscore's _.isEqual(object1, object2) function.
mocha.it('Correctly adds a user object to a given array', () => {
  assert.equal(  _.isEqual(userArray.addUser(testAddUser, "newUser", "newRoom", "5000"), [{username: "newUser", room: "newRoom", id: "5000"}]), true);
});

//A user with the same id should not be added and return an error instead
mocha.it('Correctly returns an error code if a user with an existing id is added', () => {
  assert.equal(userArray.addUser([{username: "newUser", room: "room", id: "1234"}], "otherUser", "otherRoom", "1234"), process.env.ERR_ID_TAKEN);
});

//removeUser(_arr, id) - Remember to use _.isEqual for object comparison
mocha.it('Correctly removes a user object with given id from a given array', () => {
  assert.equal(_.isEqual(userArray.removeUser(testRemoveUser, "abc123"), [{username: "alice",   id: "1234"}] ), true);
});
//return an error code if no matching entry is found.
mocha.it('Correctly reports an error if trying to remove an id that does not exist in the given array', () => {
  assert.equal(userArray.removeUser(testRemoveUser, "invalid id"), process.env.ERR_ID_NOT_FOUND);
});

//findUsersByRoom
/*mocha.it('', () => {
  assert.equal(userArray.findUsersByRoom());
});
//findUserById
mocha.it('', () => {
  assert.equal(userArray.findUserById());
});
//findRoomByUser
mocha.it('', () => {
  assert.equal(userArray.findRoomByUser());
});
//findRoomById
mocha.it('', () => {
  assert.equal(userArray.findRoomById());
});
*/