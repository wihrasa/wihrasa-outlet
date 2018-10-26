'use strict';
/* npm modules */
/* local moduls */
const mongo = require('../lib/mongo.js');
/* modules implements */
/* global variables */

/* start codes */
const db=(colName,userType,outlet,unit)=>{
  //
  if(!colName&&userType=='outlet'){
         if( outlet == 'ruangtengah' && unit == 'sarinah'    ){ return mongo('mongodb://localhost:27017','wihrasa','ruangtengah_sarinah'  );}
    else if( outlet == 'ruangtengah' && unit == 'makassar'   ){ return mongo('mongodb://localhost:27017','wihrasa','ruangtengah_makassar' );}
    else if( outlet == 'manggar'     && unit == 'kebonsirih' ){ return mongo('mongodb://localhost:27017','wihrasa','manggar_kebonsirih'   );}
    else if( outlet == 'manggar'     && unit == 'patrajasa'  ){ return mongo('mongodb://localhost:27017','wihrasa','manggar_patrajasa'    );}
    else if( outlet == 'kantin'      && unit == 'kendal'     ){ return mongo('mongodb://localhost:27017','wihrasa','kantin_kendal'        );}
    else if( outlet == 'kantin'      && unit == 'lemhanas'   ){ return mongo('mongodb://localhost:27017','wihrasa','kantin_lemhanas'      );}
    else if( outlet == 'kantin'      && unit == 'westin'     ){ return mongo('mongodb://localhost:27017','wihrasa','kantin_westin'        );}
    else if( outlet == 'arena'       && unit == 'kemenpora'  ){ return mongo('mongodb://localhost:27017','wihrasa','arena_kemenpora'      );}
  }else if(colName){
    //
  }
  //
};

/* export codes to module */
module.exports = db;
