/* nodejs modules */
const http            = require('http');
/* npm modules */
const jwt = require('jsonwebtoken');
const express         = require('express');
const socketio        = require('socket.io');
/* local modules */
const db              = require('./lib/db.js');
const time            = require('./lib/time.js');
const initToken       = require('./lib/init.token.js');
/* source code modules */
// const init            = require('./src/init.js');;
// const omzet           = require('./src/omzet.js');
// const purchaseOrder   = require('./src/purchase-order.js');
const purchasePDF     = require('./src/purchase-order-pdf.js');
// const searchItem      = require('./src/search-item.js');
// const invoiceQtyCheck = require('./src/invoice-qty-check.js');
/* modules implements */
const app=express();
const server=http.Server(app);
const io=socketio(server);
/* global variable */
const formatdata={
  date:time(1),
  omzet:{
    gross:{
      total:0,
      cash:{total:0},
      cashless:{total:0,bca:0,mandiri:0,bri:0,ovo:0,tcash:0,voucher:0,entertain:0}
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
/* global function */
/* start routing */
io.on('connection',(socket)=>{
  var id = socket.id;
  //
  // init
  socket.on('init',(token)=>{
    initToken.dec(token,(logged,status,newToken,dataToken)=>{
      if(logged){
        db('wihrasa',dataToken.db).find({date:time(1)},(docs)=>{
          if(docs.length){
            delete docs[0]._id;
            io.to(id).emit('logged',{token:newToken,data:docs[0]});
          }else{
            db('wihrasa',dataToken.db).update({date:time(1)},formatdata,(res)=>{
              io.to(id).emit('logged',{token:newToken});
            });
          }
        });
      }else{io.to(id).emit('logout',{token:newToken,status:status})}
    });
  });
  //
  /* login ========================================================================== */
  socket.on('login',(data)=>{
    var newToken=initToken.enc(data.username,data.password);
    io.to(id).emit('login',{token:newToken});
  });
  //
  socket.on('logout',(data)=>{
    var newToken=initToken.enc('','');
    io.to(id).emit('logout',{token:newToken,status:''});
  });
  //
  /* omzet ========================================================================== */
  // omzet.getData
  socket.on('omzet.getData',(token)=>{
    initToken.dec(token,(logged,status,newToken,dataToken)=>{
      if(logged){
        db('wihrasa',dataToken.db).find({date:time(0)},(docs)=>{
          delete docs[0]._id;
          io.to(id).emit('omzet.getData',{token:newToken,data:docs[0],charge:{db:dataToken.db,tax:dataToken.outletTax,service:dataToken.outletService}});
        });
      }else{io.to(id).emit('logout',{token:newToken,status:status})}
    });
  });
  //
  // omzet.getData
  socket.on('omzet.updateOmzet',(token,data)=>{
    initToken.dec(token,(logged,status,newToken,dataToken)=>{
      if(logged){
        db('wihrasa',dataToken.db).update({date:time(0)},data,()=>{
          io.to(id).emit('omzet.updateOmzet',{token:newToken});
        });
      }else{io.to(id).emit('logout',{token:newToken,status:status})}
    });
  });
  //
  // omzet.getData
  socket.on('omzet.updateLimit',(token,data)=>{
    initToken.dec(token,(logged,status,newToken,dataToken)=>{
      if(logged){
        db('wihrasa',dataToken.db).find({date:time(0)},(docs)=>{
          var limitRem=docs[0].limit.rem;
          if((''+time(1))[4]+(''+time(1))[5]=='01'){data.limit.prev=0;data.limit.total=data.limit.daily;}
          else{data.limit.prev=limitRem;}
          db('wihrasa',dataToken.db).update({date:time(1)},data,()=>{
            io.to(id).emit('omzet.updateLimit',{token:newToken});
          });
        });
      }else{io.to(id).emit('logout',{token:newToken,status:status})}
    });
  });
  //
  // omzet.getData
  socket.on('omzet.updateGuest',(token,data)=>{
    initToken.dec(token,(logged,status,newToken,dataToken)=>{
      if(logged){
        db('wihrasa',dataToken.db).update({date:time(0)},data,()=>{
          io.to(id).emit('omzet.updateGuest',{token:newToken});
        });
      }else{io.to(id).emit('logout',{token:newToken,status:status})}
    });
  });
  //
  /* purchase order ====================================================================== */
  // purchaseOrder.getData
  socket.on('purchaseOrder.getData',(token)=>{
    initToken.dec(token,(logged,status,newToken,dataToken)=>{
      if(logged){
        db('wihrasa',dataToken.db).find({date:time(0)},(docs)=>{
          var date         = docs[0].date;
          var dataLimit    = docs[0].limit;
          var dataPurchase = docs[0].purchase;
          db('wihrasa',dataToken.db).find({date:time(-1)},(docs)=>{
            var dataOmzet  = docs[0].omzet;
            io.to(id).emit('purchaseOrder.getData',{token:newToken,date:date,dataLimit:dataLimit,dataPurchase:dataPurchase,dataOmzet:dataOmzet});
          });
        });
      }else{io.to(id).emit('logout',{token:newToken,status:status})}
    });
  });
  //
  // purchaseOrder.update
  socket.on('purchaseOrder.update',(token,data)=>{
    initToken.dec(token,(logged,status,newToken,dataToken)=>{
      if(logged){
        db('wihrasa',dataToken.db).update({date:time(0)},{purchase:data.purchase,limit:data.limit},()=>{
          io.to(id).emit('purchaseOrder.update',{token:newToken});
        });
      }else{io.to(id).emit('logout',{token:newToken,status:status})}
    });
  });
  //
  // searchItems.getData
  socket.on('searchItems.getData',(token)=>{
    initToken.dec(token,(logged,status,newToken,dataToken)=>{
      if(logged){
        db('wihrasa','items').find({},(docs)=>{
          io.to(id).emit('searchItems.getData',{token:newToken,data:docs});
        });
      }else{io.to(id).emit('logout',{token:newToken,status:status})}
    });
  });
  //
  // purchaseOrder - toPDF
  socket.on('purchaseOrder.toPDF',(token)=>{
    initToken.dec(token,(logged,status,newToken,dataOutlets)=>{
      if(logged){
        db('wihrasa','suppliers').find({},(dataSuppliers)=>{
          purchasePDF(dataOutlets,dataSuppliers,(data)=>{
            io.to(id).emit('purchaseOrder.toPDF',data);
          });
        });
      }else{io.to(id).emit('logout',{token:newToken,status:status})}
    });
  });
  //
  /* invoice ====================================================================== */
  //
  socket.on('invoiceQtyCheck.getData',(token)=>{
    initToken.dec(token,(logged,status,newToken,dataToken)=>{
      if(logged){
        db('wihrasa',dataToken.db).find({date:time(-1)},(docs)=>{
          delete docs[0]._id;
          io.to(id).emit('invoiceQtyCheck.getData',{token:newToken,data:docs[0]});
        });
      }else{io.to(id).emit('logout',{token:newToken,status:status})}
    });
  });
  //
  /* daily report ====================================================================== */
  //
  socket.on('dailyReport.getData.weekly',(token)=>{
    initToken.dec(token,(logged,status,newToken,dataToken)=>{
      if(logged){
        var weekday=[];
        db('wihrasa',dataToken.db).find({},(docs)=>{
          for(var i=docs.length-1;i>=docs.length-28;i--){
            var _date     = docs[i].date;
            var _omzetNet = docs[i].omzet.net.total;
            if((''+_date)[7]==(''+time(0))[7]){weekday.push({date:_date,omzetNet:_omzetNet})};
          };
          socket.emit('dailyReport.getData.weekly',weekday);
        });
      }else{io.to(id).emit('logout',{token:newToken,status:status})}
    });
  });
  //
  socket.on('dailyReport.getData',(token)=>{
    initToken.dec(token,(logged,status,newToken,dataToken)=>{
      if(logged){
        //
        db('wihrasa',dataToken.db).find({},(docs)=>{
          //
          function daily(targetDate){
            //
            var data;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                data=docs[i];
                break;
              }
            };
            //
            return data;
            //
          }
          //
          function weekly(targetDate){
            //
            var daysNum = 28;
            var targetIndex;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                targetIndex=i;
                break;
              }
            };
            //
            var startIndex = targetIndex - daysNum;
            var chart=[];
            //
            var mon=[],tue=[],wed=[],thu=[],fri=[],sat=[],sun=[];
            var chart=[];
            //
            for(var i=startIndex+1;i<=targetIndex;i++){
              //
              var date     = docs[i].date;
              var omzetNet = docs[i].omzet.net.total;
              //
              ///**/ if((''+date)[7]=='1'){mon.push({date:date,omzet:omzetNet});}
              //else if((''+date)[7]=='2'){tue.push({date:date,omzet:omzetNet});}
              //else if((''+date)[7]=='3'){wed.push({date:date,omzet:omzetNet});}
              //else if((''+date)[7]=='4'){thu.push({date:date,omzet:omzetNet});}
              //else if((''+date)[7]=='5'){fri.push({date:date,omzet:omzetNet});}
              //else if((''+date)[7]=='6'){sat.push({date:date,omzet:omzetNet});}
              //else if((''+date)[7]=='7'){sun.push({date:date,omzet:omzetNet});}
              //
              chart.push({date:date,omzet:omzetNet});
              //
            };
            //
            return chart;
            //
          };
          //
          function monthly(targetDate){
            //
            var daysNum = 31;
            var targetIndex;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                targetIndex=i;
                break;
              }
            };
            //
            var startIndex = targetIndex - daysNum;
            var chart=[];
            var startDate;
            //
            for(var i=0;i<daysNum;i++){
              //
              var date;
              var netOmzet;
              var netOmzetTot=0
              var netOmzetAvg;
              var iii=0;
              //
              for(var ii=startIndex+1;ii<=targetIndex;ii++){
                //
                if(i==0){startDate=docs[ii].date;};
                //
                netOmzetTot     = netOmzetTot     + docs[ii  ].omzet.net.total;
                //
                if(iii==i){
                  date            = docs[ii  ].date;
                  netOmzet        = docs[ii  ].omzet.net.total;
                  netOmzetAvg     = Math.round( netOmzetTot / (iii+1) );
                  break;
                };
                iii++;
                //
              };
              //
              chart.push({
                date:date,
                netOmzet:netOmzet,
                netOmzetTot:netOmzetTot,
                netOmzetAvg:netOmzetAvg
              });
              //
            };
            //
            return {
              daysNum:daysNum,
              startDate:startDate,
              targetDate:targetDate,
              netOmzetTot:chart[daysNum-1].netOmzetTot,
              netOmzetAvg:chart[daysNum-1].netOmzetAvg,
              chart:chart
            };
            //
          };
          //
          function thisMonth(targetDate){
            //
            var daysNum = Number((''+targetDate)[4]+(''+targetDate)[5]);
            var targetIndex;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                targetIndex=i;
                break;
              }
            };
            //
            var startIndex = targetIndex - daysNum;
            var chart=[];
            var startDate;
            //
            for(var i=0;i<daysNum;i++){
              //
              var netOmzet;
              var netOmzetTot=0
              var netOmzetAvg;
              var purchase;
              var purchaseTot=0;
              var purchaseAvg;
              var lastNetOmzet;
              var lastNetOmzetTot=0;
              var lastNetOmzetAvg;
              var iii=0;
              //
              for(var ii=startIndex+1;ii<=targetIndex;ii++){
                //
                if(i==0){startDate=docs[ii].date;};
                //
                netOmzetTot     = netOmzetTot     + docs[ii  ].omzet.net.total;
                purchaseTot     = purchaseTot     + docs[ii  ].purchase.total;
                lastNetOmzetTot = lastNetOmzetTot + docs[ii-1].omzet.net.total;
                //
                if(iii==i){
                  netOmzet        = docs[ii  ].omzet.net.total;
                  netOmzetAvg     = Math.round( netOmzetTot / (iii+1) );
                  purchase        = docs[ii  ].purchase.total;
                  purchaseAvg     = Math.round( purchaseTot / (iii+1) );
                  lastNetOmzet    = docs[ii-1].omzet.net.total;
                  lastNetOmzetAvg = Math.round( lastNetOmzetTot / (iii+1) );
                  break;
                };
                iii++;
                //
              };
              //
              chart.push({
                netOmzet:netOmzet,
                netOmzetTot:netOmzetTot,
                netOmzetAvg:netOmzetAvg,
                purchase:purchase,
                purchaseTot:purchaseTot,
                purchaseAvg:purchaseAvg,
                lastNetOmzet:lastNetOmzet,
                lastNetOmzetTot:lastNetOmzetTot,
                lastNetOmzetAvg:lastNetOmzetAvg
              });
              //
            };
            //
            return {
              daysNum:daysNum,
              startDate:startDate,
              targetDate:targetDate,
              netOmzetTot:chart[daysNum-1].netOmzetTot,
              netOmzetAvg:chart[daysNum-1].netOmzetAvg,
              purchaseTot:chart[daysNum-1].purchaseTot,
              purchaseAvg:chart[daysNum-1].purchaseAvg,
              lastNetOmzetTot:chart[daysNum-1].lastNetOmzetTot,
              lastNetOmzetAvg:chart[daysNum-1].lastNetOmzetAvg,
              chart:chart
            };
            //
          };
          //
          var targetDate = time(-1);
          var _daily     = daily(targetDate);
          var _weekly    = weekly(targetDate);
          var _monthly   = monthly(targetDate);
          var _thisMonth = thisMonth(targetDate);
          //
          io.to(id).emit('dailyReport.getData',{
            outletFullName:dataToken.outletFullName,
            daily:_daily,
            weekly:_weekly,
            monthly:_monthly,
            thismonth:_thisMonth
          });
          //
        });
      }else{io.to(id).emit('logout',{token:newToken,status:status})}
    });
  });
  // owner Ruang Tengah - Sarinah
  socket.on('ownerDailyReport.getData.ruangtengah-sarinah',(dbName)=>{
        //
        db('wihrasa',dbName).find({},(docs)=>{
          //
          function daily(targetDate){
            //
            var data;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                data=docs[i];
                break;
              }
            };
            //
            return data;
            //
          }
          //
          function weekly(targetDate){
            //
            var daysNum = 28;
            var targetIndex;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                targetIndex=i;
                break;
              }
            };
            //
            var startIndex = targetIndex - daysNum;
            var chart=[];
            //
            var mon=[],tue=[],wed=[],thu=[],fri=[],sat=[],sun=[];
            var chart=[];
            //
            for(var i=startIndex+1;i<=targetIndex;i++){
              //
              var date     = docs[i].date;
              var omzetNet = docs[i].omzet.net.total;
              //
              chart.push({date:date,omzet:omzetNet});
              //
            };
            //
            return chart;
            //
          };
          //
          function monthly(targetDate){
            //
            var daysNum = 31;
            var targetIndex;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                targetIndex=i;
                break;
              }
            };
            //
            var startIndex = targetIndex - daysNum;
            var chart=[];
            var startDate;
            //
            for(var i=0;i<daysNum;i++){
              //
              var date;
              var netOmzet;
              var netOmzetTot=0
              var netOmzetAvg;
              var iii=0;
              //
              for(var ii=startIndex+1;ii<=targetIndex;ii++){
                //
                if(i==0){startDate=docs[ii].date;};
                //
                netOmzetTot     = netOmzetTot     + docs[ii  ].omzet.net.total;
                //
                if(iii==i){
                  date            = docs[ii  ].date;
                  netOmzet        = docs[ii  ].omzet.net.total;
                  netOmzetAvg     = Math.round( netOmzetTot / (iii+1) );
                  break;
                };
                iii++;
                //
              };
              //
              chart.push({
                date:date,
                netOmzet:netOmzet,
                netOmzetTot:netOmzetTot,
                netOmzetAvg:netOmzetAvg
              });
              //
            };
            //
            return {
              daysNum:daysNum,
              startDate:startDate,
              targetDate:targetDate,
              netOmzetTot:chart[daysNum-1].netOmzetTot,
              netOmzetAvg:chart[daysNum-1].netOmzetAvg,
              chart:chart
            };
            //
          };
          //
          function thisMonth(targetDate){
            //
            var daysNum = Number((''+targetDate)[4]+(''+targetDate)[5]);
            var targetIndex;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                targetIndex=i;
                break;
              }
            };
            //
            var startIndex = targetIndex - daysNum;
            var chart=[];
            var startDate;
            //
            for(var i=0;i<daysNum;i++){
              //
              var netOmzet;
              var netOmzetTot=0
              var netOmzetAvg;
              var purchase;
              var purchaseTot=0;
              var purchaseAvg;
              var lastNetOmzet;
              var lastNetOmzetTot=0;
              var lastNetOmzetAvg;
              var iii=0;
              //
              for(var ii=startIndex+1;ii<=targetIndex;ii++){
                //
                if(i==0){startDate=docs[ii].date;};
                //
                netOmzetTot     = netOmzetTot     + docs[ii  ].omzet.net.total;
                purchaseTot     = purchaseTot     + docs[ii  ].purchase.total;
                lastNetOmzetTot = lastNetOmzetTot + docs[ii-1].omzet.net.total;
                //
                if(iii==i){
                  netOmzet        = docs[ii  ].omzet.net.total;
                  netOmzetAvg     = Math.round( netOmzetTot / (iii+1) );
                  purchase        = docs[ii  ].purchase.total;
                  purchaseAvg     = Math.round( purchaseTot / (iii+1) );
                  lastNetOmzet    = docs[ii-1].omzet.net.total;
                  lastNetOmzetAvg = Math.round( lastNetOmzetTot / (iii+1) );
                  break;
                };
                iii++;
                //
              };
              //
              chart.push({
                netOmzet:netOmzet,
                netOmzetTot:netOmzetTot,
                netOmzetAvg:netOmzetAvg,
                purchase:purchase,
                purchaseTot:purchaseTot,
                purchaseAvg:purchaseAvg,
                lastNetOmzet:lastNetOmzet,
                lastNetOmzetTot:lastNetOmzetTot,
                lastNetOmzetAvg:lastNetOmzetAvg
              });
              //
            };
            //
            return {
              daysNum:daysNum,
              startDate:startDate,
              targetDate:targetDate,
              netOmzetTot:chart[daysNum-1].netOmzetTot,
              netOmzetAvg:chart[daysNum-1].netOmzetAvg,
              purchaseTot:chart[daysNum-1].purchaseTot,
              purchaseAvg:chart[daysNum-1].purchaseAvg,
              lastNetOmzetTot:chart[daysNum-1].lastNetOmzetTot,
              lastNetOmzetAvg:chart[daysNum-1].lastNetOmzetAvg,
              chart:chart
            };
            //
          };
          //
          var targetDate = time(-1);
          var _daily     = daily(targetDate);
          var _weekly    = weekly(targetDate);
          var _monthly   = monthly(targetDate);
          var _thisMonth = thisMonth(targetDate);
          //
          io.to(id).emit('ownerDailyReport.getData.ruangtengah-sarinah',{
            outletFullName:'Ruang Tengah, Sarinah',
            daily:_daily,
            weekly:_weekly,
            monthly:_monthly,
            thismonth:_thisMonth
          });
          //
        });
        //
  });
  // owner Ruang Tengah - Makassar
  socket.on('ownerDailyReport.getData.ruangtengah-makassar_',(dbName)=>{
        //
        db('wihrasa',dbName).find({},(docs)=>{
          //
          function daily(targetDate){
            //
            var data;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                data=docs[i];
                break;
              }
            };
            //
            return data;
            //
          }
          //
          function weekly(targetDate){
            //
            var daysNum = 28;
            var targetIndex;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                targetIndex=i;
                break;
              }
            };
            //
            var startIndex = targetIndex - daysNum;
            var chart=[];
            //
            var mon=[],tue=[],wed=[],thu=[],fri=[],sat=[],sun=[];
            var chart=[];
            //
            for(var i=startIndex+1;i<=targetIndex;i++){
              //
              var date     = docs[i].date;
              var omzetNet = docs[i].omzet.net.total;
              //
              chart.push({date:date,omzet:omzetNet});
              //
            };
            //
            return chart;
            //
          };
          //
          function monthly(targetDate){
            //
            var daysNum = 31;
            var targetIndex;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                targetIndex=i;
                break;
              }
            };
            //
            var startIndex = targetIndex - daysNum;
            var chart=[];
            var startDate;
            //
            for(var i=0;i<daysNum;i++){
              //
              var date;
              var netOmzet;
              var netOmzetTot=0
              var netOmzetAvg;
              var iii=0;
              //
              for(var ii=startIndex+1;ii<=targetIndex;ii++){
                //
                if(i==0){startDate=docs[ii].date;};
                //
                netOmzetTot     = netOmzetTot     + docs[ii  ].omzet.net.total;
                //
                if(iii==i){
                  date            = docs[ii  ].date;
                  netOmzet        = docs[ii  ].omzet.net.total;
                  netOmzetAvg     = Math.round( netOmzetTot / (iii+1) );
                  break;
                };
                iii++;
                //
              };
              //
              chart.push({
                date:date,
                netOmzet:netOmzet,
                netOmzetTot:netOmzetTot,
                netOmzetAvg:netOmzetAvg
              });
              //
            };
            //
            return {
              daysNum:daysNum,
              startDate:startDate,
              targetDate:targetDate,
              netOmzetTot:chart[daysNum-1].netOmzetTot,
              netOmzetAvg:chart[daysNum-1].netOmzetAvg,
              chart:chart
            };
            //
          };
          //
          function thisMonth(targetDate){
            //
            var daysNum = Number((''+targetDate)[4]+(''+targetDate)[5]);
            var targetIndex;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                targetIndex=i;
                break;
              }
            };
            //
            var startIndex = targetIndex - daysNum;
            var chart=[];
            var startDate;
            //
            for(var i=0;i<daysNum;i++){
              //
              var netOmzet;
              var netOmzetTot=0
              var netOmzetAvg;
              var purchase;
              var purchaseTot=0;
              var purchaseAvg;
              var lastNetOmzet;
              var lastNetOmzetTot=0;
              var lastNetOmzetAvg;
              var iii=0;
              //
              for(var ii=startIndex+1;ii<=targetIndex;ii++){
                //
                if(i==0){startDate=docs[ii].date;};
                //
                netOmzetTot     = netOmzetTot     + docs[ii  ].omzet.net.total;
                purchaseTot     = purchaseTot     + docs[ii  ].purchase.total;
                lastNetOmzetTot = lastNetOmzetTot + docs[ii-1].omzet.net.total;
                //
                if(iii==i){
                  netOmzet        = docs[ii  ].omzet.net.total;
                  netOmzetAvg     = Math.round( netOmzetTot / (iii+1) );
                  purchase        = docs[ii  ].purchase.total;
                  purchaseAvg     = Math.round( purchaseTot / (iii+1) );
                  lastNetOmzet    = docs[ii-1].omzet.net.total;
                  lastNetOmzetAvg = Math.round( lastNetOmzetTot / (iii+1) );
                  break;
                };
                iii++;
                //
              };
              //
              chart.push({
                netOmzet:netOmzet,
                netOmzetTot:netOmzetTot,
                netOmzetAvg:netOmzetAvg,
                purchase:purchase,
                purchaseTot:purchaseTot,
                purchaseAvg:purchaseAvg,
                lastNetOmzet:lastNetOmzet,
                lastNetOmzetTot:lastNetOmzetTot,
                lastNetOmzetAvg:lastNetOmzetAvg
              });
              //
            };
            //
            return {
              daysNum:daysNum,
              startDate:startDate,
              targetDate:targetDate,
              netOmzetTot:chart[daysNum-1].netOmzetTot,
              netOmzetAvg:chart[daysNum-1].netOmzetAvg,
              purchaseTot:chart[daysNum-1].purchaseTot,
              purchaseAvg:chart[daysNum-1].purchaseAvg,
              lastNetOmzetTot:chart[daysNum-1].lastNetOmzetTot,
              lastNetOmzetAvg:chart[daysNum-1].lastNetOmzetAvg,
              chart:chart
            };
            //
          };
          //
          var targetDate = time(-1);
          var _daily     = daily(targetDate);
          var _weekly    = weekly(targetDate);
          var _monthly   = monthly(targetDate);
          var _thisMonth = thisMonth(targetDate);
          //
          io.to(id).emit('ownerDailyReport.getData.ruangtengah-makassar',{
            outletFullName:'Ruang Tengah, Makassar',
            daily:_daily,
            weekly:_weekly,
            monthly:_monthly,
            thismonth:_thisMonth
          });
          //
        });
        //
  });
  // owner Manggar - Kebon Sirih
  socket.on('ownerDailyReport.getData.manggar-kebonsirih',(dbName)=>{
        //
        db('wihrasa',dbName).find({},(docs)=>{
          //
          function daily(targetDate){
            //
            var data;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                data=docs[i];
                break;
              }
            };
            //
            return data;
            //
          }
          //
          function weekly(targetDate){
            //
            var daysNum = 28;
            var targetIndex;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                targetIndex=i;
                break;
              }
            };
            //
            var startIndex = targetIndex - daysNum;
            var chart=[];
            //
            var mon=[],tue=[],wed=[],thu=[],fri=[],sat=[],sun=[];
            var chart=[];
            //
            for(var i=startIndex+1;i<=targetIndex;i++){
              //
              var date     = docs[i].date;
              var omzetNet = docs[i].omzet.net.total;
              //
              chart.push({date:date,omzet:omzetNet});
              //
            };
            //
            return chart;
            //
          };
          //
          function monthly(targetDate){
            //
            var daysNum = 31;
            var targetIndex;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                targetIndex=i;
                break;
              }
            };
            //
            var startIndex = targetIndex - daysNum;
            var chart=[];
            var startDate;
            //
            for(var i=0;i<daysNum;i++){
              //
              var date;
              var netOmzet;
              var netOmzetTot=0
              var netOmzetAvg;
              var iii=0;
              //
              for(var ii=startIndex+1;ii<=targetIndex;ii++){
                //
                if(i==0){startDate=docs[ii].date;};
                //
                netOmzetTot     = netOmzetTot     + docs[ii  ].omzet.net.total;
                //
                if(iii==i){
                  date            = docs[ii  ].date;
                  netOmzet        = docs[ii  ].omzet.net.total;
                  netOmzetAvg     = Math.round( netOmzetTot / (iii+1) );
                  break;
                };
                iii++;
                //
              };
              //
              chart.push({
                date:date,
                netOmzet:netOmzet,
                netOmzetTot:netOmzetTot,
                netOmzetAvg:netOmzetAvg
              });
              //
            };
            //
            return {
              daysNum:daysNum,
              startDate:startDate,
              targetDate:targetDate,
              netOmzetTot:chart[daysNum-1].netOmzetTot,
              netOmzetAvg:chart[daysNum-1].netOmzetAvg,
              chart:chart
            };
            //
          };
          //
          function thisMonth(targetDate){
            //
            var daysNum = Number((''+targetDate)[4]+(''+targetDate)[5]);
            var targetIndex;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                targetIndex=i;
                break;
              }
            };
            //
            var startIndex = targetIndex - daysNum;
            var chart=[];
            var startDate;
            //
            for(var i=0;i<daysNum;i++){
              //
              var netOmzet;
              var netOmzetTot=0
              var netOmzetAvg;
              var purchase;
              var purchaseTot=0;
              var purchaseAvg;
              var lastNetOmzet;
              var lastNetOmzetTot=0;
              var lastNetOmzetAvg;
              var iii=0;
              //
              for(var ii=startIndex+1;ii<=targetIndex;ii++){
                //
                if(i==0){startDate=docs[ii].date;};
                //
                netOmzetTot     = netOmzetTot     + docs[ii  ].omzet.net.total;
                purchaseTot     = purchaseTot     + docs[ii  ].purchase.total;
                lastNetOmzetTot = lastNetOmzetTot + docs[ii-1].omzet.net.total;
                //
                if(iii==i){
                  netOmzet        = docs[ii  ].omzet.net.total;
                  netOmzetAvg     = Math.round( netOmzetTot / (iii+1) );
                  purchase        = docs[ii  ].purchase.total;
                  purchaseAvg     = Math.round( purchaseTot / (iii+1) );
                  lastNetOmzet    = docs[ii-1].omzet.net.total;
                  lastNetOmzetAvg = Math.round( lastNetOmzetTot / (iii+1) );
                  break;
                };
                iii++;
                //
              };
              //
              chart.push({
                netOmzet:netOmzet,
                netOmzetTot:netOmzetTot,
                netOmzetAvg:netOmzetAvg,
                purchase:purchase,
                purchaseTot:purchaseTot,
                purchaseAvg:purchaseAvg,
                lastNetOmzet:lastNetOmzet,
                lastNetOmzetTot:lastNetOmzetTot,
                lastNetOmzetAvg:lastNetOmzetAvg
              });
              //
            };
            //
            return {
              daysNum:daysNum,
              startDate:startDate,
              targetDate:targetDate,
              netOmzetTot:chart[daysNum-1].netOmzetTot,
              netOmzetAvg:chart[daysNum-1].netOmzetAvg,
              purchaseTot:chart[daysNum-1].purchaseTot,
              purchaseAvg:chart[daysNum-1].purchaseAvg,
              lastNetOmzetTot:chart[daysNum-1].lastNetOmzetTot,
              lastNetOmzetAvg:chart[daysNum-1].lastNetOmzetAvg,
              chart:chart
            };
            //
          };
          //
          var targetDate = time(-1);
          var _daily     = daily(targetDate);
          var _weekly    = weekly(targetDate);
          var _monthly   = monthly(targetDate);
          var _thisMonth = thisMonth(targetDate);
          //
          io.to(id).emit('ownerDailyReport.getData.manggar-kebonsirih',{
            outletFullName:'Manggar, Kebon Sirih',
            daily:_daily,
            weekly:_weekly,
            monthly:_monthly,
            thismonth:_thisMonth
          });
          //
        });
        //
  });
  // owner Manggar - Patra Jasa
  socket.on('ownerDailyReport.getData.manggar-patrajasa',(dbName)=>{
        //
        db('wihrasa',dbName).find({},(docs)=>{
          //
          function daily(targetDate){
            //
            var data;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                data=docs[i];
                break;
              }
            };
            //
            return data;
            //
          }
          //
          function weekly(targetDate){
            //
            var daysNum = 28;
            var targetIndex;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                targetIndex=i;
                break;
              }
            };
            //
            var startIndex = targetIndex - daysNum;
            var chart=[];
            //
            var mon=[],tue=[],wed=[],thu=[],fri=[],sat=[],sun=[];
            var chart=[];
            //
            for(var i=startIndex+1;i<=targetIndex;i++){
              //
              var date     = docs[i].date;
              var omzetNet = docs[i].omzet.net.total;
              //
              chart.push({date:date,omzet:omzetNet});
              //
            };
            //
            return chart;
            //
          };
          //
          function monthly(targetDate){
            //
            var daysNum = 31;
            var targetIndex;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                targetIndex=i;
                break;
              }
            };
            //
            var startIndex = targetIndex - daysNum;
            var chart=[];
            var startDate;
            //
            for(var i=0;i<daysNum;i++){
              //
              var date;
              var netOmzet;
              var netOmzetTot=0
              var netOmzetAvg;
              var iii=0;
              //
              for(var ii=startIndex+1;ii<=targetIndex;ii++){
                //
                if(i==0){startDate=docs[ii].date;};
                //
                netOmzetTot     = netOmzetTot     + docs[ii  ].omzet.net.total;
                //
                if(iii==i){
                  date            = docs[ii  ].date;
                  netOmzet        = docs[ii  ].omzet.net.total;
                  netOmzetAvg     = Math.round( netOmzetTot / (iii+1) );
                  break;
                };
                iii++;
                //
              };
              //
              chart.push({
                date:date,
                netOmzet:netOmzet,
                netOmzetTot:netOmzetTot,
                netOmzetAvg:netOmzetAvg
              });
              //
            };
            //
            return {
              daysNum:daysNum,
              startDate:startDate,
              targetDate:targetDate,
              netOmzetTot:chart[daysNum-1].netOmzetTot,
              netOmzetAvg:chart[daysNum-1].netOmzetAvg,
              chart:chart
            };
            //
          };
          //
          function thisMonth(targetDate){
            //
            var daysNum = Number((''+targetDate)[4]+(''+targetDate)[5]);
            var targetIndex;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                targetIndex=i;
                break;
              }
            };
            //
            var startIndex = targetIndex - daysNum;
            var chart=[];
            var startDate;
            //
            for(var i=0;i<daysNum;i++){
              //
              var netOmzet;
              var netOmzetTot=0
              var netOmzetAvg;
              var purchase;
              var purchaseTot=0;
              var purchaseAvg;
              var lastNetOmzet;
              var lastNetOmzetTot=0;
              var lastNetOmzetAvg;
              var iii=0;
              //
              for(var ii=startIndex+1;ii<=targetIndex;ii++){
                //
                if(i==0){startDate=docs[ii].date;};
                //
                netOmzetTot     = netOmzetTot     + docs[ii  ].omzet.net.total;
                purchaseTot     = purchaseTot     + docs[ii  ].purchase.total;
                lastNetOmzetTot = lastNetOmzetTot + docs[ii-1].omzet.net.total;
                //
                if(iii==i){
                  netOmzet        = docs[ii  ].omzet.net.total;
                  netOmzetAvg     = Math.round( netOmzetTot / (iii+1) );
                  purchase        = docs[ii  ].purchase.total;
                  purchaseAvg     = Math.round( purchaseTot / (iii+1) );
                  lastNetOmzet    = docs[ii-1].omzet.net.total;
                  lastNetOmzetAvg = Math.round( lastNetOmzetTot / (iii+1) );
                  break;
                };
                iii++;
                //
              };
              //
              chart.push({
                netOmzet:netOmzet,
                netOmzetTot:netOmzetTot,
                netOmzetAvg:netOmzetAvg,
                purchase:purchase,
                purchaseTot:purchaseTot,
                purchaseAvg:purchaseAvg,
                lastNetOmzet:lastNetOmzet,
                lastNetOmzetTot:lastNetOmzetTot,
                lastNetOmzetAvg:lastNetOmzetAvg
              });
              //
            };
            //
            return {
              daysNum:daysNum,
              startDate:startDate,
              targetDate:targetDate,
              netOmzetTot:chart[daysNum-1].netOmzetTot,
              netOmzetAvg:chart[daysNum-1].netOmzetAvg,
              purchaseTot:chart[daysNum-1].purchaseTot,
              purchaseAvg:chart[daysNum-1].purchaseAvg,
              lastNetOmzetTot:chart[daysNum-1].lastNetOmzetTot,
              lastNetOmzetAvg:chart[daysNum-1].lastNetOmzetAvg,
              chart:chart
            };
            //
          };
          //
          var targetDate = time(-1);
          var _daily     = daily(targetDate);
          var _weekly    = weekly(targetDate);
          var _monthly   = monthly(targetDate);
          var _thisMonth = thisMonth(targetDate);
          //
          io.to(id).emit('ownerDailyReport.getData.manggar-patrajasa',{
            outletFullName:'Manggar, Patra Jasa',
            daily:_daily,
            weekly:_weekly,
            monthly:_monthly,
            thismonth:_thisMonth
          });
          //
        });
        //
  });
  // owner Kantin - Kendal
  socket.on('ownerDailyReport.getData.kantin-kendal',(dbName)=>{
        //
        db('wihrasa',dbName).find({},(docs)=>{
          //
          function daily(targetDate){
            //
            var data;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                data=docs[i];
                break;
              }
            };
            //
            return data;
            //
          }
          //
          function weekly(targetDate){
            //
            var daysNum = 28;
            var targetIndex;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                targetIndex=i;
                break;
              }
            };
            //
            var startIndex = targetIndex - daysNum;
            var chart=[];
            //
            var mon=[],tue=[],wed=[],thu=[],fri=[],sat=[],sun=[];
            var chart=[];
            //
            for(var i=startIndex+1;i<=targetIndex;i++){
              //
              var date     = docs[i].date;
              var omzetNet = docs[i].omzet.net.total;
              //
              chart.push({date:date,omzet:omzetNet});
              //
            };
            //
            return chart;
            //
          };
          //
          function monthly(targetDate){
            //
            var daysNum = 31;
            var targetIndex;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                targetIndex=i;
                break;
              }
            };
            //
            var startIndex = targetIndex - daysNum;
            var chart=[];
            var startDate;
            //
            for(var i=0;i<daysNum;i++){
              //
              var date;
              var netOmzet;
              var netOmzetTot=0
              var netOmzetAvg;
              var iii=0;
              //
              for(var ii=startIndex+1;ii<=targetIndex;ii++){
                //
                if(i==0){startDate=docs[ii].date;};
                //
                netOmzetTot     = netOmzetTot     + docs[ii  ].omzet.net.total;
                //
                if(iii==i){
                  date            = docs[ii  ].date;
                  netOmzet        = docs[ii  ].omzet.net.total;
                  netOmzetAvg     = Math.round( netOmzetTot / (iii+1) );
                  break;
                };
                iii++;
                //
              };
              //
              chart.push({
                date:date,
                netOmzet:netOmzet,
                netOmzetTot:netOmzetTot,
                netOmzetAvg:netOmzetAvg
              });
              //
            };
            //
            return {
              daysNum:daysNum,
              startDate:startDate,
              targetDate:targetDate,
              netOmzetTot:chart[daysNum-1].netOmzetTot,
              netOmzetAvg:chart[daysNum-1].netOmzetAvg,
              chart:chart
            };
            //
          };
          //
          function thisMonth(targetDate){
            //
            var daysNum = Number((''+targetDate)[4]+(''+targetDate)[5]);
            var targetIndex;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                targetIndex=i;
                break;
              }
            };
            //
            var startIndex = targetIndex - daysNum;
            var chart=[];
            var startDate;
            //
            for(var i=0;i<daysNum;i++){
              //
              var netOmzet;
              var netOmzetTot=0
              var netOmzetAvg;
              var purchase;
              var purchaseTot=0;
              var purchaseAvg;
              var lastNetOmzet;
              var lastNetOmzetTot=0;
              var lastNetOmzetAvg;
              var iii=0;
              //
              for(var ii=startIndex+1;ii<=targetIndex;ii++){
                //
                if(i==0){startDate=docs[ii].date;};
                //
                netOmzetTot     = netOmzetTot     + docs[ii  ].omzet.net.total;
                purchaseTot     = purchaseTot     + docs[ii  ].purchase.total;
                lastNetOmzetTot = lastNetOmzetTot + docs[ii-1].omzet.net.total;
                //
                if(iii==i){
                  netOmzet        = docs[ii  ].omzet.net.total;
                  netOmzetAvg     = Math.round( netOmzetTot / (iii+1) );
                  purchase        = docs[ii  ].purchase.total;
                  purchaseAvg     = Math.round( purchaseTot / (iii+1) );
                  lastNetOmzet    = docs[ii-1].omzet.net.total;
                  lastNetOmzetAvg = Math.round( lastNetOmzetTot / (iii+1) );
                  break;
                };
                iii++;
                //
              };
              //
              chart.push({
                netOmzet:netOmzet,
                netOmzetTot:netOmzetTot,
                netOmzetAvg:netOmzetAvg,
                purchase:purchase,
                purchaseTot:purchaseTot,
                purchaseAvg:purchaseAvg,
                lastNetOmzet:lastNetOmzet,
                lastNetOmzetTot:lastNetOmzetTot,
                lastNetOmzetAvg:lastNetOmzetAvg
              });
              //
            };
            //
            return {
              daysNum:daysNum,
              startDate:startDate,
              targetDate:targetDate,
              netOmzetTot:chart[daysNum-1].netOmzetTot,
              netOmzetAvg:chart[daysNum-1].netOmzetAvg,
              purchaseTot:chart[daysNum-1].purchaseTot,
              purchaseAvg:chart[daysNum-1].purchaseAvg,
              lastNetOmzetTot:chart[daysNum-1].lastNetOmzetTot,
              lastNetOmzetAvg:chart[daysNum-1].lastNetOmzetAvg,
              chart:chart
            };
            //
          };
          //
          var targetDate = time(-1);
          var _daily     = daily(targetDate);
          var _weekly    = weekly(targetDate);
          var _monthly   = monthly(targetDate);
          var _thisMonth = thisMonth(targetDate);
          //
          io.to(id).emit('ownerDailyReport.getData.kantin-kendal',{
            outletFullName:'Kantin, Kendal',
            daily:_daily,
            weekly:_weekly,
            monthly:_monthly,
            thismonth:_thisMonth
          });
          //
        });
        //
  });
  // owner Kantin - Lemhanas
  socket.on('ownerDailyReport.getData.kantin-lemhanas',(dbName)=>{
        //
        db('wihrasa',dbName).find({},(docs)=>{
          //
          function daily(targetDate){
            //
            var data;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                data=docs[i];
                break;
              }
            };
            //
            return data;
            //
          }
          //
          function weekly(targetDate){
            //
            var daysNum = 28;
            var targetIndex;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                targetIndex=i;
                break;
              }
            };
            //
            var startIndex = targetIndex - daysNum;
            var chart=[];
            //
            var mon=[],tue=[],wed=[],thu=[],fri=[],sat=[],sun=[];
            var chart=[];
            //
            for(var i=startIndex+1;i<=targetIndex;i++){
              //
              var date     = docs[i].date;
              var omzetNet = docs[i].omzet.net.total;
              //
              chart.push({date:date,omzet:omzetNet});
              //
            };
            //
            return chart;
            //
          };
          //
          function monthly(targetDate){
            //
            var daysNum = 31;
            var targetIndex;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                targetIndex=i;
                break;
              }
            };
            //
            var startIndex = targetIndex - daysNum;
            var chart=[];
            var startDate;
            //
            for(var i=0;i<daysNum;i++){
              //
              var date;
              var netOmzet;
              var netOmzetTot=0
              var netOmzetAvg;
              var iii=0;
              //
              for(var ii=startIndex+1;ii<=targetIndex;ii++){
                //
                if(i==0){startDate=docs[ii].date;};
                //
                netOmzetTot     = netOmzetTot     + docs[ii  ].omzet.net.total;
                //
                if(iii==i){
                  date            = docs[ii  ].date;
                  netOmzet        = docs[ii  ].omzet.net.total;
                  netOmzetAvg     = Math.round( netOmzetTot / (iii+1) );
                  break;
                };
                iii++;
                //
              };
              //
              chart.push({
                date:date,
                netOmzet:netOmzet,
                netOmzetTot:netOmzetTot,
                netOmzetAvg:netOmzetAvg
              });
              //
            };
            //
            return {
              daysNum:daysNum,
              startDate:startDate,
              targetDate:targetDate,
              netOmzetTot:chart[daysNum-1].netOmzetTot,
              netOmzetAvg:chart[daysNum-1].netOmzetAvg,
              chart:chart
            };
            //
          };
          //
          function thisMonth(targetDate){
            //
            var daysNum = Number((''+targetDate)[4]+(''+targetDate)[5]);
            var targetIndex;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                targetIndex=i;
                break;
              }
            };
            //
            var startIndex = targetIndex - daysNum;
            var chart=[];
            var startDate;
            //
            for(var i=0;i<daysNum;i++){
              //
              var netOmzet;
              var netOmzetTot=0
              var netOmzetAvg;
              var purchase;
              var purchaseTot=0;
              var purchaseAvg;
              var lastNetOmzet;
              var lastNetOmzetTot=0;
              var lastNetOmzetAvg;
              var iii=0;
              //
              for(var ii=startIndex+1;ii<=targetIndex;ii++){
                //
                if(i==0){startDate=docs[ii].date;};
                //
                netOmzetTot     = netOmzetTot     + docs[ii  ].omzet.net.total;
                purchaseTot     = purchaseTot     + docs[ii  ].purchase.total;
                lastNetOmzetTot = lastNetOmzetTot + docs[ii-1].omzet.net.total;
                //
                if(iii==i){
                  netOmzet        = docs[ii  ].omzet.net.total;
                  netOmzetAvg     = Math.round( netOmzetTot / (iii+1) );
                  purchase        = docs[ii  ].purchase.total;
                  purchaseAvg     = Math.round( purchaseTot / (iii+1) );
                  lastNetOmzet    = docs[ii-1].omzet.net.total;
                  lastNetOmzetAvg = Math.round( lastNetOmzetTot / (iii+1) );
                  break;
                };
                iii++;
                //
              };
              //
              chart.push({
                netOmzet:netOmzet,
                netOmzetTot:netOmzetTot,
                netOmzetAvg:netOmzetAvg,
                purchase:purchase,
                purchaseTot:purchaseTot,
                purchaseAvg:purchaseAvg,
                lastNetOmzet:lastNetOmzet,
                lastNetOmzetTot:lastNetOmzetTot,
                lastNetOmzetAvg:lastNetOmzetAvg
              });
              //
            };
            //
            return {
              daysNum:daysNum,
              startDate:startDate,
              targetDate:targetDate,
              netOmzetTot:chart[daysNum-1].netOmzetTot,
              netOmzetAvg:chart[daysNum-1].netOmzetAvg,
              purchaseTot:chart[daysNum-1].purchaseTot,
              purchaseAvg:chart[daysNum-1].purchaseAvg,
              lastNetOmzetTot:chart[daysNum-1].lastNetOmzetTot,
              lastNetOmzetAvg:chart[daysNum-1].lastNetOmzetAvg,
              chart:chart
            };
            //
          };
          //
          var targetDate = time(-1);
          var _daily     = daily(targetDate);
          var _weekly    = weekly(targetDate);
          var _monthly   = monthly(targetDate);
          var _thisMonth = thisMonth(targetDate);
          //
          io.to(id).emit('ownerDailyReport.getData.kantin-lemhanas',{
            outletFullName:'Kantin, Lemhanas',
            daily:_daily,
            weekly:_weekly,
            monthly:_monthly,
            thismonth:_thisMonth
          });
          //
        });
        //
  });
  // owner Kantin - Westin
  socket.on('ownerDailyReport.getData.kantin-westin',(dbName)=>{
        //
        db('wihrasa',dbName).find({},(docs)=>{
          //
          function daily(targetDate){
            //
            var data;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                data=docs[i];
                break;
              }
            };
            //
            return data;
            //
          }
          //
          function weekly(targetDate){
            //
            var daysNum = 28;
            var targetIndex;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                targetIndex=i;
                break;
              }
            };
            //
            var startIndex = targetIndex - daysNum;
            var chart=[];
            //
            var mon=[],tue=[],wed=[],thu=[],fri=[],sat=[],sun=[];
            var chart=[];
            //
            for(var i=startIndex+1;i<=targetIndex;i++){
              //
              var date     = docs[i].date;
              var omzetNet = docs[i].omzet.net.total;
              //
              chart.push({date:date,omzet:omzetNet});
              //
            };
            //
            return chart;
            //
          };
          //
          function monthly(targetDate){
            //
            var daysNum = 31;
            var targetIndex;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                targetIndex=i;
                break;
              }
            };
            //
            var startIndex = targetIndex - daysNum;
            var chart=[];
            var startDate;
            //
            for(var i=0;i<daysNum;i++){
              //
              var date;
              var netOmzet;
              var netOmzetTot=0
              var netOmzetAvg;
              var iii=0;
              //
              for(var ii=startIndex+1;ii<=targetIndex;ii++){
                //
                if(i==0){startDate=docs[ii].date;};
                //
                netOmzetTot     = netOmzetTot     + docs[ii  ].omzet.net.total;
                //
                if(iii==i){
                  date            = docs[ii  ].date;
                  netOmzet        = docs[ii  ].omzet.net.total;
                  netOmzetAvg     = Math.round( netOmzetTot / (iii+1) );
                  break;
                };
                iii++;
                //
              };
              //
              chart.push({
                date:date,
                netOmzet:netOmzet,
                netOmzetTot:netOmzetTot,
                netOmzetAvg:netOmzetAvg
              });
              //
            };
            //
            return {
              daysNum:daysNum,
              startDate:startDate,
              targetDate:targetDate,
              netOmzetTot:chart[daysNum-1].netOmzetTot,
              netOmzetAvg:chart[daysNum-1].netOmzetAvg,
              chart:chart
            };
            //
          };
          //
          function thisMonth(targetDate){
            //
            var daysNum = Number((''+targetDate)[4]+(''+targetDate)[5]);
            var targetIndex;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                targetIndex=i;
                break;
              }
            };
            //
            var startIndex = targetIndex - daysNum;
            var chart=[];
            var startDate;
            //
            for(var i=0;i<daysNum;i++){
              //
              var netOmzet;
              var netOmzetTot=0
              var netOmzetAvg;
              var purchase;
              var purchaseTot=0;
              var purchaseAvg;
              var lastNetOmzet;
              var lastNetOmzetTot=0;
              var lastNetOmzetAvg;
              var iii=0;
              //
              for(var ii=startIndex+1;ii<=targetIndex;ii++){
                //
                if(i==0){startDate=docs[ii].date;};
                //
                netOmzetTot     = netOmzetTot     + docs[ii  ].omzet.net.total;
                purchaseTot     = purchaseTot     + docs[ii  ].purchase.total;
                lastNetOmzetTot = lastNetOmzetTot + docs[ii-1].omzet.net.total;
                //
                if(iii==i){
                  netOmzet        = docs[ii  ].omzet.net.total;
                  netOmzetAvg     = Math.round( netOmzetTot / (iii+1) );
                  purchase        = docs[ii  ].purchase.total;
                  purchaseAvg     = Math.round( purchaseTot / (iii+1) );
                  lastNetOmzet    = docs[ii-1].omzet.net.total;
                  lastNetOmzetAvg = Math.round( lastNetOmzetTot / (iii+1) );
                  break;
                };
                iii++;
                //
              };
              //
              chart.push({
                netOmzet:netOmzet,
                netOmzetTot:netOmzetTot,
                netOmzetAvg:netOmzetAvg,
                purchase:purchase,
                purchaseTot:purchaseTot,
                purchaseAvg:purchaseAvg,
                lastNetOmzet:lastNetOmzet,
                lastNetOmzetTot:lastNetOmzetTot,
                lastNetOmzetAvg:lastNetOmzetAvg
              });
              //
            };
            //
            return {
              daysNum:daysNum,
              startDate:startDate,
              targetDate:targetDate,
              netOmzetTot:chart[daysNum-1].netOmzetTot,
              netOmzetAvg:chart[daysNum-1].netOmzetAvg,
              purchaseTot:chart[daysNum-1].purchaseTot,
              purchaseAvg:chart[daysNum-1].purchaseAvg,
              lastNetOmzetTot:chart[daysNum-1].lastNetOmzetTot,
              lastNetOmzetAvg:chart[daysNum-1].lastNetOmzetAvg,
              chart:chart
            };
            //
          };
          //
          var targetDate = time(-1);
          var _daily     = daily(targetDate);
          var _weekly    = weekly(targetDate);
          var _monthly   = monthly(targetDate);
          var _thisMonth = thisMonth(targetDate);
          //
          io.to(id).emit('ownerDailyReport.getData.kantin-westin',{
            outletFullName:'Kantin, Westin',
            daily:_daily,
            weekly:_weekly,
            monthly:_monthly,
            thismonth:_thisMonth
          });
          //
        });
        //
  });
  // owner Arena - Kemenpora
  socket.on('ownerDailyReport.getData.arena-kemenpora',(dbName)=>{
        //
        db('wihrasa',dbName).find({},(docs)=>{
          //
          function daily(targetDate){
            //
            var data;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                data=docs[i];
                break;
              }
            };
            //
            return data;
            //
          }
          //
          function weekly(targetDate){
            //
            var daysNum = 28;
            var targetIndex;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                targetIndex=i;
                break;
              }
            };
            //
            var startIndex = targetIndex - daysNum;
            var chart=[];
            //
            var mon=[],tue=[],wed=[],thu=[],fri=[],sat=[],sun=[];
            var chart=[];
            //
            for(var i=startIndex+1;i<=targetIndex;i++){
              //
              var date     = docs[i].date;
              var omzetNet = docs[i].omzet.net.total;
              //
              chart.push({date:date,omzet:omzetNet});
              //
            };
            //
            return chart;
            //
          };
          //
          function monthly(targetDate){
            //
            var daysNum = 31;
            var targetIndex;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                targetIndex=i;
                break;
              }
            };
            //
            var startIndex = targetIndex - daysNum;
            var chart=[];
            var startDate;
            //
            for(var i=0;i<daysNum;i++){
              //
              var date;
              var netOmzet;
              var netOmzetTot=0
              var netOmzetAvg;
              var iii=0;
              //
              for(var ii=startIndex+1;ii<=targetIndex;ii++){
                //
                if(i==0){startDate=docs[ii].date;};
                //
                netOmzetTot     = netOmzetTot     + docs[ii  ].omzet.net.total;
                //
                if(iii==i){
                  date            = docs[ii  ].date;
                  netOmzet        = docs[ii  ].omzet.net.total;
                  netOmzetAvg     = Math.round( netOmzetTot / (iii+1) );
                  break;
                };
                iii++;
                //
              };
              //
              chart.push({
                date:date,
                netOmzet:netOmzet,
                netOmzetTot:netOmzetTot,
                netOmzetAvg:netOmzetAvg
              });
              //
            };
            //
            return {
              daysNum:daysNum,
              startDate:startDate,
              targetDate:targetDate,
              netOmzetTot:chart[daysNum-1].netOmzetTot,
              netOmzetAvg:chart[daysNum-1].netOmzetAvg,
              chart:chart
            };
            //
          };
          //
          function thisMonth(targetDate){
            //
            var daysNum = Number((''+targetDate)[4]+(''+targetDate)[5]);
            var targetIndex;
            //
            for(var i=docs.length-1;i>=0;i--){
              if(docs[i].date==targetDate){
                targetIndex=i;
                break;
              }
            };
            //
            var startIndex = targetIndex - daysNum;
            var chart=[];
            var startDate;
            //
            for(var i=0;i<daysNum;i++){
              //
              var netOmzet;
              var netOmzetTot=0
              var netOmzetAvg;
              var purchase;
              var purchaseTot=0;
              var purchaseAvg;
              var lastNetOmzet;
              var lastNetOmzetTot=0;
              var lastNetOmzetAvg;
              var iii=0;
              //
              for(var ii=startIndex+1;ii<=targetIndex;ii++){
                //
                if(i==0){startDate=docs[ii].date;};
                //
                netOmzetTot     = netOmzetTot     + docs[ii  ].omzet.net.total;
                purchaseTot     = purchaseTot     + docs[ii  ].purchase.total;
                lastNetOmzetTot = lastNetOmzetTot + docs[ii-1].omzet.net.total;
                //
                if(iii==i){
                  netOmzet        = docs[ii  ].omzet.net.total;
                  netOmzetAvg     = Math.round( netOmzetTot / (iii+1) );
                  purchase        = docs[ii  ].purchase.total;
                  purchaseAvg     = Math.round( purchaseTot / (iii+1) );
                  lastNetOmzet    = docs[ii-1].omzet.net.total;
                  lastNetOmzetAvg = Math.round( lastNetOmzetTot / (iii+1) );
                  break;
                };
                iii++;
                //
              };
              //
              chart.push({
                netOmzet:netOmzet,
                netOmzetTot:netOmzetTot,
                netOmzetAvg:netOmzetAvg,
                purchase:purchase,
                purchaseTot:purchaseTot,
                purchaseAvg:purchaseAvg,
                lastNetOmzet:lastNetOmzet,
                lastNetOmzetTot:lastNetOmzetTot,
                lastNetOmzetAvg:lastNetOmzetAvg
              });
              //
            };
            //
            return {
              daysNum:daysNum,
              startDate:startDate,
              targetDate:targetDate,
              netOmzetTot:chart[daysNum-1].netOmzetTot,
              netOmzetAvg:chart[daysNum-1].netOmzetAvg,
              purchaseTot:chart[daysNum-1].purchaseTot,
              purchaseAvg:chart[daysNum-1].purchaseAvg,
              lastNetOmzetTot:chart[daysNum-1].lastNetOmzetTot,
              lastNetOmzetAvg:chart[daysNum-1].lastNetOmzetAvg,
              chart:chart
            };
            //
          };
          //
          var targetDate = time(-1);
          var _daily     = daily(targetDate);
          var _weekly    = weekly(targetDate);
          var _monthly   = monthly(targetDate);
          var _thisMonth = thisMonth(targetDate);
          //
          io.to(id).emit('ownerDailyReport.getData.arena-kemenpora',{
            outletFullName:'Arena, Kemenpora',
            daily:_daily,
            weekly:_weekly,
            monthly:_monthly,
            thismonth:_thisMonth
          });
          //
        });
        //
  });
  //
  socket.on('ownerDailyReport.getData',(outlet)=>{
    //
    db('wihrasa',outlet).find({},(docs)=>{
      //
      function daily(targetDate){
        //
        var data;
        //
        for(var i=docs.length-1;i>=0;i--){
          if(docs[i].date==targetDate){
            data=docs[i];
            break;
          }
        };
        //
        return data;
        //
      }
      //
      function weekly(targetDate){
        //
        var daysNum = 28;
        var targetIndex;
        //
        for(var i=docs.length-1;i>=0;i--){
          if(docs[i].date==targetDate){
            targetIndex=i;
            break;
          }
        };
        //
        var startIndex = targetIndex - daysNum;
        var chart=[];
        //
        var mon=[],tue=[],wed=[],thu=[],fri=[],sat=[],sun=[];
        var chart=[];
        //
        for(var i=startIndex+1;i<=targetIndex;i++){
          //
          var date     = docs[i].date;
          var omzetNet = docs[i].omzet.net.total;
          //
          chart.push({date:date,omzet:omzetNet});
          //
        };
        //
        return chart;
        //
      };
      //
      function monthly(targetDate){
        //
        var daysNum = 31;
        var targetIndex;
        //
        for(var i=docs.length-1;i>=0;i--){
          if(docs[i].date==targetDate){
            targetIndex=i;
            break;
          }
        };
        //
        var startIndex = targetIndex - daysNum;
        var chart=[];
        var startDate;
        //
        for(var i=0;i<daysNum;i++){
          //
          var date;
          var netOmzet;
          var netOmzetTot=0
          var netOmzetAvg;
          var iii=0;
          //
          for(var ii=startIndex+1;ii<=targetIndex;ii++){
            //
            if(i==0){startDate=docs[ii].date;};
            //
            netOmzetTot     = netOmzetTot     + docs[ii  ].omzet.net.total;
            //
            if(iii==i){
              date            = docs[ii  ].date;
              netOmzet        = docs[ii  ].omzet.net.total;
              netOmzetAvg     = Math.round( netOmzetTot / (iii+1) );
              break;
            };
            iii++;
            //
          };
          //
          chart.push({
            date:date,
            netOmzet:netOmzet,
            netOmzetTot:netOmzetTot,
            netOmzetAvg:netOmzetAvg
          });
          //
        };
        //
        return {
          daysNum:daysNum,
          startDate:startDate,
          targetDate:targetDate,
          netOmzetTot:chart[daysNum-1].netOmzetTot,
          netOmzetAvg:chart[daysNum-1].netOmzetAvg,
          chart:chart
        };
        //
      };
      //
      function thisMonth(targetDate){
        //
        var daysNum = Number((''+targetDate)[4]+(''+targetDate)[5]);
        var targetIndex;
        //
        for(var i=docs.length-1;i>=0;i--){
          if(docs[i].date==targetDate){
            targetIndex=i;
            break;
          }
        };
        //
        var startIndex = targetIndex - daysNum;
        var chart=[];
        var startDate;
        //
        for(var i=0;i<daysNum;i++){
          //
          var netOmzet;
          var netOmzetTot=0
          var netOmzetAvg;
          var purchase;
          var purchaseTot=0;
          var purchaseAvg;
          var lastNetOmzet;
          var lastNetOmzetTot=0;
          var lastNetOmzetAvg;
          var iii=0;
          //
          for(var ii=startIndex+1;ii<=targetIndex;ii++){
            //
            if(i==0){startDate=docs[ii].date;};
            //
            netOmzetTot     = netOmzetTot     + docs[ii  ].omzet.net.total;
            purchaseTot     = purchaseTot     + docs[ii  ].purchase.total;
            lastNetOmzetTot = lastNetOmzetTot + docs[ii-1].omzet.net.total;
            //
            if(iii==i){
              netOmzet        = docs[ii  ].omzet.net.total;
              netOmzetAvg     = Math.round( netOmzetTot / (iii+1) );
              purchase        = docs[ii  ].purchase.total;
              purchaseAvg     = Math.round( purchaseTot / (iii+1) );
              lastNetOmzet    = docs[ii-1].omzet.net.total;
              lastNetOmzetAvg = Math.round( lastNetOmzetTot / (iii+1) );
              break;
            };
            iii++;
            //
          };
          //
          chart.push({
            netOmzet:netOmzet,
            netOmzetTot:netOmzetTot,
            netOmzetAvg:netOmzetAvg,
            purchase:purchase,
            purchaseTot:purchaseTot,
            purchaseAvg:purchaseAvg,
            lastNetOmzet:lastNetOmzet,
            lastNetOmzetTot:lastNetOmzetTot,
            lastNetOmzetAvg:lastNetOmzetAvg
          });
          //
        };
        //
        return {
          daysNum:daysNum,
          startDate:startDate,
          targetDate:targetDate,
          netOmzetTot:chart[daysNum-1].netOmzetTot,
          netOmzetAvg:chart[daysNum-1].netOmzetAvg,
          purchaseTot:chart[daysNum-1].purchaseTot,
          purchaseAvg:chart[daysNum-1].purchaseAvg,
          lastNetOmzetTot:chart[daysNum-1].lastNetOmzetTot,
          lastNetOmzetAvg:chart[daysNum-1].lastNetOmzetAvg,
          chart:chart
        };
        //
      };
      //
      var targetDate = time(-1);
      var _daily     = daily(targetDate);
      var _weekly    = weekly(targetDate);
      var _monthly   = monthly(targetDate);
      var _thisMonth = thisMonth(targetDate);
      //
      io.to(id).emit('ownerDailyReport.getData',{
        daily:_daily,
        weekly:_weekly,
        monthly:_monthly,
        thismonth:_thisMonth
      });
      //
    });
  });
  //
  //socket.on('owner.getData',()=>{
  //  io.to(id).emit('bajingan','asuuuu');
  //});
  //
});

// start execute
const port=3000;
server.listen(port,(e)=>{
  console.log('running on '+port);
});
