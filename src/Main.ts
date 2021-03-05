import { Constants } from "./Constants";
import { Utils } from "./utils/Utils";
import { SheetUtils } from "./utils/SheetUtils";
import { RequestMapHolder } from "./models/RequestMapHolder";
import { CityRequestStatus } from "./CityRequestStatus";
import { CityStatusUpdateHolder } from "./models/CityStatusUpdateHolder";
import { StringUtils } from "./utils/StringUtils";
import { RequestUtils } from "./utils/RequestUtils";
import { CityResponseHolder } from "./models/CityResponseHolder";

function syncRequestsToCities(): void {
    console.log("syncRequestsToCities= " + new Date().toISOString());
    syncRequestsToCitiesPeriodically(false);
}

function syncRequestStatusesFromCities(): void {
    console.log("syncRequestStatusesFromCities= " + new Date().toISOString());
    syncRequestStatusesFromCitiesPeriodically();
}

//let us keep this every hour at 05 minute mark?
function syncRequestsToCitiesPeriodically(forceSync: boolean): void {
    let actionSheet = SpreadsheetApp.getActive().getSheetByName(Constants.requestSheetActionTabName);
    let requestsSheet = SpreadsheetApp.getActive().getSheetByName(Constants.requestSheetTabName);
    let emailsSheet = SpreadsheetApp.getActive().getSheetByName(Constants.requestSheetEmailsTabName);
    if (Utils.isNull(actionSheet)) {
        return;
    }
    let startRow: number = 2;
    let lastSyncedId: number = 0;
    let requestEndRow: number = SheetUtils.getLastNonEmptyRowForColumn(requestsSheet, "B");
    if (startRow > requestEndRow) {
        return;
    }
    let requestData: string[][] = requestsSheet.getRange(SheetUtils.buildRange(Constants.requestStartCellColumn, startRow, Constants.requestSentToCityColumn, requestEndRow)).getValues();
    let maxSyncedIdInCurrentSyncOperation: number = lastSyncedId;
    if (requestData.length > 0) {
        let citySetOfRequestsMap: Map<string, string[][]>;
        citySetOfRequestsMap = formCityWiseMapFromRequestsArray(requestData);
        //send requests which are accepted, and not sent
        let requestHolder: RequestMapHolder = copyRequestsToCitySheets(citySetOfRequestsMap);
        if (!Utils.isNull(requestHolder)) {
            //iterate over successes, set status as sent to city
            if (requestHolder.successfulCityRequests.size > 0) {
                requestHolder.successfulCityRequests.forEach((currentCityRequests: string[][], currentCity: string) => {
                    if (currentCityRequests.length > 0) {
                        for (let i: number = 0; i < currentCityRequests.length; i++) {
                            let syncedId = setRequestSentToCityInMasterSheet(requestsSheet, currentCityRequests[i], true);
                            if (syncedId > maxSyncedIdInCurrentSyncOperation) {
                                maxSyncedIdInCurrentSyncOperation = syncedId;
                            }
                        }
                    }
                });
            }
            //iterate over failures, set status as failed, send communication to requestor
            if (requestHolder.failedCityRequests.size > 0) {
                requestHolder.failedCityRequests.forEach((currentCityRequests: string[][], currentCity: string) => {
                    if (currentCityRequests.length > 0) {
                        for (let i: number = 0; i < currentCityRequests.length; i++) {
                            let syncedId = setRequestSentToCityInMasterSheet(requestsSheet, currentCityRequests[i], false);
                            syncedId = setRequestCityResponse(requestsSheet, currentCityRequests[i], CityRequestStatus.notApplicable);
                            addRequestToEmailsTab(emailsSheet, currentCityRequests[i]);
                            if (syncedId > maxSyncedIdInCurrentSyncOperation) {
                                maxSyncedIdInCurrentSyncOperation = syncedId;
                            }
                        }
                    }
                });
            }
        }
        //set last synced id! -> NOT USED ANYMORE!
        //actionSheet.getRange(Constants.lastSyncedIdForMasterToCityAddress).setValue(maxSyncedIdInCurrentSyncOperation);
    }
    console.log("periodic sync complete at " + new Date().toISOString() + " with last synced id= " + maxSyncedIdInCurrentSyncOperation);
}

