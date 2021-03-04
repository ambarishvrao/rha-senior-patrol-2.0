export class CityResponseHolder {
    public cityResponse: string;
    public wasContacted: string;

    constructor(cityResponseInput: string, wasContactedInput: string) {
        this.cityResponse = cityResponseInput;
        this.wasContacted = wasContactedInput;
    }
}