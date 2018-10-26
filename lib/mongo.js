//
const assert=require('assert');
//
const mongodb=require('mongodb');
const MongoClient=mongodb.MongoClient;
//
const db=(dbUrl,dbName,dbCol)=>{
  return{

    find:(param,callback)=>{
      MongoClient.connect(dbUrl,{useNewUrlParser:true},(err,client)=>{
        assert.equal(null,err);
        client.db(dbName).collection(dbCol).find(param).toArray((err,docs)=>{
          assert.equal(err,null);
          callback(docs);
          client.close();
        });
      });
    },

    findSort:(param,callback)=>{
      MongoClient.connect(dbUrl,{useNewUrlParser:true},(err,client)=>{
        assert.equal(null,err);
        console.log(param);
        client.db(dbName).collection(dbCol).find().sort(param,(err,docs)=>{
          assert.equal(err,null);
          console.log(docs);
          callback(docs);
          client.close();
        });
      });
    },

    insert:(data,callback)=>{
      MongoClient.connect(dbUrl,{useNewUrlParser:true},(err,client)=>{
        assert.equal(null,err);
        client.db(dbName).collection(dbCol).insertOne(data,(err,docs)=>{
          assert.equal(err,null);
          callback();
          client.close();
        });
      });
    },

    update:(param,data,callback)=>{
      MongoClient.connect(dbUrl,{useNewUrlParser:true},(err,client)=>{
        assert.equal(null,err);
        client.db(dbName).collection(dbCol).updateOne(param,{$set:data},{upsert:true},(err,docs)=>{
          assert.equal(err,null);
          callback();
          client.close();
        });
      });
    }

  }
}

module.exports = db;

//const dbUrl='mongodb://localhost:27017';
//const dbName='gmtrestosystem';
//const dbCol='cafe_ruangtengah_sarinah';

////
//exports.insert=(data,callback)=>{
//  MongoClient.connect(dbUrl,{useNewUrlParser:true},(err,client)=>{
//    assert.equal(null,err);
//    client.db(dbName).collection(dbCol).insert(data,(err,docs)=>{
//      assert.equal(err,null);
//      callback();
//      client.close();
//    });
//  });
//};
////
//exports.update=(param,data,callback)=>{
//  MongoClient.connect(dbUrl,{useNewUrlParser:true},(err,client)=>{
//    assert.equal(null,err);
//    client.db(dbName).collection(dbCol).update(param,data,(err,docs)=>{
//      assert.equal(err,null);
//      callback();
//      client.close();
//    });
//  });
//};
////
//exports.find=(param,callback)=>{
//  MongoClient.connect(dbUrl,{useNewUrlParser:true},(err,client)=>{
//    assert.equal(null,err);
//    client.db(dbName).collection(dbCol).find(param).toArray((err,docs)=>{
//      assert.equal(err,null);
//      callback(docs);
//      client.close();
//    });
//  });
//};
