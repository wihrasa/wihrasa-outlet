'use strict';
/* npm modules */
/* local modules */
const db     = require('../lib/db.js').users;
/* modules implements */
/* global variables */
/* global function */
/* start code */
const router=(socket,db,callback)=>{
  //
  socket.on('omzet.getData',db,(data)=>{
    //
  });
  //
};

/* export codes to module */
module.exports = router;
