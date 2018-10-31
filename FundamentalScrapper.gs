/**********************************\
|*            TODO List           *|
\**********************************/
//TODO: implement mergeRangeIndexes()

/**********************************\
|*              Main              *|
\**********************************/

function ScrappData(){
  purgeOldNumbers(); //to not cover issues with old data
  var name = getName();
  var profileData = getProfileData(name);
  var balanceData = getBalanceData(name);
  var dividendData = getDividendData(name);
  var historicPriceData = getHistoricPrice(name);
  extractAndWriteValues(profileData,balanceData,dividendData,historicPriceData);
}

/**********************************\
|*            Clean-Up            *|
\**********************************/

function purgeOldNumbers(){
  //B2:G100
  var anchorRow = 2;
  var anchorColumn = 2;
  var rows = 98;
  var columns = 6;
  var rangeListWithoutFormula = getRangesWithoutFormula(anchorRow,anchorColumn,rows,columns);
  rangeListWithoutFormula.setValue('');
}

function getRangesWithoutFormula(anchorRow,anchorColumn,rows,columns){
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Overview");
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

/**********************************\
|*         Name For Links         *|
\**********************************/

function getName(){
  var name;
  try{
    name = getNameFromISIN();
  } catch (e) {
    Logger.log ('W - could not get name from ISIN: ' + e + ' - Fall back to company name.');
    name = getNameFromSheet();
  }
  Logger.log('I - Derived name: "' + name + '"');
  return name;
}

function getNameFromSheet(){
  var name = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Metadata").getRange("B1").getValues();
  name += '-aktie';
  return name;
}

function getNameFromISIN(){
  var isin = getISINFromSheet();
  if (isin == ''){
    throw 'ISIN empty in Sheet'
  }
  var response = getISINResponse(isin);
  var searchSiteRegEx = new RegExp ('<title>'+isin+' &ndash; Suche ','');
  var match = searchSiteRegEx.exec (response);
  if (match !== null){
    throw 'Landed on Search Site... ISIN "' + isin + '" is not valid';
  }
  var nameRegEx = new RegExp ('<meta property="og:url" content="https://www.wallstreet-online.de/aktien/(.*?)"/>','');
  match = nameRegEx.exec(response);
  if (match === null){
    //Logger.log ('D - Response of ISIN Search');
    //Logger.log (response);
    throw 'Could not derive name for isin "' + isin + '"';
  }
  return match[1];
}

function getISINResponse(isin){
  var response = UrlFetchApp.fetch('https://www.wallstreet-online.de/suche/?suche=&q=' + isin + '&sa=Suche');
  if (response.getResponseCode() != 200){
    throw 'Response from ISIN search: ' + response.getResponseCode()
  }
  return fixHTMLInaccuracies(response.getContentText());
}

function getISINFromSheet(){
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Metadata").getRange("B2").getValue();
}


/**********************************\
|*            Get Data            *|
\**********************************/

/*
tableData should contain:
- Kennzahlen, Währungskennzahlen in EUR
- Aktieninformationen in EUR
- Mitarbeiter
*/
function getProfileData(name) {
  var tableData = getTablesData('https://www.wallstreet-online.de/aktien/' + name + '/unternehmensprofil','t-data','');
  if (tableData.length < 2){
    throw 'E - Less than 2 tables from Profile Data';
  }
  else if (tableData.length <3){
    Logger.log ('W - Less than 3 tables from Profile Data');
  }
  else if (tableData.length >3){
    Logger.log ('W - More than 3 tables from Profile Data');
  }
  //Logger.log('I - Profile Data');
  //Logger.log(tableData);
  return tableData;
}

/*
tableData should contain:
- GuV
- Bilanz
- Cashflow
*/
function getBalanceData(name) {
  var tableData = getTablesData('https://www.wallstreet-online.de/aktien/' + name + '/bilanz','t-data','');
  if (tableData.length < 3){
    throw 'E - Less than 3 tables from Balance Data';
  }
  else if (tableData.length > 3){
    Logger.log ('W - More than 3 tables from Balance Data');
  }
  //Logger.log('I - Balance Data');
  //Logger.log(balanceData);
  return tableData;
}

/*
tableData should contain:
- Aktienkennzahlen in EUR
*/
function getDividendData(name) {
  var tableData = getTablesData('https://www.wallstreet-online.de/aktien/' + name + '/dividende','t-data','');
  if (tableData.length < 1){
    throw 'E - Less than 1 tables from Balance Data';
  }
  else if (tableData.length > 1){
    Logger.log ('W - More than 1 tables from Balance Data');
  }
  //Logger.log('I - Dividend Data');
  //Logger.log(dividendData);
  return tableData;
}

/*
tableData should contain
- Hoch-/Tief-Kurse
- Current Price
*/
function getHistoricPrice(name){
  var tableData = getTablesData('https://www.wallstreet-online.de/aktien/' + name + '/historische-kurse','t-data topfoplist ','extractPrice');
  //second entry in tableData will be the current price
  if (tableData.length < 2){
    throw 'E - Less than 1 tables from Historic Prices Data';
  }
  else if (tableData.length > 2){
    Logger.log ('W - More than 2 tables from Historic prices Data');
  }
  //Logger.log('I - Historic Prices');
  //Logger.log(historicPriceData);
  return tableData;
}

/**********************************\
|*        XHR and HTML Stuff      *|
\**********************************/

function getTablesData(url,tableClass,extractPrice){
  var responseText = getResponseText(url)
  var regExTable = RegExp('(<table class="' + tableClass + '".+?</table>)','g');
  var match;
  var data = [];
  while ((match = regExTable.exec(responseText)) !== null){
    //Logger.log('D - Match: ' + match[1]);
    var parsedData = parseTable(match[1]);
    if (parsedData !== null){
      data.push(parsedData);
    }
  }
  if (extractPrice == 'extractPrice'){
    data.push(parsePrice(responseText));
  }
  return data;
}

function getResponseText(url){
  var response = UrlFetchApp.fetch(url, {'muteHttpExceptions': true});
  var returnCode = response.getResponseCode();
  if (returnCode != 200) {
    throw 'getProfileData: HTTP response code ' + returnCode;
  }
  return fixHTMLInaccuracies(response.getContentText());
}

function fixHTMLInaccuracies(htmlString){
  return fixBadTags(fixLineBreaks(htmlString)).toString();
}

function fixLineBreaks(htmlString){
  return htmlString.replace(/(?:\r\n|\r|\n)/g, ' ');
}

function fixBadTags(htmlString){
  return htmlString
          .replace(/(?:<nobr>|<br>)/g,'')
          .replace(/<th [^\/]*?>/g,'<th>')
          .replace(/(?:&nbsp|&lrm;)/g,'');
}

/**********************************\
|*            Parsing             *|
\**********************************/

function parseTable(match){
  var table = XmlService.parse(match);
  var data = [];
  var head = table.getRootElement().getChild('thead');
  if (head === null){
    return null;
  }
  data.push(parseHead(head));
  var body = parseBody(table.getRootElement().getChild('tbody'));
  for (var i = 0; i < body.length; ++i){
    data.push(body[i]);
  }
  //Logger.log('D - Parsed Data: ');
  //Logger.log(data);
  return data;
}

function parseHead(elem){
  var columns = elem.getChild('tr').getChildren();
  var years = ['Year'];
  for (var i = 1; i < columns.length; ++i){
    years.push(columns[i].getValue());
  }
  return years;
}

function parseBody(elem){
  var rows = elem.getChildren();
  var rowValues = [];
  for (var i = 0; i < rows.length; ++i){
    var columns = rows[i].getChildren();
    var columnValues = [];
    for (var j = 0; j < columns.length; ++j){
      columnValues.push(columns[j].getValue().replace(/ %/,'%'));
    }
    rowValues.push(columnValues);
  }
  return rowValues;
}

function parsePrice(responseText){
  var regExTable = RegExp('<div class="pull-left quoteValue"><span data-push=".*?" *>([0-9,.]*)</span></div>','');
  var match = regExTable.exec(responseText);
  if (match === null){
    throw 'E - Could not find current price'
  }
  return match[1];
}

/**********************************\
|*            Writing             *|
\**********************************/

function extractAndWriteValues(profileData,balanceData,dividendData,historicPriceData){
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

function writeYears(alignedYears,keyFigureLayout){
  var correspondingRowNumber = getCorrespondingRowNumber('Jahr',keyFigureLayout);
  for (var i = 0; i < alignedYears.length; ++i){
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Overview").getRange(correspondingRowNumber,i+2).setValue(alignedYears[i]);
  }
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Overview").getRange(correspondingRowNumber,i+2).setValue('Today');
}

function writeTable(tableData,alignedYears,keyFigureLayout){
  var columnIndexes = getRelevantColumns(tableData,alignedYears);
  for (var i = 1; i < tableData.length; ++i){
    var correspondingRowNumber = getCorrespondingRowNumber(tableData[i][0],keyFigureLayout);
    if (correspondingRowNumber != -1){
      for (var j = 0; j < columnIndexes.length; ++j){
        SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Overview").getRange(correspondingRowNumber,j+2).setValue(tableData[i][columnIndexes[j]]);
      }
    }
  }
}

function writePrice(price,alignedYears,keyFigureLayout){
  var correspondingRowNumber = getCorrespondingRowNumber("Kurs", keyFigureLayout)
  if (correspondingRowNumber != -1){
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Overview").getRange(correspondingRowNumber,alignedYears.length+2).setValue(price);
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
|*  Map Scrap- and Sheet-Laypout  *|
\**********************************/

function getKeyFigureLayoutFromSpreadSheet(){
  var keyFigures = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Overview").getRange(1,1,100).getValues();
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

function writeData(data,alignedYears,keyFigureLayout){
  for (var i = 0; i < data.length; ++i){
    writeTable(data[i],alignedYears,keyFigureLayout);
  }
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
  var index = keyFigureLayout[0].indexOf(keyFigure);
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