function formCityWiseMapFromRequestsArray(requestData: string[][]): Map<string, string[][]> {
    let citySetOfRequestsMap: Map<string, string[][]> = new Map();
    for (let i = 0; i < requestData.length; i++) {
        let currentRequest: string[] = requestData[i];
        let currentRequestCity: string = currentRequest[Constants.getCityIndex()];
        if (!citySetOfRequestsMap.has(currentRequestCity)) {
            citySetOfRequestsMap.set(currentRequestCity, []);
        }
        let requestsInMapForCurrentCity = citySetOfRequestsMap.get(currentRequestCity);
        requestsInMapForCurrentCity.push(currentRequest);
        citySetOfRequestsMap.set(currentRequestCity, requestsInMapForCurrentCity);
    }
    return citySetOfRequestsMap;
}

function copyRequestsToCitySheets(citySetOfRequestsMap: Map<string, string[][]>): RequestMapHolder {
    let requestMapHolder: RequestMapHolder = new RequestMapHolder();
    let failedCitySetOfRequestsMap: Map<string, string[][]> = new Map(), successfulCitySetOfRequestsMap: Map<string, string[][]> = new Map();
    let cityUrlsMap: Map<String, String> = getCityUrlsFromMaster();
    citySetOfRequestsMap.forEach((currentCityRequests: string[][], currentCity: string) => {
        if (Utils.isNull(currentCity) || currentCity === "") {
            return;
        }
        //get city sheet from city master sheet
        let citySpecificSheetUrl = cityUrlsMap.get(currentCity).toString();
        if (Utils.isNull(citySpecificSheetUrl)) {
            //add current city to failure map
            failedCitySetOfRequestsMap.set(currentCity, currentCityRequests);
            return;
        }
        let citySpecificSheet: GoogleAppsScript.Spreadsheet.Sheet = SpreadsheetApp.openById(citySpecificSheetUrl).getSheetByName(Constants.citySheetRequestTabName);
        if (Utils.isNull(citySpecificSheet)) {
            failedCitySetOfRequestsMap.set(currentCity, currentCityRequests);
            return;
        }

        //updated logic?
        //get ids already present in city sheet
        //if current id is not present in above array, then we add to the end
        //if current id is present in above array, we do nothing

        // this will not work! need to change logic to force push all requests!
        let lastRowInSheet: number = SheetUtils.getLastNonEmptyRowForColumn(citySpecificSheet, "B");

        //get last row + 1 range, and add requests which are accepted, and not sent, set status as "Pending" in city sheet

        let filteredCurrentCityRequests: string[][] = filterCityRequestsForAcceptedAndPending(currentCityRequests, Constants.getInitialCheckIndex(), Constants.initialCheckAcceptedString);

        let startRowInCitySpecificSheet: number = lastRowInSheet + 1, endRowInCitySpecificSheet = startRowInCitySpecificSheet + filteredCurrentCityRequests.length - 1;
        let cityRequestRangeString = SheetUtils.buildRange(Constants.citySheetStartCellColumn, startRowInCitySpecificSheet, Constants.citySheetEndCellColumn, endRowInCitySpecificSheet);

        let filteredCurrentCityFailedRequests: string[][] = filterInitialCheckFailedRequests(currentCityRequests, Constants.getInitialCheckIndex());
        console.log("city= " + currentCity + " cityRequestRangeString= " + cityRequestRangeString);
        console.log("currentCityRequests= " + filteredCurrentCityRequests);
        if (filteredCurrentCityRequests.length > 0) {
            citySpecificSheet.getRange(cityRequestRangeString).setValues(filteredCurrentCityRequests);
        }
        //add city to successfulCitySetOfRequestsMap or failedCitySetOfRequestsMap
        failedCitySetOfRequestsMap.set(currentCity, filteredCurrentCityFailedRequests);
        successfulCitySetOfRequestsMap.set(currentCity, filteredCurrentCityRequests);
    });
    requestMapHolder.failedCityRequests = failedCitySetOfRequestsMap;
    requestMapHolder.successfulCityRequests = successfulCitySetOfRequestsMap;
    return requestMapHolder;
}

function getCityUrlsFromMaster(): Map<String, String> {
    let cityUrlsMap: Map<String, String> = new Map();
    let sheet: GoogleAppsScript.Spreadsheet.Sheet = SpreadsheetApp.openById(Constants.citySheetMasterId).getSheetByName(Constants.citySheetMasterTabName);
    let values: string[][] = sheet.getRange(Constants.citySheetMasterTabRange).getValues();
    for (let i: number = 0; i < values.length; i++) {
        let city: string = values[i][Constants.getCitySheetMasterCityColumn()];
        let url: string = values[i][Constants.getCitySheetMasterSheetUrlColumn()];
        url = url.replace("https://docs.google.com/spreadsheets/d/", "");
        if (!Utils.isNull(city) && city !== "") {
            cityUrlsMap.set(city, url);
        }
    }
    return cityUrlsMap;
}

