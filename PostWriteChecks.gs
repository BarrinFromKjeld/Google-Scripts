function postWriteChecks(){
  currentRatioCheck();
}

function currentRatioCheck() {
  var yearName = "Jahr"
  var currentRatioName = "Liquidität 3. Grades";
  var currentAssetsName = "Umlaufvermögen";
  var shortTermLiabilityName = "Summe kurzfristige Verbindlichkeiten";
  
  var layout = getKeyFigureLayoutFromSpreadSheet();
  var yearRow = getCorrespondingRowNumber(yearName,layout);
  var currentRatioRow = getCorrespondingRowNumber(currentRatioName,layout);
  var currentAssetsRow = getCorrespondingRowNumber(currentAssetsName,layout);
  var shortTermLiabilityRow = getCorrespondingRowNumber(shortTermLiabilityName,layout);
  
  var maxCol = 1;
  var currYear = "";
  do{
    currYear = DATA_SHEET.getRange(yearRow,++maxCol).getValue(); 
  }while (isNumber(currYear));
  
  for (var column = 2; column < maxCol; ++column){
    var currentRatio = DATA_SHEET.getRange(currentRatioRow,column).getValue();
    var currentAssets = DATA_SHEET.getRange(currentAssetsRow,column).getValue();
    var shortTermLiability = DATA_SHEET.getRange(shortTermLiabilityRow,column).getValue();
    if (shortTermLiability*currentRatio < currentAssets){
      var correctedCurrentRatio = currentAssets/shortTermLiability;
      Logger.log ("W - Correcting currentRatio at {" + currentRatioRow + "," + column + "} from '" + currentRatio + "' to '" + correctedCurrentRatio + "'");
      writeDataValue(correctedCurrentRatio,currentRatioRow,column);
    }
  }
}