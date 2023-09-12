import * as admin from "firebase-admin";
import { WeatherStation } from "../schema";
const firestore = admin.firestore();

export class WeatherStationManager {
	constructor() {}

	static async getWeatherStations(): Promise<WeatherStation[]> {
		const weatherStations = await firestore
			.collection("weatherStations")
			.get();

		return weatherStations.docs.map((doc) => doc.data() as WeatherStation);
	}

    static async getWeatherStation(id: string): Promise<WeatherStation | undefined> {
        const weatherStation = await firestore
            .collection("weatherStations")
            .doc(id)
            .get();

        if (!weatherStation.exists) {
            return undefined;
        }
        return weatherStation.data() as WeatherStation;
    }

    static async initializeWeatherStation(id: string) {
        let weatherStation = {
            id,
            name: "",
            location: undefined,
            lastUpdate: 0,
            lastWeatherData: undefined,
        } as WeatherStation;
        
        await firestore.collection("weatherStations").doc(id).set(weatherStation);
    }

    static async addWeatherStation(weatherStation: WeatherStation) {
        await firestore.collection("weatherStations").doc(weatherStation.id).set(weatherStation);
    }

    static async updateWeatherStation(weatherStation: WeatherStation) {
        await firestore.collection("weatherStations").doc(weatherStation.id).update(weatherStation);
    }

    static async deleteWeatherStation(id: string) {
        await firestore.collection("weatherStations").doc(id).delete();
    }
}
