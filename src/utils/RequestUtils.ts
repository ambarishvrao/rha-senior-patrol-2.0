import { CityRequestStatus } from "../CityRequestStatus";
import { Constants } from "../Constants";
import { InitialCheckRequestStatus } from "../models/InitialCheckRequestStatus";

export class RequestUtils {

    public static requestOpenStatuses: string[] = [CityRequestStatus.inProcess, CityRequestStatus.accepted, ""];
    public static requestInitialCheckFailedStatuses: string[] = [InitialCheckRequestStatus.rejected, InitialCheckRequestStatus.incompleteInformation];
    public static requestClosedStatuses: string[] = [CityRequestStatus.notApplicable, CityRequestStatus.notPossible, CityRequestStatus.notRequired, CityRequestStatus.otherChanelPartner, CityRequestStatus.completed];

    public static isRequestSentToCity(sentToCityStatus: string): boolean {
        if (sentToCityStatus === Constants.sentToCityValue) {
            return true;
        }
        return false;
    }

    public static isOpen(cityResponse: string): boolean {
        if (this.requestOpenStatuses.filter(a => a === cityResponse).length > 0) {
            return true;
        }
        return false;
    }

    public static isClosed(cityResponse: string): boolean {
        if (this.requestClosedStatuses.filter(a => a === cityResponse).length > 0) {
            return true;
        }
        return false;
    }

    public static isInitialCheckFailed(initialCheckString:string):boolean{
        if (this.requestInitialCheckFailedStatuses.filter(a => a === initialCheckString).length > 0) {
            return true;
        }
        return false;
    }

    public static getRowNumberInMasterSheet(requestId: number): number {
        return requestId + 1;
    }
}