function filterInputArrayWithMatch(inputArray: string[][], index: number, stringToMatch): string[][] {
    let outputArray: string[][] = [];
    for (let i: number = 0; i < inputArray.length; i++) {
        if (inputArray[i][index] === stringToMatch) {
            outputArray.push(inputArray[i]);
        }
    }
    return outputArray;
}

function filterCityRequestsForAcceptedAndPending(inputArray: string[][], firstIndex: number, firstStringToMatch: string): string[][] {
    let outputArray: string[][] = [];
    for (let i: number = 0; i < inputArray.length; i++) {
        if (inputArray[i][firstIndex] === firstStringToMatch && (inputArray[i][Constants.getSendToCityIndex()] === "" || inputArray[i][Constants.getSendToCityIndex()] === "Pending")) {
            outputArray.push(inputArray[i].slice(0, Constants.getInitialCheckIndex()));
        }
    }
    return outputArray;
}

function filterInitialCheckFailedRequests(inputArray: string[][], index: number): string[][] {
    let outputArray: string[][] = [];
    for (let i: number = 0; i < inputArray.length; i++) {
        if (RequestUtils.isInitialCheckFailed(inputArray[i][index]) && inputArray[i][index] !== "") {
            outputArray.push(inputArray[i]);
        }
    }
    return outputArray;
}

function setRequestSentToCityInMasterSheet(requestsSheet: GoogleAppsScript.Spreadsheet.Sheet, currentCityRequest: string[], isSuccess: boolean): number {
    if (Utils.isNull(currentCityRequest)) {
        return 0;
    }
    let idToReturn = Number.parseInt(currentCityRequest[0]);
    let rowNumberForId: number = idToReturn + 1;
    let sentToCityRangeString: string = SheetUtils.buildRange(Constants.requestSentToCityColumn, rowNumberForId, Constants.requestSentToCityColumn, rowNumberForId);
    let valueToBeSet = "";
    if (isSuccess) {
        valueToBeSet = Constants.sentToCityValue;
    } else {
        valueToBeSet = Constants.sentToCityNAValue;
    }
    console.log("sentToCityRangeString= " + sentToCityRangeString + " valueToBeSet= " + valueToBeSet);
    requestsSheet.getRange(sentToCityRangeString).setValue(valueToBeSet);
    return idToReturn;
}

function setRequestCityResponse(requestsSheet: GoogleAppsScript.Spreadsheet.Sheet, currentCityRequest: string[], status: string): number {
    if (Utils.isNull(currentCityRequest)) {
        return 0;
    }
    let idToReturn = Number.parseInt(currentCityRequest[0]);
    let rowNumberForId: number = idToReturn + 1;
    let cityResponseRangeString: string = SheetUtils.buildRange(Constants.requestCityStatusColumn, rowNumberForId, Constants.requestCityStatusColumn, rowNumberForId);
    console.log("sentToCityRangeString= " + cityResponseRangeString + " valueToBeSet= " + status);
    requestsSheet.getRange(cityResponseRangeString).setValue(status);
    return idToReturn;
}

function addRequestToEmailsTab(emailsSheet: GoogleAppsScript.Spreadsheet.Sheet, currentCityRequest: string[]): number {
    if (Utils.isNull(currentCityRequest)) {
        return 0;
    }
    let idToReturn = Number.parseInt(currentCityRequest[0]);
    let lastRowInSheet: number = SheetUtils.getLastNonEmptyRowForColumn(emailsSheet, "B");
    let rowNumberToAddCurrentRequest = lastRowInSheet + 1;
    let requestEmailData: string[] = [currentCityRequest[0], currentCityRequest[Constants.getRequestorNameIndex()],currentCityRequest[Constants.getRequestorEmailAddressIndex()], currentCityRequest[Constants.getInitialCheckIndex()], currentCityRequest[Constants.getRequestCityStatusColumn()]];
    let valuesToSetToSheet: string[][] = [];
    valuesToSetToSheet.push(requestEmailData);
    let cityResponseRangeString: string = SheetUtils.buildRange(Constants.emailRequestIdColumn, rowNumberToAddCurrentRequest, Constants.emailRequestCityStatusColumn, rowNumberToAddCurrentRequest);
    console.log("sentToCityRangeString= " + cityResponseRangeString + " valueToBeSet= " + valuesToSetToSheet);
    emailsSheet.getRange(cityResponseRangeString).setValues(valuesToSetToSheet);
    return idToReturn;
}

