import * as admin from "firebase-admin";
import { WeatherData } from "../schema";
import { WeatherStationManager } from "./weatherStation";
const firestore = admin.firestore();

export class WeatherDataManager {
	constructor() {}

	static async getWeatherData(stationId: string, from?: number, to?: number) {
        if (from === undefined) {
            from = 0;
        }
        if (to === undefined) {
            to = new Date().getTime();
        }
		const weatherData = await firestore
			.collection("weatherData")
			.where("stationId", "==", stationId)
			.where("timestamp", ">=", from)
			.where("timestamp", "<=", to)
			.get();
		return weatherData.docs.map((doc) => doc.data());
	}

	static async addWeatherData(stationId: string, weatherData: WeatherData) {
        if (await WeatherStationManager.getWeatherStation(stationId) === undefined) {
            await WeatherStationManager.initializeWeatherStation(stationId);
        }
		await firestore.collection("weatherData").add(Object.assign(weatherData, { stationId }));
		await firestore.collection("weatherStations").doc(stationId).update({
			lastUpdate: new Date().getTime(),
			lastWeatherData: weatherData,
			location: weatherData.location,
		});
	}
}
