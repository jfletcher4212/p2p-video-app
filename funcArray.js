const error = require('./fail.js');

function addToArray(a, data){
  return [...a, data];
};

function removeFromArray(a, data){
  if(a.indexOf(data) == -1) {
    error.fail("Entry not found");
    return a;
  } else {
    const newArray = [...a];
    newArray.splice(a.indexOf(data), 1);
    return newArray;
  }
};

module.exports = {
  addToArray: addToArray,
  removeFromArray: removeFromArray
};