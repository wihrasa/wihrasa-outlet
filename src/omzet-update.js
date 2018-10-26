/**/
'use strict';
const omzetUpdate=(req,res,ajaxJSON,time,db)=>{
  res.header("Access-Control-Allow-Origin", "*");
  var data=ajaxJSON(req.body);

  db.update({date:time(0)},data,()=>{

    res.send({status:'success'});

  });

};

module.exports=omzetUpdate;
