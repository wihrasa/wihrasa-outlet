'use strict';
/* npm modules */
/* local modules */
const mongo = require('../lib/mongo.js');
/* modules implements */
/* global variables */
/* global function */

/* start codes */
const db=(dbName,colName)=>{
  //
  return mongo('mongodb://localhost:27017',dbName,colName);
  //
};

/* export codes to module */
module.exports = db;
