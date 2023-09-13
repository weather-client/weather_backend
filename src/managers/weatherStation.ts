import * as admin from "firebase-admin";
import { PartialPacket, WeatherStation } from "../schema";
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

    static async setPartialPacket(stationId: string, currentPos: number, totalLength: number, message: string): Promise<boolean> {
        const tempPacket = await firestore.collection("tempPackets").doc(stationId).get();
        if (!tempPacket.exists) {
            // Prepare an empty message with full length
            let finalMessage = "";
            for (let i = 0; i < totalLength; i++) {
                finalMessage += " ";
            }
            // Set the message
            finalMessage = finalMessage.substr(0, currentPos) + message + finalMessage.substr(currentPos + message.length);

            await firestore.collection("tempPackets").doc(stationId).set({
                currentPos,
                totalLength,
                message,
            });
            if (currentPos + message.length === totalLength) {
                return true;
            }
            return false;
        } else {
            let packet = tempPacket.data();
            if (!packet) {
                return false;
            }
            // Get the message
            let finalMessage = packet.message;
            // Set the message
            finalMessage = finalMessage.substr(0, currentPos) + message + finalMessage.substr(currentPos + message.length);
            await firestore.collection("tempPackets").doc(stationId).update({
                currentPos,
                totalLength,
                message: finalMessage,
            });
            if (currentPos + message.length === totalLength) {
                return true;
            }
            return false;
        }
    }

    static async getPartialPacket(stationId: string): Promise<PartialPacket | undefined> {
        const tempPacket = await firestore.collection("tempPackets").doc(stationId).get();
        if (!tempPacket.exists) {
            return undefined;
        }
        return tempPacket.data() as PartialPacket;
    }

    static async deletePartialPacket(stationId: string) {
        await firestore.collection("tempPackets").doc(stationId).delete();
    }
}
