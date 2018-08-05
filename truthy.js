function existy(val){
  return val != null;
};

function truthy(val){
  return (val !== false) && existy(val);  
};
module.exports = {
  existy: existy,
  truthy: truthy
}