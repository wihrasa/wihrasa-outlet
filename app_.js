// NodeJS Modules Requirements
const http=require('http');
const bodyParser=require('body-parser');
// NPM Modules Requirements
const express=require('express');
// Libraries
const mongo    = require('./lib/mongo.js')
const ajaxJSON = require('./lib/ajax-json.js');;
const time     = require('./lib/time.js');
// Source Codes
//
const init                = require('./src/init.js');
const omzet               = require('./src/omzet.js');
const omzetUpdate         = require('./src/omzet-update.js');
const purchaseOrder_draft = require('./src/purchase-order-draft.js');
const searchItem          = require('./src/search-item.js');
//
// Modules Implements
const app=express();
const server=http.Server(app);
const db=mongo('mongodb://localhost:27017','wihrasa3','cafeandresto_ruangtengah_sarinah');
const db2=mongo('mongodb://localhost:27017','wihrasa3','items');
// Middlewaress
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
//
app.post('/init',(req,res)=>{
  init(req,res,ajaxJSON,time,db);
});
app.post('/omzet',(req,res)=>{
  omzet(req,res,ajaxJSON,time,db);
});
app.post('/omzet/update',(req,res)=>{
  omzetUpdate(req,res,ajaxJSON,time,db);
});
app.post('/purchase-order/draft',(req,res)=>{
  purchaseOrder_draft(req,res,ajaxJSON,time,db);
});
app.post('/search-item',(req,res)=>{
  searchItem(req,res,ajaxJSON,time,db2);
});
//
//app.post('/tes',(req,res)=>{
//  res.header("Access-Control-Allow-Origin", "*");
//  data=ajaxJSON(req.body);
//  //
//  db.find({date:data.date},(data)=>{
//    console.log(data);
//    res.send(data);
//  });
//  //
//})

const port=3000;
server.listen(port,(e)=>{
  console.log('running on '+port);
});