//let us keep this every hour at 20 minute mark?
function syncRequestStatusesFromCitiesPeriodically(): void {
    //get last requestId in the "requests" sheet
    let requestsSheet = SpreadsheetApp.getActive().getSheetByName(Constants.requestSheetTabName);
    let emailSheet = SpreadsheetApp.getActive().getSheetByName(Constants.requestSheetEmailsTabName);
    let lastRowNumber: number = SheetUtils.getLastNonEmptyRowForColumn(requestsSheet, Constants.requestTimestampColumn);
    //form vertical arrays for requestId, sentToCity, cityResponse
    let requestIds: string[][] = requestsSheet.getRange(SheetUtils.buildRange(Constants.requestStartCellColumn, Constants.requestStartCellRow, Constants.requestStartCellColumn, lastRowNumber)).getValues();
    let cities: string[][] = requestsSheet.getRange(SheetUtils.buildRange(Constants.requestCityColumn, Constants.requestStartCellRow, Constants.requestCityColumn, lastRowNumber)).getValues();
    let sentToCityStatuses: string[][] = requestsSheet.getRange(SheetUtils.buildRange(Constants.requestSentToCityColumn, Constants.requestStartCellRow, Constants.requestSentToCityColumn, lastRowNumber)).getValues();
    let cityResponses: string[][] = requestsSheet.getRange(SheetUtils.buildRange(Constants.requestCityStatusColumn, Constants.requestStartCellRow, Constants.requestCityStatusColumn, lastRowNumber)).getValues();
    let requestsToCheckForStatusUpdates: Set<number> = new Set();
    let cityRequestIdMap: Map<string, Set<number>> = new Map();
    //iterating over id array, find open requests, group array into a map with key: city value: set of request ids
    for (let i: number = 0; i < requestIds.length; i++) {
        if (StringUtils.isNotBlank(requestIds[i][0].toString())) {
            if (StringUtils.isNotBlank(sentToCityStatuses[i][0].toString()) && RequestUtils.isRequestSentToCity(sentToCityStatuses[i][0].toString()) && RequestUtils.isOpen(cityResponses[i][0].toString())) {
                let currentCity: string = cities[i][0].toString();
                if (!cityRequestIdMap.has(currentCity)) {
                    cityRequestIdMap.set(currentCity, new Set());
                }
                let existingSet: Set<number> = cityRequestIdMap.get(currentCity);
                existingSet.add(Number.parseInt(requestIds[i][0].toString()))
                cityRequestIdMap.set(currentCity, existingSet);
            }
        }
    }
    console.log("cityRequestIdMap= " + Utils.getJsonObject(cityRequestIdMap));
    //iterate over each key in map, fetch latest status from city sheet, and set in master if it has changed. set changed date based on certain status transitions.
    let citySheetUrlsMap: Map<String, String> = getCityUrlsFromMaster();
    let cityRequestStatusMap: Map<string, Map<number, CityResponseHolder>> = new Map();
    cityRequestIdMap.forEach((setOfRequestIdsForCity: Set<number>, currentCity: string) => {
        let citySpecificSheetUrl = citySheetUrlsMap.get(currentCity).toString();
        let citySpecificSheet: GoogleAppsScript.Spreadsheet.Sheet = SpreadsheetApp.openById(citySpecificSheetUrl).getSheetByName(Constants.citySheetRequestTabName);
        setOfRequestIdsForCity.forEach((requestId: number) => {
            //get last row in city sheet
            let lastRowNumber = SheetUtils.getLastNonEmptyRowForColumn(citySpecificSheet, Constants.requestStartCellColumn);
            //get ids array from city specific sheet
            let citySpecificIdsRangeString = SheetUtils.buildRange(Constants.requestStartCellColumn, Constants.requestStartCellRow, Constants.requestStartCellColumn, lastRowNumber);
            let citySpecificIds: string[][] = citySpecificSheet.getRange(citySpecificIdsRangeString).getValues();
            //figure out which row has the current requestId
            let rowNumber = figureOutRowNumberForGivenRequestId(citySpecificIds, requestId);
            if (rowNumber !== -1) {
                //build range
                let cityRequestStatusRangeString = SheetUtils.buildRange(Constants.citySheetRequestStatusColumn, rowNumber, Constants.citySheetRequestStatusColumn, rowNumber);
                let cityRequestContactedRangeString = SheetUtils.buildRange(Constants.citySheetRequestContactedColumn, rowNumber, Constants.citySheetRequestContactedColumn, rowNumber);
                //pull status
                let requestStatus: string = citySpecificSheet.getRange(cityRequestStatusRangeString).getValue();
                let requestContacted: string = citySpecificSheet.getRange(cityRequestContactedRangeString).getValue();
                if (!cityRequestStatusMap.has(currentCity)) {
                    cityRequestStatusMap.set(currentCity, new Map());
                }
                let existingCityRequestStatusMap: Map<number, CityResponseHolder> = cityRequestStatusMap.get(currentCity);
                if (Utils.isNull(existingCityRequestStatusMap)) {
                    existingCityRequestStatusMap = new Map();
                }
                let cityResponseHolder: CityResponseHolder = new CityResponseHolder(requestStatus, requestContacted);
                existingCityRequestStatusMap.set(requestId, cityResponseHolder);
                cityRequestStatusMap.set(currentCity, existingCityRequestStatusMap);
            }
        });
    });
    console.log("cityRequestStatusMap= " + cityRequestStatusMap);
    cityRequestStatusMap.forEach((currentCityRequestStatuses: Map<number, CityResponseHolder>, city: string) => {

        currentCityRequestStatuses.forEach((cityResponseHolder: CityResponseHolder, requestId: number) => {
            //figure out which row has the current requestId
            let rowNumber = RequestUtils.getRowNumberInMasterSheet(requestId);
            //build range
            let cityRequestStatusRangeString = SheetUtils.buildRange(Constants.requestCityStatusColumn, rowNumber, Constants.requestCityStatusColumn, rowNumber);
            let cityRequestContactedRangeString = SheetUtils.buildRange(Constants.requestCityContactedColumn, rowNumber, Constants.requestCityContactedColumn, rowNumber);

            let existingStatus: string = requestsSheet.getRange(cityRequestStatusRangeString).getValue();

            requestsSheet.getRange(cityRequestContactedRangeString).setValue(cityResponseHolder.wasContacted);

            if (existingStatus !== cityResponseHolder.cityResponse) {
                console.log("UPDATED! requestId= " + requestId + " updatedStatus= " + cityResponseHolder.cityResponse);
                requestsSheet.getRange(cityRequestStatusRangeString).setValue(cityResponseHolder.cityResponse);
                captureDateBasedOnStatusTransition(requestsSheet, rowNumber, existingStatus, cityResponseHolder.cityResponse, emailSheet);
            } else {
                console.log("SAME STATUS! requestId= " + requestId + " updatedStatus= " + cityResponseHolder.cityResponse);
            }
        });
    });
}

