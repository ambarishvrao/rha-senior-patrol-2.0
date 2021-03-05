import { Constants } from "../Constants";

function sendEmailsPeriodically(): void {
    let emailSheet = SpreadsheetApp.getActive().getSheetByName(Constants.requestSheetEmailsTabName);
    //check flag

    //get first row which has email sent successfully as false upto last row
    //for each row, check that email is not sent
    //pick template based on initial check + city response, requestor's email id, subject
    //send mail
    //set final status and request closure date
}