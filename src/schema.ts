
export type WeatherDataSource = "eth" | "lora" | "wifi" | "cellular";

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
    windSpeed: [number];
    windDirection: [string];
    air: [{
        temperature: [number];
        humidity: [number];
    }];
}

export type WeatherData = {
    timestamp: number;
    location: Location;
    source: WeatherDataSource;
    data: WeatherRecord[];
}

export type PartialPacket = {
    currentPos: number;
    totalLength: number;
    message: string;
}