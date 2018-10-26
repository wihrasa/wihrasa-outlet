'use strict';

const time = require('../lib/time.js');
const dbs  = require('../lib/db.js');
const db   = dbs.dbCafeandrestoRuangtengahSarinah;

const date = time(2);
const formatdata={
  date:date,
  omzet:{
    gross:{
      total:0,
      cash:{total:0},
      cashless:{total:0,bca:0,mandiri:0,bri:0,ovo:0,tcash:0}
    },
    charge:{total:0,tax:0,service:0},
    net:{total:0,}
  },
  limit:{
    total:0,
    daily:0,
    prev:0,
    rem:0
  },
  purchase:{
    total:0,
    order:{total:0,suppliers:[]},
    invoice:{total:0,suppliers:[]},
    extra:{total:0,sellers:[]}
  },
  guest:{total:0,avg:0}
};

const init=(callback)=>{
  db.find({date:date},(docs)=>{
    if(docs.length){
      delete docs[0]._id;
      callback(docs[0]);
    }else{
      db.update({date:date},formatdata,(res)=>{
        callback(res);
      });
    }
  });
};

module.exports = init;
