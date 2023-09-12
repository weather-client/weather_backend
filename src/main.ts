// Simple HTTP server
import express from "express";
import * as admin from "firebase-admin";
const serviceAccount = require("../serviceAccountKey.json");
const firebaseApp = admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL:
		"https://weather-station-elka-default-rtdb.europe-west1.firebasedatabase.app",
});
firebaseApp.firestore().settings({ ignoreUndefinedProperties: true });

import { WeatherDataManager } from "./managers/weatherData";
import { WeatherData } from "./schema";

const app = express();
app.use(express.json());
const port = 3000;

app.get("/", (req: any, res: any) => {
	res.send("Hello World!");
});

app.get("/weatherData", async (req: any, res: any) => {
	const stationId: string = req.query.stationId;
	const from = req.query.from || 0;
	const to = req.query.to || new Date().getTime();

	if (!stationId) {
		res.send({
			success: false,
			message: "Missing stationId",
		});
		return;
	}

	await WeatherDataManager.getWeatherData(stationId, from, to)
		.then((weatherData: any) => {
			res.send({
				success: true,
				message: "OK",
				data: weatherData,
			});
		})
		.catch((error: any) => {
			res.status(500);
			res.send({
				success: false,
				message: "Error",
				data: error,
			});
		});
});

app.post("/weatherData", async (req: any, res: any) => {
	const stationId: string = req.query.stationId;
	const weatherData: WeatherData = req.body;

	if (!stationId) {
		res.send({
			success: false,
			message: "Missing stationId",
		});
		return;
	}
	if (
		!weatherData ||
		weatherData.location === undefined ||
		!weatherData.records ||
		weatherData.records.length === 0
	) {
		res.send({
			success: false,
			message: "Missing weatherData",
		});
		return;
	}

	await WeatherDataManager.addWeatherData(stationId, weatherData);
	res.send({
		success: true,
		message: "OK",
	});
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
