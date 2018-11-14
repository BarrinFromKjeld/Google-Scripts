/**********************************\
|*      For Unicode Analysis      *|
\**********************************/

//because encoding sucks...
String.prototype.hexEncode = function(){
    var hex, i;

    var result = "";
    for (i=0; i<this.length; i++) {
        hex = this.charCodeAt(i).toString(16);
        result += ("000"+hex).slice(-4);
    }

    return result
}

//to show that encoding sucks...
String.prototype.hexDecode = function(){
    var j;
    var hexes = this.match(/.{1,4}/g) || [];
    var back = "";
    for(j = 0; j<hexes.length; j++) {
        back += String.fromCharCode(parseInt(hexes[j], 16));
    }

    return back;
}

function convertIndexesToA1Notation(rangeIndexes){
  var COL_NAMES = ['','A','B','C','D','E','F','G','H','I','J','K','L'];
  var mergedRangeIndexes = mergeRangeIndexes(rangeIndexes);
  var a1NotationRangeList = [];
  for (var i = 0; i<mergedRangeIndexes.length; ++i){
    var a1NotationRange = COL_NAMES[mergedRangeIndexes[i].column];
    a1NotationRange += mergedRangeIndexes[i].row;
    if (mergedRangeIndexes[i].rows > 1 || mergedRangeIndexes[i].columns > 1){
      a1NotationRange += COL_NAMES[mergedRangeIndexes[i].column + mergedRangeIndexes[i].columns - 1];
      a1NotationRange += mergedRangeIndexes[i].row + mergedRangeIndexes[i].rows - 1;
    }
    a1NotationRangeList.push(a1NotationRange);
  }
  //Logger.log ('D - a1NotationRangeList');
  //Logger.log (a1NotationRangeList);
  return a1NotationRangeList;
}

function isNumber(n) { return !isNaN(parseFloat(n)) && !isNaN(n - 0) }