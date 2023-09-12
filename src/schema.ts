

export type WeatherStation = {
    id: string;
    name: string;
    location?: Location;
    lastUpdate: number;
    lastWeatherData?: WeatherData;
}

export type Location = {
    lat: number;
    lon: number;
}

export type WeatherRecord = {
    windSpeed: number;
    windDirection: string;
    temperature: number;
    humidity: number;
}

export type WeatherData = {
    timestamp: number;
    location: Location;
    records: WeatherRecord[];
}
