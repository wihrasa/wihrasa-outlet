const time=(days)=>{
  // get time
  var nw=new Date();
  var yer=nw.getFullYear();
  var mon=nw.getMonth();
  var dat=nw.getDate();
  var day=nw.getDay();
  var hrs=nw.getHours();
  var min=nw.getMinutes();
  var sec=nw.getSeconds();
  // days number
  var dayNum=(yer,mon)=>{
    var feb=yer%4?28:29;
    return [31,feb,31,30,31,30,31,31,30,31,30,31][mon];
  };

  // set days by outlet time
  //days=hrs<6?days-1:days;

  // set first day is Monday
  day=day==0?7:day;
  // count day
  day=day+days;
  day=day%7;

  day=day==0?7:day;
  day=day<0?(day+7):day;
  // count dat mon yer
  dat=dat+days;
  if(dat<1){
    mon--,
    mon<0&&(mon=11,yer=yer--),
    dat=dayNum(yer,mon)-dat
    console.log(dat);
  }else if(dat>dayNum(yer,mon)){
    do{
      dat=dat-dayNum(yer,mon),
      mon++,
      yer=mon>11?yer++:yer
    }while(dat>dayNum(yer,mon));
  };
  // set first mon is 1
  mon++;
  // return to number format
  return Number((''+yer).slice(2,4)+''+(mon<10?"0"+mon:mon)+''+(dat<10?"0"+dat:dat)+'0'+day);
};

module.exports=time;
