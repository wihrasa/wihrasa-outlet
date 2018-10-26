const ajaxJSON=(string)=>{
  console.log(string);
  var res = JSON.parse(Object.keys(string)[0]);
  console.log(res);
  return res;
}

module.exports=ajaxJSON;
