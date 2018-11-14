/**********************************\
|*        global variables        *|
\**********************************/
var METADATA_SHEET = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Overview");
var DATA_SHEET     = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("RawData");
var LOG_SHEET      = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("LOG");

/**********************************\
|*              Main              *|
\**********************************/
function handleTrigger(e){
  Logger.log('I - Event:');
  Logger.log(e);
  writeNameToMetaData(e.namedValues["Name"][0]);
  writeIsinToMetaData(e.namedValues["ISIN"][0]);
  ScrappData();
}

function ScrappData(){
  purgeData(); //to not cover issues with old data
  var dataSet = getAllData();
  extractAndWriteValues(dataSet);
  postWriteChecks();
}