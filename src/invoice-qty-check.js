'use strict';

const time = require('../lib/time.js');
const dbs  = require('../lib/db.js');
const db   = dbs.dbCafeandrestoRuangtengahSarinah;

const invoiceQtyCheck={
  getData:(callback)=>{
    db.find({date:time(0)},(docs)=>{
      callback(docs[0]);
      //var date         = docs[0].date;
      //var dataLimit    = docs[0].limit;
      //var dataPurchase = docs[0].purchase;
      //db.find({date:time(-1)},(docs)=>{
      //  var dataOmzet  = docs[0].omzet;
      //  callback(date,dataLimit,dataPurchase,dataOmzet);
      //});
    });
  },
  update:(data,callback)=>{
    db.update({date:time(0)},data,()=>{
      callback();
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

module.exports=invoiceQtyCheck;
