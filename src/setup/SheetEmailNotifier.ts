import { Templates } from "../comunications/Templates";
import { Constants } from "../Constants";
import { SheetUtils } from "../utils/SheetUtils";

let EMAIL_SENT = 'Yes';

function sendEmailsAboutSeniorPatrolSheet() {
    var urlSheetId = Constants.citySheetMasterId;
    //Setting URL Sheet as active
    var ss = SpreadsheetApp.openById(urlSheetId);
    SpreadsheetApp.setActiveSpreadsheet(ss);
    var sheet = SpreadsheetApp.getActiveSheet();
    var startRow = 2; // First row of data to process
    var numRows = 0; // Number of rows to process
    let lastRowNumber = SheetUtils.getLastNonEmptyRowForColumn(sheet, "A");
    var dataRange = sheet.getRange(startRow, 1, (lastRowNumber - startRow) + 1, 4);
    // Fetch values for each row in the Range.
    var data = dataRange.getValues();
    for (var i = 0; i < data.length; ++i) {
        var row = data[i];
        var emailSent = row[3]; // Fourth column
        if (emailSent !== EMAIL_SENT) { // Prevents sending duplicates
            try {
                var emailAddress = cleanupEmailIds(row[2]); // Column "C"
                var message = new String(Templates.citySheetNotification);
                message = message.replace("{{CITY}}", row[0]); //Column A
                message = message.replace("{{CITY}}", row[0]); //Column A
                message = message.replace("{{LINK}}", row[1]);//Column B
                var subject = '#SeniorPatrol City Requests Sheet';
                MailApp.sendEmail(emailAddress, subject, message.toString());
                sheet.getRange(startRow + i, 4).setValue(EMAIL_SENT);
                // Make sure the cell is updated right away in case the script is interrupted
                SpreadsheetApp.flush();
                console.log("Notified " + emailAddress + " successfully");
            } catch (e: unknown) {
                console.error("error sending email to city= " + row)
            }
        }
    }
}

function cleanupEmailIds(raw: string): string {
    var emails = raw.split(',');
    var valid = true;
    var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    for (var i = 0; i < emails.length; i++) {
        if (emails[i] === "" || !regex.test(emails[i].replace(/\s/g, ""))) {
            valid = false;
        }
    }
    return raw;
}
