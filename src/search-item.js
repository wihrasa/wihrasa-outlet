'use strict';

const time = require('../lib/time.js');
const dbs  = require('../lib/db.js');
const db   = dbs.dbItems;

const searchItem={
  getData:(callback)=>{
    db.find({},(docs)=>{
      callback(docs);
    });
  }
  //updateLimit:(data,callback)=>{
  //  db.update({date:time(2)},data,()=>{
  //    callback();
  //  });
  //},
  //updateGuest:(data,callback)=>{
  //  db.update({date:time(0)},data,()=>{
  //    callback();
  //  });
  //}
};

module.exports=searchItem;
