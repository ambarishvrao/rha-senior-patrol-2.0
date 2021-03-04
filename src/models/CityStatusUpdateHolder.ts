export class CityStatusUpdateHolder {
    public city: string;
    public sentToCity: string;
    public cityResponse: string;

    public CityStatusUpdateHolder(cityInput: string, sentToCityInput: string, cityResponseInput: string): void {
        this.city = cityInput;
        this.sentToCity = sentToCityInput;
        this.cityResponse = cityResponseInput;
    }
}