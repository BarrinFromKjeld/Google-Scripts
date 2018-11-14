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
  if (name == ''){
    throw 'Could not get name'
  }
  Logger.log('I - Derived name: "' + name + '"');
  if (getNameFromSheet() == ''){
    writeNameToMetaData(name.replace('-aktie',''));
  }
  return name;
}

function getNameFromSheet(){
  var name = METADATA_SHEET.getRange("B1").getValues();
  name += '-aktie';
  return name;
}

function getNameFromISIN(){
  var isin = getISINFromSheet();
  if (isin == ''){
    throw 'ISIN empty in Sheet'
  }
  var response = getResponseFromISINSearch(isin);
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

function getISINFromSheet(){
  return METADATA_SHEET.getRange("B2").getValue();
}