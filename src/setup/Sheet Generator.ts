import { Constants } from "../Constants";
import { SheetUtils } from "../utils/SheetUtils";

function createCitySheets() {

  let seniorPatrolOptInSheet = SpreadsheetApp.openById(Constants.seniorPatrolOptedCitiesSheetId).getSheetByName(Constants.seniorPatrolOptedCitiesTabName);
  let startRow: number = 1, endRow = 1;
  endRow = SheetUtils.getLastNonEmptyRowForColumn(seniorPatrolOptInSheet, Constants.seniorPatrolOptedCitiesColumn);
  let citiesRangeString = SheetUtils.buildRange(Constants.seniorPatrolOptedCitiesColumn, startRow, Constants.seniorPatrolOptedCitiesColumn, endRow);
  console.log("citiesRangeString= " + citiesRangeString);
  let citiesList = seniorPatrolOptInSheet.getRange(citiesRangeString).getValues();
  let citylist=[];
  for(let i:number=0;i<citiesList.length;i++){
    citylist.push(citiesList[i][0]);
  }
  console.log("cityList= " + citylist);
  //City List
  citylist = ["Agartala"];
  //Initializing City URL List
  var urllist = citylist;
  //ID of Sheet where City Sheet URLs will be stored
  var urlSheetId = "1u_786Au1bLu_XtwrqVwNhgCbqSgaNNKF-saxaCZKvK0";
  //Setting URL Sheet as active
  let cityMasterSheet = SpreadsheetApp.openById(urlSheetId);
  SpreadsheetApp.setActiveSpreadsheet(cityMasterSheet);
  //Setting Initial Position in URL Sheet
  var sheet = cityMasterSheet.getSheets()[0];
  let lastRowInSheet: number = SheetUtils.getLastNonEmptyRowForColumn(sheet, "A");
  var range = sheet.getRange(lastRowInSheet+1, 1, citylist.length + 1, 2);
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
    let currentRowNumber:number=i+1;
    var cell = range.getCell(currentRowNumber, 1);
    cell.setValue(urllist[i]);
    var cell = range.getCell(currentRowNumber, 2);
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