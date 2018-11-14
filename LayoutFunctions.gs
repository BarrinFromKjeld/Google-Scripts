/**********************************\
|*  Map Scrap- and Sheet-Layout   *|
\**********************************/

function getKeyFigureLayoutFromSpreadSheet(){
  var keyFigures = DATA_SHEET.getRange(1,1,100).getValues();
  var keyFiguresLayout = [[],[]];
  for (var i = 0; i < keyFigures.length; ++i){
    if (keyFigures[i][0] != ''){
      keyFiguresLayout[0].push((keyFigures[i][0])/*.hexEncode()*/);
      keyFiguresLayout[1].push(i+1);
    }
  }
  //Logger.log ('D - Key Figure Layout');
  //Logger.log (keyFiguresLayout);
  return keyFiguresLayout;
}

function getRelevantColumns(tableData,alignedYears){
  var columnIndexes = [];
  for (var i = 0; i < alignedYears.length; ++i){
    columnIndexes.push(-1);
  }
  for (var i = 0; i < tableData[0].length; ++i){
    var index = alignedYears.indexOf(tableData[0][i]);
    if (index > -1){
      columnIndexes[index] = i;
    }
  }
  //Logger.log ('D - column mapping');
  //Logger.log (tableData);
  //Logger.log (alignedYears);
  //Logger.log (columnIndexes);
  for (var i = 0; i < columnIndexes.length; ++i){
    if (columnIndexes[i] == -1){
      throw 'relevantColumns contain an unmapped entry at ' + i;
    }
  }
  return columnIndexes;
}

function getCorrespondingRowNumber(keyFigure, keyFigureLayout){
  var index = keyFigureLayout[0].indexOf(keyFigure.replace('\u200e',''));
  //Logger.log ('D - getCorrespondingRowNumber');
  //Logger.log ('"' + keyFigure.hexEncode() + '"');
  //Logger.log ('"' + keyFigure + '"');
  //Logger.log (index);
  if (index == -1){
    return -1;
  }
  else{
    return keyFigureLayout[1][index];
  }
}
