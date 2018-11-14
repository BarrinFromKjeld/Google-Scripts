/**********************************\
|*            TODO List           *|
\**********************************/
//TODO: implement mergeRangeIndexes()

/**********************************\
|*            Clean-Up            *|
\**********************************/

function purgeData(){
  //B2:G100
  var anchorRow = 2;
  var anchorColumn = 2;
  var rows = 98;
  var columns = 6;
  var rangeListWithoutFormula = getRangesWithoutFormula(anchorRow,anchorColumn,rows,columns);
  rangeListWithoutFormula.setValue('');
}

function getRangesWithoutFormula(anchorRow,anchorColumn,rows,columns){
  var sheet = DATA_SHEET;
  var formulas = sheet.getRange(anchorRow,anchorColumn,rows,columns).getFormulas();
  var a1NotationRangeList = getRangeList(formulas,anchorRow,anchorColumn);
  var rangeList = sheet.getRangeList(a1NotationRangeList);
  return rangeList;
}

function getRangeList(formulas,anchorRow,anchorColumn){
  var rangeIndexes = [];
  for (var i = 0; i < formulas.length; ++i){
    for (var j = 0; j < formulas[i].length; ++j){
      if (formulas[i][j][0] != '='){
        rangeIndexes.push(
          {
            row: i+anchorRow,
            column:j+anchorColumn,
            rows: 1,
            columns: 1
          }
        );
      }
    }
  }
  //Logger.log ('D - RangeIndexes');
  //Logger.log (rangeIndexes);
  return convertIndexesToA1Notation(rangeIndexes);
}

function mergeRangeIndexes(rangeIndexes){
  // For better performance ranges should be merged as much as possible 
  // The SpreadsheetApp calls are taking 0.004 sek each so performance 
  // is not an issue, but it would be cool to code it
  //
  // First merge adjecent cells to full rows 
  // Second merge adjecent rows to 2D Ranges
  //   Consider removing single cells from a row (e.g. Kurs last column) in favor of merging rows
  //   Consider SUM Cells merged with new range > SUM Cells merged
  return rangeIndexes;
}