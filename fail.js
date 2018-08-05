function fail(e){
  let message = "";
  switch(e){
    case process.env.ERR_ID_NOT_FOUND:
      message = "ID not found in user list.";
      break;
    case process.env.ERR_ID_TAKEN:
      message = "ID already in use.";
      break;
    default:
      message = "Unknown error.";
      break;
  }
  console.error("Error: " + message + " Code: " + e);
  return e;
};

module.exports = {
  fail: fail
}