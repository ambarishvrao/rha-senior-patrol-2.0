export class Utils {
    public static isNull(object: any): boolean {
        return object === null || object === undefined;
    }
    public static getLastCellOfColumn(sheet: GoogleAppsScript.Spreadsheet.Sheet, columnRangeString: string) {
        let valuesInColumn = sheet.getRange(columnRangeString).getValues();
        return valuesInColumn.filter(function(valueInColumn){
            return valueInColumn.length === 1 && valueInColumn[0] != ""
        }).length;
    }

    public static getLastCellOfRow(sheet: GoogleAppsScript.Spreadsheet.Sheet, columnRangeString: string) {
        let valuesInRow = sheet.getRange(columnRangeString).getValues();
        return valuesInRow[0].filter(function(valueInColumn){
            return valueInColumn != ""
        }).length;
    }

    public static getMaximum(a: number, b: number) {
        if (a > b) {
            return a;
        }
        return b;
    }

    public static getMinimum(a: number, b: number) {
        if (a < b) {
            return a;
        }
        return b;
    }

    public static getCharacterAfterIncrementingBy(prevChar: string, incrementBy: number) {
        let columnNumber = Utils.letterToColumn(prevChar);
        var nextCode = columnNumber + incrementBy;
        return Utils.columnToLetter(nextCode);
    }

    public static columnToLetter(column: number): string {
        let temp: number, letter: string = '';
        while (column > 0) {
            temp = (column - 1) % 26;
            letter = String.fromCharCode(temp + 65) + letter;
            column = (column - temp - 1) / 26;
        }
        return letter;
    }

    public static letterToColumn(letter: string): number {
        let column = 0, length = letter.length;
        for (var i = 0; i < length; i++) {
            column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
        }
        return column;
    }

    public static getOrdinalSuffix(dayOfMonth: number): string {
        if (dayOfMonth >= 11 && dayOfMonth <= 13) {
            return "th";
        }
        switch (dayOfMonth % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    }

    public static getJsonForMap(map: Map<string, string[][]>) {
        let jsonObject = {};
        map.forEach((value, key) => {
            jsonObject[key] = value
        });
        return JSON.stringify(jsonObject);
    }

    //this is not working!? why?
    public static getJsonObject(map: any) {
        return JSON.stringify(map);
    }

    public static arrayContainsValue(array: any[][], columnIndex: number, valueToBeFound: number): boolean {
        if (Utils.isNull(array) || array.length === 0) {
            return false;
        }
        let found: boolean = false;
        for (let i: number = 0; i < array.length; i++) {
            if (array[i][columnIndex] === valueToBeFound) {
                return true;
            }
        }
        return false;
    }
}
