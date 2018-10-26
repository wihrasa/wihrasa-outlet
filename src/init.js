'use strict';

const initToken = require('../lib/init.token.js');
const db        = require('../lib/db.js');

const init=(token,callback)=>{
  initToken(token,(data)=>{
    if(data.data){
      db(data.data.db.colName);
    }else{
      callback(data.status);
    }
  });
};

module.exports = init;
