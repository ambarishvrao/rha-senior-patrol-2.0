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
            if (toEmailAddress !== "" && toEmailAddress.indexOf("@") > 0 && isValidEmailAddress(toEmailAddress)) {
                sendEmail(subject, toEmailAddress, messageBody);
            }
            //set final status and request closure date
            let currentRowNumber: number = i + 2;
            let emailSentStatusRangeString: string = SheetUtils.buildRange(Constants.emailSentStatusColumn, currentRowNumber, Constants.emailSentStatusColumn, currentRowNumber);
            //console.log("emailSentStatusRangeString= " + emailSentStatusRangeString);
            emailSheet.getRange(emailSentStatusRangeString).setValue("Yes");
            let emailSentDateRangeString: string = SheetUtils.buildRange(Constants.emailSentDateColumn, currentRowNumber, Constants.emailSentDateColumn, currentRowNumber);
            //console.log("emailSentStatusRangeString= " + emailSentDateRangeString);
            emailSheet.getRange(emailSentDateRangeString).setValue(new Date());
            let rowNumberInMasterSheet = RequestUtils.getRowNumberInMasterSheet(Number.parseInt(requestId));
            let requestClosureDateRangeString: string = SheetUtils.buildRange(Constants.requestClosureDateColumn, rowNumberInMasterSheet, Constants.requestClosureDateColumn, rowNumberInMasterSheet);
            //console.log("requestClosureDateRangeString= " + requestClosureDateRangeString);
            let requestClosureStatusRangeString: string = SheetUtils.buildRange(Constants.requestFinalStatusColumn, rowNumberInMasterSheet, Constants.requestFinalStatusColumn, rowNumberInMasterSheet);
            //console.log("requestClosureStatusRangeString= " + requestClosureStatusRangeString);
            requestsSheet.getRange(requestClosureStatusRangeString).setValue("Closed");
            requestsSheet.getRange(requestClosureDateRangeString).setValue(new Date());
            console.log("Request id= " + requestId + " sent email successfully to " + toEmailAddress);
        }
    }
}

function isValidEmailAddress(toEmailAddress:string):boolean{
    let regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    let isValid = regexp.test(toEmailAddress);
    return isValid;
}

function sendEmail(subject: string, toEmailAddress: string, message: string) {
    MailApp.sendEmail(toEmailAddress, subject, message);
}

function getTemplate(initialCheckString: string, cityResponseString: string): string {
    //empty initial check string means that senior citizen is not living alone
    if (initialCheckString === InitialCheckRequestStatus.rejected || initialCheckString === "") {
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