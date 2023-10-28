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
import { PartialPacket, WeatherData, WeatherDataSource } from "./schema";
import { WeatherStationManager } from "./managers/weatherStation";
import { unzipWeatherData } from "./utils";

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
		res.status(400).send({
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
	const source: string = req.query.source;
	const weatherData: WeatherData = unzipWeatherData(req.body);

	if (!stationId) {
		res.status(400).send({
			success: false,
			message: "Missing stationId",
		});
		return;
	}
	if (
		!weatherData ||
		weatherData.location === undefined ||
		!weatherData.data ||
		weatherData.data.length === 0
	) {
		res.status(400).send({
			success: false,
			message: "Missing weatherData",
		});
		return;
	}
	weatherData.source = source as WeatherDataSource;
	await WeatherDataManager.addWeatherData(stationId, weatherData);
	res.send({
		success: true,
		message: "OK",
	});
});

app.post("/weatherDataLora", async (req: any, res: any) => {
	let body = req.body;
	let payload = body.payload; // Payload in base64
	let payloadDecoded = Buffer.from(payload, "base64").toString("ascii"); // Payload in ascii
	// PayloadDecoded format: 0:91:8808:abcdefghijklmabcdefghijklmabcdefghij
	const currentPos = parseInt(
		payloadDecoded.substring(0, payloadDecoded.indexOf(":"))
	);
	payloadDecoded = payloadDecoded.substring(payloadDecoded.indexOf(":") + 1);
	const totalLength = parseInt(
		payloadDecoded.substring(0, payloadDecoded.indexOf(":"))
	);
	payloadDecoded = payloadDecoded.substring(payloadDecoded.indexOf(":") + 1);
	const stationId = payloadDecoded.substring(0, payloadDecoded.indexOf(":"));
	payloadDecoded = payloadDecoded.substring(payloadDecoded.indexOf(":") + 1);
	let message = payloadDecoded;

	// Message splited to multiple packets, need to wait for all packets and combine them
	let isReady: boolean = await WeatherStationManager.setPartialPacket(
		stationId,
		currentPos,
		totalLength,
		message
	);
	if (!isReady) {
		res.send({
			success: true,
			message: "OK",
		});
	} else {
		let packet: PartialPacket | undefined =
			await WeatherStationManager.getPartialPacket(stationId);
		if (!packet) {
			res.status(400).send({
				success: false,
				message: "Error",
			});
			return;
		}

		try {
			packet.message = packet.message.replace(/'/g, '"');
			let weatherData: WeatherData = unzipWeatherData(
				JSON.parse(packet.message)
			);
			weatherData.source = "lora";
			weatherData.timestamp = new Date().getTime();
			await WeatherDataManager.addWeatherData(stationId, weatherData);
		} catch (error) {
			console.log(error);
		}
		await WeatherStationManager.deletePartialPacket(stationId);
		res.send({
			success: true,
			message: "OK",
		});
	}
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
