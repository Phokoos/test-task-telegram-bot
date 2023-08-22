require("dotenv").config()
const express = require("express")
const bodyParser = require("body-parser")
const axios = require("axios")
const mongoose = require("mongoose")
const { addUser, findOneByTelegramIdAndUpdateTrelloEmail } = require("./controllers/users")
const { addTrelloCard, findTrelloBoardMemberById } = require("./api/trelloApi")
const sendTelegramMessage = require("./api/telegram/telegramApi")
const { addTrelloUser, findUserAndPlusOneTask } = require("./controllers/trelloUsers")

// Telegram Part
const { TOKEN, SERVER_URL, DB_HOST, TRELLO_BOARD_ID } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`
const URI = `/webhook/${TOKEN}`
const URI_TRELLO = `/webhook/${TRELLO_BOARD_ID}`
const WEBHOOK_URL = (SERVER_URL + URI)

const app = express()
app.use(bodyParser.json())

const init = async () => {
	const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`)
	// const resUsers = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`)
	console.log(res.data)
}

app.post(URI, async (req, res) => {
	// console.log(req.body);
	const messageText = req.body.message.text
	const chatId = req.body.message.chat.id
	const text = req.body.message.text
	const userName = req.body.message.from.first_name
	const userId = req.body.message.from.id

	if (messageText.slice(0, 10) === '/addTrello') {
		const array = messageText.split(" ")
		const trelloUserName = array[1]
		const newUser = await findOneByTelegramIdAndUpdateTrelloEmail(userId, trelloUserName)
		if (newUser.trelloUserName) {
			// console.log("trello email: ", newUser.trelloEmail)
			await sendTelegramMessage(`Your account connected to Trello data with ${newUser.trelloUserName} user name!`)
		}
	}

	if (text === "/start") {
		const newUser = await addUser({
			name: userName,
			telegramId: userId
		})

		sendTelegramMessage(`Hello ${userName}`)

	}
	// ! Add list "In progress"
	// if (text === "/newTrelloListInProgress") {
	// 	const data = await addTrelloCard("InProgress")
	// 	const { id, name } = data;

	// 	await axios.post(`${TELEGRAM_API}/sendMessage`, {
	// 		chat_id: chatId,
	// 		text: `${userName} create list "${name}" with id: ${id}`
	// 	})
	// }
	// ! Add list "Done"
	// if (text === "/newTrelloListDone") {
	// 	const data = await addTrelloCard("Done")
	// 	const { id, name } = data;

	// 	await axios.post(`${TELEGRAM_API}/sendMessage`, {
	// 		chat_id: chatId,
	// 		text: `${userName} create list "${name}" with id: ${id}`
	// 	})
	// }

	return res.send()
})

app.post(URI_TRELLO, async (req, res) => {
	const actionType = req.body.action.display.translationKey
	console.log(actionType);
	// console.log(req.body);

	//! Part with add tasks
	if (actionType === 'action_member_joined_card' || actionType === 'action_added_member_to_card') {
		const newUserId = req.body.action.member.id
		const newUser = await findTrelloBoardMemberById(newUserId)

		const { username, fullName: name, id: trelloId } = newUser

		await findUserAndPlusOneTask({ username, name, trelloId })
	}

	//! Part with added trello user to DB 
	if (actionType === 'action_added_member_to_board') {
		const newUserId = req.body.action.member.id
		const newUser = await findTrelloBoardMemberById(newUserId)

		const { username, fullName: name, id: trelloId } = newUser

		const newUserFromTrelloBase = await addTrelloUser({ username, name, trelloId })
		// console.log(newUserFromTrelloBase);
	}
	//! Finished part with task moving
	// try {
	// 	const cardName = req.body.action.data.card.name;
	// 	const cardMover = req.body.action.memberCreator.fullName
	// 	const listBefore = req.body.action.data.listBefore.name
	// 	const listAfter = req.body.action.data.listAfter.name

	// 	if (req.body.action.type === "updateCard" && req.body.action.display.translationKey === "action_move_card_from_list_to_list") {
	// 		await sendTelegramMessage(`Користувач ${cardMover} перемістив карту "${cardName}" із колонки "${listBefore}" до колонки "${listAfter}!"`)
	// 	}
	// 	res.status(200).send()
	// } catch (error) {
	// 	console.log(error.message);
	// }

	res.status(200).send()
})

module.exports = { app, init }