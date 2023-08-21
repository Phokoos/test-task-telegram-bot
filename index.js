require("dotenv").config()
const express = require("express")
const bodyParser = require("body-parser")
const axios = require("axios")
const mongoose = require("mongoose")
const { addUser } = require("./controllers/users")

// Telegram Part
const { TOKEN, SERVER_URL, DB_HOST } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`
const URI = `/webhook/${TOKEN}`
const WEBHOOK_URL = (SERVER_URL + URI)

const app = express()
app.use(bodyParser.json())

const init = async () => {
	const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`)
	console.log(res.data)
}

app.post(URI, async (req, res) => {
	console.log(req.body)

	const chatId = req.body.message.chat.id
	const text = req.body.message.text
	const userName = req.body.message.from.first_name
	const userId = req.body.message.from.id

	const newUser = await addUser({
		name: userName,
		telegramId: userId
	})
	console.log(newUser);

	if (text === "/start") {
		await axios.post(`${TELEGRAM_API}/sendMessage`, {
			chat_id: chatId,
			text: `Hello ${userName}`
		})
	}

	return res.send()
})

// app.listen(process.env.PORT || 5000, async () => {
// 	console.log("App running on port: ", process.env.PORT || 5000)
// 	await init();
// })

// DataBase Part
// mongoose.connect(DB_HOST).
// 	then(() => console.log("Database success connect"))
// 	.catch(error => console.log(error))
module.exports = { app, init }