function figureOutRowNumberForGivenRequestId(requestIds: string[][], requestIdToSearch: number): number {
    let outputIndex: number = -1;
    for (let i: number = 0; i < requestIds.length; i++) {
        if (requestIds[i][0].toString() === requestIdToSearch.toString() && requestIds[i][0] != "") {
            return i + 2;
        }
    }
    return outputIndex;
}

function captureDateBasedOnStatusTransition(requestsSheet: GoogleAppsScript.Spreadsheet.Sheet, rowNumber: number, existingStatus: string, updatedStatus: string, emailsSheet: GoogleAppsScript.Spreadsheet.Sheet): void {
    if (updatedStatus === existingStatus) {
        return;
    }
    if (RequestUtils.isClosed(updatedStatus)) {
        //set city side request closure date
        let cityRequestClosureDateRangeString = SheetUtils.buildRange(Constants.requestCityClosureDateColumn, rowNumber, Constants.requestCityClosureDateColumn, rowNumber);
        requestsSheet.getRange(cityRequestClosureDateRangeString).setValue(new Date());
        let entireRequest: string[][] = requestsSheet.getRange(SheetUtils.buildRange(Constants.requestStartCellColumn, rowNumber, Constants.requestCityClosureDateColumn, rowNumber)).getValues();
        addRequestToEmailsTab(emailsSheet, entireRequest[0]);
    }
    if (updatedStatus != "" && RequestUtils.isOpen(updatedStatus)) {
        //set city side request acceptance date if not set already
        let cityRequestAcceptanceDateRangeString = SheetUtils.buildRange(Constants.requestCityAcceptanceDateColumn, rowNumber, Constants.requestCityAcceptanceDateColumn, rowNumber);
        let targetRange: GoogleAppsScript.Spreadsheet.Range = requestsSheet.getRange(cityRequestAcceptanceDateRangeString);
        if (targetRange.getValue() === "") {
            targetRange.setValue(new Date());
        }
    }
}