'use strict';
/* npm modules */
/* local modules */
const mongo = require('../lib/mongo.js');
/* modules implements */
/* global variables */

/* start codes */
const dbOutlet=(outlet,unit)=>{
  //
  var dbName  = 'wihrasa';
  var colName = '';
  //
       if( outlet == 'ruangtengah' && unit == 'sarinah'    ){ colName = 'ruangtengah_sarinah'  ;}
  else if( outlet == 'ruangtengah' && unit == 'makassar'   ){ colName = 'ruangtengah_makassar' ;}
  else if( outlet == 'manggar'     && unit == 'kebonsirih' ){ colName = 'manggar_kebonsirih'   ;}
  else if( outlet == 'manggar'     && unit == 'patrajasa'  ){ colName = 'manggar_patrajasa'    ;}
  else if( outlet == 'kantin'      && unit == 'kendal'     ){ colName = 'kantin_kendal'        ;}
  else if( outlet == 'kantin'      && unit == 'lemhanas'   ){ colName = 'kantin_lemhanas'      ;}
  else if( outlet == 'kantin'      && unit == 'westin'     ){ colName = 'kantin_westin'        ;}
  else if( outlet == 'arena'       && unit == 'kemenpora'  ){ colName = 'arena_kemenpora'      ;}
  //
  return mongo('mongodb://localhost:27017',dbName,colName);
  //
};

/* export codes to module */
module.exports = dbOutlet;
