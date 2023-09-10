import * as admin from 'firebase-admin';
import { WeatherData } from '../schema';
const firestore = admin.firestore();

export class WeatherDataManager {

    constructor() {

    }

    static async getWeatherData(stationId: string, from: number, to: number) {
        const weatherData = await firestore.collection('weatherData')
            .where('stationId', '==', stationId)
            .where('timestamp', '>=', from)
            .where('timestamp', '<=', to)
            .get();

        return weatherData.docs.map(doc => doc.data());
    }

    static async addWeatherData(stationId: string, weatherData: any) {
        await firestore.collection('weatherData').add({
            stationId,
            ...weatherData
        });
        await firestore.collection('weatherStations').doc(stationId).update({
            lastUpdate: (new Date()).getTime(),
            lastWeatherData: weatherData,
            location: weatherData.location
        });
    }
}