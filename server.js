require("dotenv").config()
const mongoose = require("mongoose")
const { app, init } = require('./index');
const { initTrelloWebhook, deleteTrelloWebhook } = require("./api/webhookTrello");

const { DB_HOST, PORT } = process.env;

//! Renew telegram webhook every 10 minutes
setInterval(async () => {
	await init();
}, 600000);

//! Renew trello webhook every hour
setInterval(async () => {
	try {
		await initTrelloWebhook();
	} catch (error) {
		console.log("Error in start trello webhook: ", error.message);
	}
}, 3600000);

//! DataBase Part
mongoose.connect(DB_HOST).
	then(async () => {
		console.log("Database success connect");
		app.listen(process.env.PORT || 5000, async () => {
			console.log("App running on port: ", process.env.PORT || 5000)
			await init();
			try {
				await initTrelloWebhook();
			} catch (error) {
				console.log(error);
				console.log("Error in start trello webhook: ", error.message);
			}
			//! Stop Trello Webhook for developer mode
			// await deleteTrelloWebhook();
		})
	})
	.catch(error => {
		console.log(error)
		process.exit(1)
	})
