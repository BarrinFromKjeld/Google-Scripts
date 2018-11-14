/**********************************\
|*            Parsing             *|
\**********************************/

function parseTable(match){
  try {
    var table = XmlService.parse(match);
  } catch (e) { 
    writeLogValue('PARSER','E', e);
    writeLogValue('PARSER','D', match);
    throw e;
  }
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