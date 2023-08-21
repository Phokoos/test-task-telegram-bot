require("dotenv").config()
const mongoose = require("mongoose")
const { app, init } = require('./index');
const { getAll, addUser, findOneByTelegramId } = require("./controllers/users");

const { DB_HOST, PORT } = process.env;

// DataBase Part
mongoose.connect(DB_HOST).
	then(async () => {
		console.log("Database success connect");
		app.listen(process.env.PORT || 5000, async () => {
			console.log("App running on port: ", process.env.PORT || 5000)
			await init();
		})
		// Test for read data
		const userById = await findOneByTelegramId("406757969");
		console.log(userById)
		// const data = await getAll()
		// console.log(data)

		// addUser({
		// 	name: "Mykola",
		// 	telegramId: "1qaz2wsx"
		// })
	})
	.catch(error => {
		console.log(error)
		process.exit(1)
	})
