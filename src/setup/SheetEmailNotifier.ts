import { Constants } from "../Constants";

let EMAIL_SENT = 'EMAIL_SENT';

function sendEmails2() {
    var urlSheetId = Constants.citySheetMasterId;
    //Setting URL Sheet as active
    var ss = SpreadsheetApp.openById(urlSheetId);
    SpreadsheetApp.setActiveSpreadsheet(ss);
    var sheet = SpreadsheetApp.getActiveSheet();
    var startRow = 1; // First row of data to process
    var numRows = 0; // Number of rows to process
    // Fetch the range of cells A2:B3
    var dataRange = sheet.getRange(startRow, 1, numRows, 3);
    // Fetch values for each row in the Range.
    var data = dataRange.getValues();
    for (var i = 0; i < data.length; ++i) {
        var row = data[i];
        var emailAddress = row[0]; // First column
        var message = row[1]; // Second column
        var emailSent = row[2]; // Third column
        if (emailSent !== EMAIL_SENT) { // Prevents sending duplicates
            var subject = '#SeniorPatrol City Requests Sheet';
            MailApp.sendEmail(emailAddress, subject, message);
            sheet.getRange(startRow + i, 3).setValue(EMAIL_SENT);
            // Make sure the cell is updated right away in case the script is interrupted
            SpreadsheetApp.flush();
        }
    }
}