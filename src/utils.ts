import { WeatherData } from "./schema";


export function unzipWeatherData(data: any): WeatherData {
    let message = JSON.stringify(data);
    message = message.replace(/'/g, '"');
    message = message.replace(/"ts"/g, '"timestamp"');
    message = message.replace(/"ws"/g, '"windSpeed"');
    message = message.replace(/"wd"/g, '"windDirection"');
    message = message.replace(/"t"/g, '"temperature"');
    message = message.replace(/"h"/g, '"humidity"');
    message = message.replace(/"loc"/g, '"location"');
    message = message.replace(/"rcs"/g, '"records"');
    message = message.replace(/"a"/g, '"air"');

    let weatherData = JSON.parse(message) as WeatherData;
    return weatherData;
}