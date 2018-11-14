/**********************************\
|*            Writing             *|
\**********************************/
function writeMetaDataValue(value,row,column){
  METADATA_SHEET.getRange(row,column).setValue(value);
}

function writeDataValue(value,row,column){
  DATA_SHEET.getRange(row,column).setValue(value);
}

function writeLogValue(topic, severity, value){
  var logRow = getLastLogRow();
  LOG_SHEET.getRange(logRow,1).setValue(Date.now());
  LOG_SHEET.getRange(logRow,2).setValue(topic);
  LOG_SHEET.getRange(logRow,3).setValue(severity);
  LOG_SHEET.getRange(logRow,4).setValue(value);
}

function getLastLogRow(){
  var vals = LOG_SHEET.getRange("A1:A").getValues();
  return vals.filter(String).length + 1; //empty cells return null which fails the String constructor
}

/**********************************\
|*            Metadata            *|
\**********************************/

function writeNameToMetaData(name){
  writeMetaDataValue(name,1,2);
}

function writeIsinToMetaData(isin){
  writeMetaDataValue(isin,2,2);
}

/**********************************\
|*              Data              *|
\**********************************/

function extractAndWriteValues(dataSet){
  var profileData = dataSet[0];
  var balanceData = dataSet[1];
  var dividendData = dataSet[2];
  var historicPriceData = dataSet[3];
  var alignedYears = getAlignedYears(profileData,balanceData,dividendData,historicPriceData);
  var keyFigureLayout = getKeyFigureLayoutFromSpreadSheet();
  writeYears (alignedYears,keyFigureLayout);
  writeData(profileData,alignedYears,keyFigureLayout);
  writeData(balanceData,alignedYears,keyFigureLayout);
  writeData(dividendData,alignedYears,keyFigureLayout);
  
  var preparedHistData = prepareHistoricPriceData(historicPriceData,alignedYears);
  writeData(preparedHistData,alignedYears,keyFigureLayout);
  
  writePrice(historicPriceData[1],alignedYears,keyFigureLayout);
}

function writeData(data,alignedYears,keyFigureLayout){
  for (var i = 0; i < data.length; ++i){
    writeTable(data[i],alignedYears,keyFigureLayout);
  }
}

function writeYears(alignedYears,keyFigureLayout){
  var correspondingRowNumber = getCorrespondingRowNumber('Jahr',keyFigureLayout);
  for (var i = 0; i < alignedYears.length; ++i){
    writeDataValue(alignedYears[i],correspondingRowNumber,i+2);
  }
  writeDataValue('Today',correspondingRowNumber,i+2);
}

function writeTable(tableData,alignedYears,keyFigureLayout){
  var columnIndexes = getRelevantColumns(tableData,alignedYears);
  for (var i = 1; i < tableData.length; ++i){
    var correspondingRowNumber = getCorrespondingRowNumber(tableData[i][0],keyFigureLayout);
    if (correspondingRowNumber != -1){
      for (var j = 0; j < columnIndexes.length; ++j){
        writeDataValue(tableData[i][columnIndexes[j]],correspondingRowNumber,j+2);
      }
    }
  }
}

function writePrice(price,alignedYears,keyFigureLayout){
  var correspondingRowNumber = getCorrespondingRowNumber("Kurs", keyFigureLayout)
  if (correspondingRowNumber != -1){
    writeDataValue(price,correspondingRowNumber,alignedYears.length+2);
  }
  else{
    throw ('Could not find corresponding row for price');
  }
}

/**********************************\
|*     Ensure consistent years    *|
\**********************************/

function getAlignedYears (profileData,balanceData,dividendData,historicPriceData){
  var histPriceYears = getHistoricPriceYears(historicPriceData);
  var years = intersect(profileData[0][0],profileData[1][0]);
  years = intersect(years,profileData[2][0]);
  years = intersect(years,balanceData[0][0]);
  years = intersect(years,balanceData[1][0]);
  years = intersect(years,balanceData[2][0]);
  years = intersect(years,dividendData[0][0]);
  years = intersect(years,histPriceYears);
  //Logger.log('I - Aligned Years: ' + years);
  if (years.length == 0){
    throw 'Could not find aligned years'
  }
  years.sort();
  
  //5 years are expected. Otherwise the formulas on Metadata do not work
  if (years.length > 5){
    Logger.log('W - Cutting more than 5 aligned years: ' + years);
    years.slice(years.length-5)
  }
  else if (years.length < 5){
    Logger.log('W - Less than 5 aligned years found: ' + years);
  }
  return years;
}

function getHistoricPriceYears(historicPriceData){
  var years = [];
  for (var i = 1; i<historicPriceData[0].length; ++i){
    years.push(historicPriceData[0][i][0]);
  }
  //Logger.log('D - Historic Price Years: ' + years);
  return years;
}

function intersect (a, b){
    var t;
    return a.filter(function (e) {
        return b.indexOf(e) > -1;
    }).filter(function (e, i, c) { // extra step to remove duplicates
        return c.indexOf(e) === i;
    });
}

/**********************************\
|*     Transpose History Data     *|
\**********************************/

function prepareHistoricPriceData(historicPriceData,alignedYears){
  var yearEndCol = getYearEndCol(historicPriceData);
  var preparedData = [['Year'],['Kurs']];
  for (var i = 0; i < alignedYears.length; ++i){
    var price = findPriceOfYear(historicPriceData,alignedYears[i],yearEndCol);
    preparedData[0].push(alignedYears[i]);
    preparedData[1].push(price);
  }
  var arrayOfPreparedData = [];
  arrayOfPreparedData.push(preparedData);
  return arrayOfPreparedData;
}

function getYearEndCol(historicPriceData){
  for (var i = 0; i<historicPriceData[0][0].length; ++i){
    if (historicPriceData[0][0][i] == 'Jahresende')
      return i;
  }
}

function findPriceOfYear(historicPriceData,year,yearEndCol){
  for (var i = 0; i < historicPriceData[0].length; ++i){
    if (year == historicPriceData[0][i][0]){
      return historicPriceData[0][i][yearEndCol];
    }
  }
  throw 'Could not find price for year "' + alignedYears[i] + '"';
}