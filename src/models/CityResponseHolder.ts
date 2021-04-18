export class CityResponseHolder {
    public cityResponse: string;
    public wasContacted: string;
    public tentativeClosureDate: Date;

    constructor(cityResponseInput: string, wasContactedInput: string, tentativeClosureDate: Date) {
        this.cityResponse = cityResponseInput;
        this.wasContacted = wasContactedInput;
        this.tentativeClosureDate=tentativeClosureDate;
    }
}