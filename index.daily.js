!function(){
  _indexDaily=function(me){
    //
    var me     = b[q](me);
    var header = me[q]('.header');
    var appbar = header[q]('.appbar');
    var subTtl = appbar[q]('.sub-title');
    var tabs   = header[q]('.tabs');
    var tab    = tabs[qAll]('.tab');
    var main   = me[qAll]('.main');
    var iii;
    //
    for(var i=0;i<tab[l];i++){
      _mainDailyReport(me,i);
    }
    //
    for(var i=0;i<tab[l];i++){
      //
      tab[i].onclick=function(){
        for(var ii=0;ii<tab[l];ii++){
          tab[ii][cl].remove('active');
          main[ii][cl].remove('active');
          if(this==tab[ii]){iii=ii;}
        };
        tab [iii][cl].add('active');
        main[iii][cl].add('active');
      }
      //
    }
    //
  }
}();