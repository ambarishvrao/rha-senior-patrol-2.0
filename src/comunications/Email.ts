import { CityRequestStatus } from "../CityRequestStatus";
import { Constants } from "../Constants";
import { InitialCheckRequestStatus } from "../models/InitialCheckRequestStatus";
import { RequestUtils } from "../utils/RequestUtils";
import { SheetUtils } from "../utils/SheetUtils";
import { Utils } from "../utils/Utils";
import { Templates } from "./Templates";

function sendEmailsPeriodically(): void {
    let emailSheet = SpreadsheetApp.getActive().getSheetByName(Constants.requestSheetEmailsTabName);
    let requestsSheet = SpreadsheetApp.getActive().getSheetByName(Constants.requestSheetTabName);
    let actionSheet = SpreadsheetApp.getActive().getSheetByName(Constants.requestSheetActionTabName);
    let subject: string = actionSheet.getRange(Constants.emailSubjectAddress).getValue();
    //get first row which has email sent successfully as false upto last row
    let emailsPendingToSendStartRow: number = 2;
    let endRow = SheetUtils.getLastNonEmptyRowForColumn(emailSheet, "A");
    let emailDataRangeString = SheetUtils.buildRange(Constants.emailRequestIdColumn, emailsPendingToSendStartRow, Constants.emailSentStatusColumn, endRow);
    let emailData: string[][] = emailSheet.getRange(emailDataRangeString).getValues();

    for (let i: number = 0; i < emailData.length; i++) {
        //for each row, check that email is not sent
        if (emailData[i][Constants.getEmailSentStatusColumn()] === "" || emailData[i][Constants.getEmailSentStatusColumn()] === "No") {
            let requestId = emailData[i][0];
            //pick template based on initial check + city response, requestor's email id, subject
            let toEmailAddress = emailData[i][Constants.getEmailRequestorEmailAddressColumnIndex()];
            let toName = emailData[i][Constants.getEmailRequestorNameColumnIndex()];
            let initialCheckString = emailData[i][Constants.getEmailInitialCheckColumnIndex()];
            let cityStatusString = emailData[i][Constants.getEmailCityStatusColumnIndex()];
            let messageBody = getTemplate(initialCheckString, cityStatusString);
            //send mail
            sendEmail(subject, toEmailAddress, messageBody);
            //set final status and request closure date
            let currentRowNumber: number = i + 1;
            let emailSentStatusRangeString: string = SheetUtils.buildRange(Constants.requestClosureDateColumn, currentRowNumber, Constants.requestClosureDateColumn, currentRowNumber);
            console.log("emailSentStatusRangeString= " + emailSentStatusRangeString);
            emailSheet.getRange(emailSentStatusRangeString).setValue("Yes");
            let rowNumberInMasterSheet = RequestUtils.getRowNumberInMasterSheet(Number.parseInt(requestId));
            let requestClosureDateRangeString: string = SheetUtils.buildRange(Constants.requestClosureDateColumn, rowNumberInMasterSheet, Constants.requestClosureDateColumn, rowNumberInMasterSheet);
            console.log("requestClosureDateRangeString= " + requestClosureDateRangeString);
            let requestClosureStatusRangeString: string = SheetUtils.buildRange(Constants.requestFinalStatusColumn, rowNumberInMasterSheet, Constants.requestFinalStatusColumn, rowNumberInMasterSheet);
            console.log("requestClosureStatusRangeString= " + requestClosureStatusRangeString);
            requestsSheet.getRange(requestClosureStatusRangeString).setValue("Closed");
            requestsSheet.getRange(requestClosureDateRangeString).setValue(new Date());
        }
    }
}

function sendEmailToCity(): void {
    let actionSheet = SpreadsheetApp.getActive().getSheetByName(Constants.requestSheetActionTabName);
    //check flag
    let flag: string = actionSheet.getRange(Constants.sendToCityEmailFlagAddress).getValue();
    if (flag === "No") {
        return;
    }
}

function sendEmail(subject: string, toEmailAddress: string, message: string) {
    MailApp.sendEmail(toEmailAddress, subject, message);
}

function getTemplate(initialCheckString: string, cityResponseString: string): string {
    if (initialCheckString === InitialCheckRequestStatus.rejected) {
        return Templates.rejected;
    }
    if (initialCheckString === InitialCheckRequestStatus.incompleteInformation) {
        return Templates.incompleteInformation;
    }
    if (cityResponseString === CityRequestStatus.notPossible) {
        return Templates.notPossible;
    }
    if (cityResponseString === CityRequestStatus.completed) {
        return Templates.completed;
    }
}

function getCityNotificationTemplate(): string {
    return Templates.cityRequestNotification;
}