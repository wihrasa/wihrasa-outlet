'use strict';
/* nodejs modules */
/* npm modules */
const jwt = require('jsonwebtoken');
/* local ( libraries ) modules */
const db  = require('./db.js');
/* local ( source codes ) modules */
/* modules implements */
/* global variables */
const secret = 'Cz9htrddcz?!';
/* global function */
const newToken = (username,password)=>{
  return jwt.sign({
    username:username,
    password:password
  },secret);
}
/* start code */
const initToken={
  // start read token
  dec:(token,callback)=>{
    try{
      // decode token
      var decoded = jwt.verify(token,secret);
      var username    = decoded.username?decoded.username:'';
      var password    = decoded.password?decoded.password:'';
      var iat         = decoded.iat;
      var status;
      status          = username||'usernameEmpty';
      status          = password||'passwordEmpty';
      // find username and matching password from token
      db('wihrasa','users').find({un:username},(docs)=>{
        var doc=docs[0];
        if(doc){
          if(doc.pw==password){
            callback(true,'login success as '+username,newToken(username,password),doc);
          }else{
            if(status=='usernameEmpty'||status=='passwordEmpty'){status='';}
            else{status='password is wrong';}
            callback(false,status,newToken(),{});
          }
        }else{
          if(status=='usernameEmpty'||status=='passwordEmpty'){status='';}
          else{status='username not found';}
          callback(false,status,newToken(),{});
        }
      });
      // end try
    }catch(err){
      // if token cannot decoded, callback ( status: logout && newToken: empty )
      callback(false,'',newToken(),{});
      // end catch
    };
  },
  enc:newToken
  // end code
};

/* export codes to module */
module.exports = initToken;
