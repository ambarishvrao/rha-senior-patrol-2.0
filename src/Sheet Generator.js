function createCitySheets() {
  //City List
  var citylist = ["Delhi"];
  //Initializing City URL List
  var urllist = citylist;
  //ID of Sheet where City Sheet URLs will be stored
  var urlSheetId = "1u_786Au1bLu_XtwrqVwNhgCbqSgaNNKF-saxaCZKvK0";
  //Setting URL Sheet as active
  var ss = SpreadsheetApp.openById(urlSheetId);
  SpreadsheetApp.setActiveSpreadsheet(ss);
  //Setting Initial Position in URL Sheet
  var sheet = ss.getSheets()[0];
  var range = sheet.getRange(1, 1, citylist.length + 1, 2);
  //Loop to create sheets, save URLs, Link Data
  for (var i = 0; i < citylist.length; i++) {
    var ssName = citylist[i];
    //City wise sheet creation
    var ssNew = SpreadsheetApp.create(ssName + " Senior Patrol 2.0 Request List");
    var newssid = ssNew.getId();
    //Setting Access to View Only via Link
    var f = DriveApp.getFileById(newssid);
    var folderId = "1rksluiXhUTlLgWrqpPzdQL7-yBJv_Gda";
    DriveApp.getFolderById(folderId).addFile(f);
    f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT);
    //Saving URLs in URL Sheet
    //urllist[i]=urllist[i]+"-"+ssNew.getUrl();
    var cell = range.getCell(i + 2, 1);
    cell.setValue(urllist[i]);
    var cell = range.getCell(i + 2, 2);
    var cityURL = ssNew.getUrl();
    var truncIndex = cityURL.search("/edit");
    cityURL = cityURL.substring(0, truncIndex);
    cell.setValue(cityURL);

    //Copying from Template

    //ID of City Responses Template Sheet
    var templateId = "1AE4rUw21oGlDOclEgMcfAcLu2wSfx1VfT7m1INOXcKM";
    //Setting Template Sheet as active
    var templateSheet = SpreadsheetApp.openById(templateId);
    SpreadsheetApp.setActiveSpreadsheet(templateSheet);
    var source = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = source.getSheets()[0];

    var destination = SpreadsheetApp.openById(newssid);
    sheet.copyTo(destination);

    //Cleanup of the new sheet
    SpreadsheetApp.setActiveSpreadsheet(destination);
    var ss = SpreadsheetApp.getActive();
    sheet = ss.getSheetByName('Sheet1');
    ss.deleteSheet(sheet);
    sheet = ss.getSheetByName('Copy of Requests');
    SpreadsheetApp.getActiveSpreadsheet().renameActiveSheet("Requests");
  }
}