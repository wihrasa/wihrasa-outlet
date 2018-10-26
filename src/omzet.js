'use strict';

const time      = require('../lib/time.js');
const db        = require('../lib/db.js');
const initToken = require('../lib/init.token.js');

const date = time(0);

const omzetFindData=(token,callback)=>{
  initToken(token,(logged,status,data)=>{
    if(logged){
      data
    }else{callback('logout',status)}
  });



  getData:(data,callback)=>{
    db(data.colName).find({date:time(0)},(docs)=>{
      delete docs[0]._id;
      callback(docs[0]);
    });
  },
  updateOmzet:(data,callback)=>{
    db(data.colName).update({date:time(0)},data,()=>{
      callback();
    });
  },
  updateLimit:(data,callback)=>{
    db(data.colName).update({date:time(2)},data,()=>{
      callback();
    });
  },
  updateGuest:(data,callback)=>{
    db(data.colName).update({date:time(0)},data,()=>{
      callback();
    });
  }
};

module.exports=omzet;
