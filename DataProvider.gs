/**********************************\
|*            Get Data            *|
\**********************************/

function getAllData(){
  var dataSet = [];
  var name = getName();
  var dataDefinitions = getDataDefinitions();
  for (var i = 0; i < dataDefinitions.length ; ++i){
    dataSet.push(getDataForDataDefinition(dataDefinitions[i],name));
  }
  return dataSet;
}

function getDataDefinitions(){
  return [
    { 
      dataName : 'unternehmensprofil',
      tableType : 't-data',
      needed : 2,
      expectedTables : 3,
      options: ''
      /*
        - Kennzahlen, Währungskennzahlen in EUR
        - Aktieninformationen in EUR
        - Mitarbeiter
      */
    },
    { 
      dataName : 'bilanz',
      tableType : 't-data',
      needed : 3,
      expectedTables : 3,
      options: ''
      /*
        - GuV
        - Bilanz
        - Cashflow
      */
    },
    { 
      dataName : 'dividende',
      tableType : 't-data',
      needed : 1,
      expectedTables : 1,
      options: ''
      /*
        - Aktienkennzahlen in EUR
      */
    },
    { 
      dataName : 'historische-kurse',
      tableType : 't-data topfoplist ',
      needed : 2,
      expectedTables : 2,
      options:'extractPrice'
      /*
        - Hoch-/Tief-Kurse
        - Current Price
      */
    }
  ];
}

function getResponseFromISINSearch(isin){
  return getResponseText('https://www.wallstreet-online.de/suche/?suche=&q=' + isin + '&sa=Suche');
}

function getDataForDataDefinition(dataDefinition,name){
  var url = 'https://www.wallstreet-online.de/aktien/' + name + '/' + dataDefinition.dataName;
  var tableData = getTablesData(url,dataDefinition.tableType,dataDefinition.options);
  //Logger.log('I - ' + dataDefinition.dataName + ': ');
  //Logger.log(tableData);
  checkData(tableData,dataDefinition.neededTables,dataDefinition.expectedTables);
  return tableData;
}

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

function checkData(tableData,neededTables,expectedTables){
  if (tableData.length < neededTables){
    throw 'E - Less than neededTables tables from Profile Data';
  }
  else if (tableData.length < expectedTables){
    Logger.log ('W - Less than ' + expectedTables + ' tables from Profile Data');
  }
  else if (tableData.length > expectedTables){
    Logger.log ('W - More than ' + expectedTables + ' tables from Profile Data');
  }
}