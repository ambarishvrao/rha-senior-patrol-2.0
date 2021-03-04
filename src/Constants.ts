import { SheetUtils } from "./utils/SheetUtils";

type HorizontalAlign = "left" | "center" | "normal" | null;
type VerticalAlign = "top" | "middle" | "bottom" | null;

export class Constants {
    public static imageURL: string = "https://yt3.ggpht.com/ytc/AAUvwng9e7Pb7gTIqH1IosOpgVnzkMbv9BRPqEiy71L1=s88-c-k-c0x00ffffff-no-rj";

    public static lastSyncedIdForMasterToCityAddress: string = "I2";
    public static lastSyncedIdFromCityToMasterAddress: string = "I15";

    //Copy Column A as well, as it is reserved for IDs

    public static requestSheetTabName: string = "requests";
    public static requestSheetActionTabName: string = "actions";
    public static requestStartCellColumn:string = "A";
    public static requestTimestampColumn:string = "B";
    public static requestStartCellRow:number = 2;
    public static requestCityColumn:string = "K";
    public static requestEndCellColumn:string = "P";
    public static requestInitialCheckColumn:string = "Q";
    public static requestSentToCityColumn:string = "S";
    public static requestCityStatusColumn:string = "T";
    public static requestCityContactedColumn: string = "V";
    public static requestFinalStatusColumn:string = "U";
    public static requestCityAcceptanceDateColumn:string = "X";
    //closure from city side
    public static requestCityClosureDateColumn:string = "Y";

    //closure from Senior patrol side, as we might have emails etc to send
    public static requestClosureDateColumn:string = "X";

    public static citySheetMasterId:string = "1u_786Au1bLu_XtwrqVwNhgCbqSgaNNKF-saxaCZKvK0";
    public static citySheetMasterTabName: string = "Sheet1";
    public static citySheetMasterCityColumn: string = "A";
    public static citySheetMasterSheetUrlColumn: string = "B";
    public static citySheetMasterTabRange: string = "A2:B300";

    public static sentToCityValue: string = "Sent";
    public static sentToCityNAValue: string = "NA";

    public static initialCheckAcceptedString: string = "Accepted";

    public static citySheetRequestTabName: string = "requests";
    public static citySheetStartCellColumn: string = "A";
    public static citySheetRequestStatusColumn: string = "Q";
    public static citySheetRequestContactedColumn: string = "R";
    public static citySheetEndCellColumn: string = Constants.requestEndCellColumn;

    public static cityBirdsEyeViewSheetId: string = "1R04ZVH3go57NcNuLnfO0YDWaYlkTjAnpzEToD1cIKbU";
    public static cityBirdsEyeViewTabName: string = "Consolidated Data";
    public static cityBirdsEyeViewRange: string = "A3:C300";

    public static getCityIndex():number{
        return SheetUtils.getIndexFromAlphabet(Constants.requestCityColumn);
    }

    public static getInitialCheckIndex():number{
        return SheetUtils.getIndexFromAlphabet(Constants.requestInitialCheckColumn);
    }

    public static getSendToCityIndex():number{
        return SheetUtils.getIndexFromAlphabet(Constants.requestSentToCityColumn);
    }

    public static getCitySheetMasterCityColumn():number{
        return SheetUtils.getIndexFromAlphabet(Constants.citySheetMasterCityColumn);
    }

    public static getRequestCityStatusColumn():number{
        return SheetUtils.getIndexFromAlphabet(Constants.requestCityStatusColumn);
    }

    public static getRequestFinalStatusColumn():number{
        return SheetUtils.getIndexFromAlphabet(Constants.requestFinalStatusColumn);
    }

    public static getCitySheetMasterSheetUrlColumn():number{
        return SheetUtils.getIndexFromAlphabet(Constants.citySheetMasterSheetUrlColumn);
    }
}
