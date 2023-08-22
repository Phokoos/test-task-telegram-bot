require("dotenv").config()
const mongoose = require("mongoose")
const { app, init } = require('./index');
const { getAll, addUser, findOneByTelegramId } = require("./controllers/users");
const { initTrelloWebhook, deleteTrelloWebhook } = require("./api/webhookTrello");
const { findTrelloBoardMemberById } = require("./api/trelloApi");
const { addTrelloUser } = require("./controllers/trelloUsers");

const { DB_HOST, PORT } = process.env;


setInterval(async () => {
	await init();
}, 1000000);

// setInterval(async () => {
// 	await deleteTrelloWebhook();
// 	await initTrelloWebhook();
// }, 1000000);



// DataBase Part
mongoose.connect(DB_HOST).
	then(async () => {
		console.log("Database success connect");
		app.listen(process.env.PORT || 5000, async () => {
			console.log("App running on port: ", process.env.PORT || 5000)
			await init();
			// await deleteTrelloWebhook();
			// await initTrelloWebhook();
			//! Test part
			// const newUser = await findTrelloBoardMemberById()
			//  email, name, trelloId
			// const { email, fullName: name, id: trelloId } = newUser
			// console.log("Trello member: ", email);
			// console.log("Trello id: ", trelloId);
			// console.log("Trello fullName: ", name);
			// await addTrelloUser({ email, name, trelloId })
		})
	})
	.catch(error => {
		console.log(error)
		process.exit(1)
	})
