import { Utils } from "./Utils";

export class SheetUtils {
    // @ts-check

    public static getLastNonEmptyRowByColumnArray(spreadSheet: GoogleAppsScript.Spreadsheet.Sheet): number {
        let column: GoogleAppsScript.Spreadsheet.Range = spreadSheet.getRange('A:A');
        var values = column.getValues(); // get all data in one call
        let ct: number = 0;
        while (values[ct] && values[ct][0] != "") {
            ct++;
        }
        return (ct);
    }

    public static getLastNonEmptyRowForColumn(spreadSheet: GoogleAppsScript.Spreadsheet.Sheet, columnString:string): number {
        let column: GoogleAppsScript.Spreadsheet.Range = spreadSheet.getRange(columnString+':'+columnString);
        var values = column.getValues(); // get all data in one call
        let ct: number = 0;
        while (values[ct] && values[ct][0] != "") {
            ct++;
        }
        return (ct);
    }

    public static mergeWithTopBlackBorderOnly(sheet: GoogleAppsScript.Spreadsheet.Sheet, a1Notation: string) {
        var rangeToMerge = sheet.getRange(a1Notation);
        rangeToMerge.merge().setBorder(true, false, false, false, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    }

    public static mergeWithSidesBlackBorderOnly(sheet: GoogleAppsScript.Spreadsheet.Sheet, a1Notation: string) {
        var rangeToMerge = sheet.getRange(a1Notation);
        rangeToMerge.merge().setBorder(true, true, true, true, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    }

    /**
     * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
     * @param {string} a1Notation
     */
    public static mergeWithoutBottomBlackBorderOnly(sheet: GoogleAppsScript.Spreadsheet.Sheet, a1Notation: string) {
        var rangeToMerge = sheet.getRange(a1Notation);
        rangeToMerge.merge().setBorder(true, true, false, true, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    }

    /**
     * @param {{ getNumRows: () => any; getNumColumns: () => any; getCell: (arg0: number, arg1: number) => any; }} range
     */
    public static setTextInBracketsToBold(range: GoogleAppsScript.Spreadsheet.Range) {
        const numRows = range.getNumRows();
        const numCols = range.getNumColumns();

        for (let i = 1; i <= numCols; i++) {
            for (let j = 1; j <= numRows; j++) {
                SheetUtils.customFormatForTextInBrackets(range.getCell(j, i));
            }
        }
    }

    public static customFormatForTextInBrackets(cell: GoogleAppsScript.Spreadsheet.Range) {
        var cellValue = cell.getValue();
        if (cellValue != null && cellValue != undefined) {
            var parenthesesStartIndex = cellValue.indexOf("(");
            var parenthesesEndIndex = cellValue.indexOf(")");
            if (parenthesesStartIndex >= 0 && parenthesesEndIndex >= 0) {
                var bold = SpreadsheetApp.newTextStyle().setBold(true).build();
                var normal = SpreadsheetApp.newTextStyle().setBold(false).build();
                var value = SpreadsheetApp.newRichTextValue()
                    .setText(cellValue)
                    .setTextStyle(0, parenthesesStartIndex, bold)
                    .setTextStyle(parenthesesStartIndex + 1, parenthesesEndIndex, normal)
                    .build();
                cell.setRichTextValue(value);
            }
        }
    }
    /**
    * This function does some really complicated stuff
    * 
    */
    public static customFormatForHyphenSeparatedText(cell: GoogleAppsScript.Spreadsheet.Range) {
        var cellValue: string = String(cell.getValue());
        if (cellValue != null && cellValue != undefined) {
            let startIndex: number = 0, boldStyleIndicesMap = new Map<number, number>();
            for (let i: number = 0; i < cellValue.length; i++) {
                if (cellValue.charAt(i) == '-') {
                    boldStyleIndicesMap.set(startIndex, i - 1);
                } else if (cellValue.charAt(i) == '\n') {
                    startIndex = i + 1;
                }
            }
            let bold = SpreadsheetApp.newTextStyle().setBold(true).build(), normal = SpreadsheetApp.newTextStyle().setBold(false).build();
            var richTextValueBuilder=SpreadsheetApp.newRichTextValue().setText(cellValue);
            boldStyleIndicesMap.forEach((value:number,key:number) =>{
                richTextValueBuilder.setTextStyle(key, value, bold);
            });
            var value = richTextValueBuilder.build();
            cell.setRichTextValue(value);
        }
    }

    /**
     * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
     * @param {string} range
     */
    public static clearFormatting(sheet: GoogleAppsScript.Spreadsheet.Sheet, range: string) {
        if (Utils.isNull(sheet) || Utils.isNull(range)) {
            return;
        }
        sheet.getRange(range).clearFormat();
    }

    /**
     * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
     * @param {string} range
     */
    public static clearSheet(sheet: GoogleAppsScript.Spreadsheet.Sheet, range: string) {
        if (Utils.isNull(sheet) || Utils.isNull(range)) {
            return;
        }
        sheet.getRange(range).clearContent();
    }

    /**
     * @param {string} startColumn
     * @param {number} startRow
     * @param {string} endColumn
     * @param {number} endRow
     */
    public static buildRange(startColumn: string, startRow: number, endColumn: string, endRow: number) {
        return startColumn + startRow + ":" + endColumn + endRow;
    }

    public static getIndexFromAlphabet(alphabet:string):number{
        return Utils.letterToColumn(alphabet)-1;
    }
}