/**********************************\
|*        XHR and HTML Stuff      *|
\**********************************/

function getResponseText(url){
  var response = UrlFetchApp.fetch(url, {'muteHttpExceptions': true});
  var returnCode = response.getResponseCode();
  if (returnCode != 200) {
    throw 'HTTP response code: ' + returnCode;
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
          .replace(/(?:&nbsp|& )/g,'');
}