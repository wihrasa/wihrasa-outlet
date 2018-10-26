'use strict';

const time  = require('../lib/time.js');
const db    = require('../lib/db.js');
const shell = require('shelljs');

const formatDate=(date)=>{
  date=date+'';
  return ['','Mon','Tue','Wed','Thu','Fri','Sat','Sun'][Number(date.slice(6,8))]+', '+Number(date.slice(4,6)) +' '+['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(date.slice(2,4))]+' 20'+Number(date.slice(0,2));
};

const toThousand=function(z){
  z=z||0;
  return z.toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');
};

const purchasePDF=(outletData,supplierData,callback)=>{
  //
  db('wihrasa',outletData.db).find({date:time(0)},(docs)=>{
    //
    var poPDF          = [];
    var outlet_name    = outletData.db.split('_')[0];
    var outlet_unit    = outletData.db.split('_')[1];
    var outletName     = outletData.outletName;
    var outletFullName = outletData.outletFullName;
    var outletUnit     = outletData.outletUnit;
    var outletCode     = outletData.outletCode;
    var outletLocation = outletData.outletLocation;
    var outletAddress  = outletData.outletAddress;
    var outletPhone    = outletData.outletPhone;
    var outletManager  = outletData.outletManager;
    var outletManagerPhone = outletData.outletManagerPhone;
    var date           = docs[0].date;
    var purchaseOrder  = docs[0].purchase.order;
    var suppliers      = purchaseOrder.suppliers;
    var supplierId     = 0;
    var supplierName;
    var supplierCode;
    var supplierLocation;
    var supplierAddress;
    var supplierPhone;
    var items;
    var tableHTML;
    var itemHTML;
    var itemLength;
    var pages;
    //
    shell.exec('mkdir -p /usr/share/nginx/wihrasa/po/'+outlet_name);
    shell.exec('mkdir -p /usr/share/nginx/wihrasa/po/'+outlet_name+'/'+outlet_unit);
    shell.exec('mkdir -p /usr/share/nginx/wihrasa/po/'+outlet_name+'/'+outlet_unit+'/'+date);
    //
    for(var i=0;i<suppliers.length;i++){
      //
      supplierName = suppliers[i].supplier;
      items        = suppliers[i].items;
      //
      for(var iv=0;iv<supplierData.length;iv++){
        if(supplierData[iv].supplierName==supplierName){
          supplierCode     = supplierData[iv].supplierCode;
          supplierLocation = supplierData[iv].supplierLocation;
          supplierAddress  = supplierData[iv].supplierAddress;
          supplierPhone    = supplierData[iv].supplierPhone;
        }
      };
      //
      itemHTML='';
      //
      itemLength=items.length;
      pages=itemLength-10;
      pages=pages<0?1:Math.floor(pages/20)+2;
      //
      itemHTML=itemHTML+
      '<!DOCTYPE html>'+
      '<html>'+
        '<head>'+
          '<link rel="stylesheet" href="/css/style.css">'+
          '<style>'+
            'html,body{height:auto;}'+
          '</style>'+
        '</head>'+
        '<body>'+
          '<div class="page html-to-pdf active">'+
            '<div class="header">'+
              '<div class="appbar">'+
                '<div class="po-id">PO '+(''+date).slice(0,6)+' '+outletCode+supplierCode+' </div>'+
                '<div class="outlet">'+outletName+', '+outletUnit+'</div>'+
                '<div class="po-date">'+formatDate(time(0))+'</div>'+
              '</div>'+
            '</div>'+
            '<div class="main">'+

              '<div class="wrapper">'+

                '<div class="margin"></div>'+

                '<div class="label">To:</div>'+
                '<div class="field bold">'+supplierName+'</div>'+
                '<div class="field italic">'+supplierLocation+'</div>'+
                '<div class="field italic">'+supplierAddress+'</div>'+
                '<div class="field italic">'+supplierPhone+'</div>'+

                '<div class="margin"></div>'+

                '<div class="label">Delivery To:</div>'+
                '<div class="field bold">'+outletFullName+'</div>'+
                '<div class="field italic">'+outletUnit+'</div>'+
                '<div class="field italic">'+outletLocation+'</div>'+
                '<div class="field italic">'+outletAddress+'</div>'+
                '<div class="field italic">'+outletPhone+'</div>'+

                '<div class="margin"></div>'+

                '<div class="label">Ordered By:</div>'+
                '<div class="field bold">'+outletManager+'</div>'+
                '<div class="field italic">Outlet Manager</div>'+
                '<div class="field italic">'+outletManagerPhone+'</div>'+

                '<div class="margin"></div>'+

              '</div>'+
              '<div class="wrapper">'+

                '<div class="margin"></div>'+

                '<div class="label">From:</div>'+
                '<div class="field bold">Wihrasa Group</div>'+
                '<div class="field italic">Jl Kendal No 1</div>'+
                '<div class="field italic">Menteng, Jakarta Pusat 10310</div>'+
                '<div class="field italic">021 - 3920099</div>'+

                '<div class="margin"></div>'+

                '<div class="label">Delivery Date:</div>'+
                '<div class="field bold">'+formatDate(date)+'</div>'+
                '<div class="field italic"></div>'+
                '<div class="field italic"></div>'+
                '<div class="field italic"></div>'+
                '<div class="field italic"></div>'+

                '<div class="margin"></div>'+

                '<div class="label">Approved By:</div>'+
                '<div class="field bold">Mr. Ridwan</div>'+
                '<div class="field italic">Purchase Manager</div>'+
                '<div class="field italic"></div>'+

                '<div class="margin"></div>'+

              '</div>'+

              '<div class="margin"></div>'+
              '<div class="margin"></div>'+

              '<table>'+
                '<thead>'+
                  '<tr>'+
                    '<th colspan="1">Item</th>'+
                    '<th colspan="2">Price*</th>'+
                    '<th colspan="2">Qty</th>'+
                    '<th colspan="2">Subtotal</th>'+
                  '</tr>'+
                '</thead>'+
                '<tbody>';
      //
      var iii=0;
      for(var ii=0;ii<pages;ii++){
        if(ii==0){
          for(iii;iii<itemLength;iii++){
            //
            var odd=iii%2;
            odd=odd?'':'odd';
            //
            itemHTML=itemHTML+
              '<tr class="'+odd+'">'+
                '<td class="item">'+items[iii].item+'</td>'+
                '<td class="rp">Rp</td>'+
                '<td class="price">'+toThousand(items[iii].price)+'</td>'+
                '<td class="qty">'+toThousand(items[iii].qty)+'</td>'+
                '<td class="unit">'+items[iii].unit+'</td>'+
                '<td class="rp">Rp</td>'+
                '<td class="subtotal">'+toThousand(items[iii].subTotal)+'</td>'+
              '</tr>';
            //
            if(iii==9){break;}
            //
          };
          if(ii==pages-1){
            itemHTML=itemHTML+
              '<tr class="total">'+
                '<td class="label" colspan="5">Total</td>'+
                '<td class="rp">Rp</td>'+
                '<td class="total" colspan="1">'+toThousand(suppliers[i].total)+'</td>'+
              '</tr>'+
              '<tr class="odd">'+
                '<td class="item" colspan="3">* Price by last order</td>'+
                '<td class="subtotal" colspan="4">PO '+(''+date).slice(0,6)+' '+outletCode+supplierCode+' Pages '+(ii+1)+' / '+pages+'</td>'+
              '</tr>';
          }else{
            itemHTML=itemHTML+
              '<tr class="odd">'+
                '<td class="item" colspan="3">* Price by last order</td>'+
                '<td class="subtotal" colspan="4">PO '+(''+date).slice(0,6)+' '+outletCode+supplierCode+' Pages '+(ii+1)+' / '+pages+'</td>'+
              '</tr>';
          }
          iii++;
        }else{
          for(iii;iii<itemLength;iii++){
            //
            var odd=iii%2;
            odd=odd?'':'odd';
            //
            itemHTML=itemHTML+
              '<tr class="'+odd+'">'+
                '<td class="item">'+items[iii].item+'</td>'+
                '<td class="rp">Rp</td>'+
                '<td class="price">'+items[iii].price+'</td>'+
                '<td class="qty">'+items[iii].qty+'</td>'+
                '<td class="unit">'+items[iii].unit+'</td>'+
                '<td class="rp">Rp</td>'+
                '<td class="subtotal">'+items[iii].subTotal+'</td>'+
              '</tr>';
            //
            if(iii==(((ii*20)+10)-1)){break;}
          };
          if(ii==pages-1){
            itemHTML=itemHTML+
              '<tr class="total">'+
                '<td class="label" colspan="5">Total</td>'+
                '<td class="rp">Rp</td>'+
                '<td class="total" colspan="1">'+toThousand(suppliers[i].total)+'</td>'+
              '</tr>'+
              '<tr class="odd">'+
                '<td class="item" colspan="3">* Price by last order</td>'+
                '<td class="subtotal" colspan="4">PO '+(''+date).slice(0,6)+' '+outletCode+supplierCode+' Pages '+(ii+1)+' / '+pages+'</td>'+
              '</tr>';
          }else{
            itemHTML=itemHTML+
              '<tr class="odd">'+
                '<td class="item" colspan="3">* Price by last order</td>'+
                '<td class="subtotal" colspan="4">PO '+(''+date).slice(0,6)+' '+outletCode+supplierCode+' Pages '+(ii+1)+' / '+pages+'</td>'+
              '</tr>';
          }
          iii++;
        }
      };
      //
      itemHTML=itemHTML+
            '</tbody>'+
              '</table>'+
            '</div>'+
          '</div>'+
        '</body>'+
      '</html>';
      //
      //
      if(!supplierId){supplierId++;};
      var htmlPath = `/usr/share/nginx/wihrasa/po/`+outlet_name+`/`+outlet_unit+`/`+date+`/`+i+`.html`;
      shell.exec(`echo '`+itemHTML+`' > `+htmlPath);
      //
    };
    //
    var downloadURL=[];
    for(var ix=0;ix<i;ix++){
      var htmlURL = `http://178.128.88.151/po/`+outlet_name+`/`+outlet_unit+`/`+date+`/`+ix+`.html`;
      var pdfPath = `/usr/share/nginx/wihrasa/po/`+outlet_name+`/`+outlet_unit+`/`+date+`/PO`+(''+date).slice(0,6)+outletCode+suppliers[ix].supplierCode+`.pdf`;
      //
      shell.exec(``+
        `curl -i https://api.sejda.com/v1/tasks`+
        ` --fail --silent --show-error`+
        ` --header "Content-Type: application/json"`+
        ` --data '{ `+
            ` "url": "`+htmlURL+`",`+
            ` "type": "htmlToPdf",`+
            ` "pageSize" : "a4",`+
            ` "pageOrientation" : "portrait",`+
            ` "pageMargin" : "39",`+
        ` "pageMarginUnits" : "px"`+
        ` }'`+
        ` > `+pdfPath
      );
      //
      var poNum=`PO`+(''+date).slice(0,6)+outletCode+suppliers[ix].supplierCode;
      downloadURL.push({url:`http://178.128.88.151/po/`+outlet_name+`/`+outlet_unit+`/`+date+`/`+poNum+`.pdf`,poNum:poNum});
      console.log(downloadURL[ix]);
      //
    };
    //
    callback(downloadURL);
    console.log('done');
    //
  });
  //
}

module.exports=purchasePDF;
