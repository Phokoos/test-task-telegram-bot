require("dotenv").config()
const mongoose = require("mongoose")
const { app, init } = require('./index');
const { getAll, addUser, findOneByTelegramId } = require("./controllers/users");

const { DB_HOST, PORT } = process.env;


setInterval(async () => {
	await init();
}, 1000000);


// DataBase Part
mongoose.connect(DB_HOST).
	then(async () => {
		console.log("Database success connect");
		app.listen(process.env.PORT || 5000, async () => {
			console.log("App running on port: ", process.env.PORT || 5000)
			await init();
		})
	})
	.catch(error => {
		console.log(error)
		process.exit(1)
	})
