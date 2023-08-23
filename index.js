require("dotenv").config()
const express = require("express")
const bodyParser = require("body-parser")
const axios = require("axios")
const mongoose = require("mongoose")
const { addUser, findOneByTelegramIdAndUpdateTrelloEmail, findOneByTelegramIdAndDelete, getAll } = require("./controllers/users")
const { addTrelloCard, findTrelloBoardMemberById, findTrelloCardById } = require("./api/trelloApi")
const sendTelegramMessage = require("./api/telegram/telegramApi")
const { addTrelloUser, findUserAndPlusOneTask, findUserAndMinisOneTask, findUserByTrelloIdAndDelete, findUserByTrelloUserNameInDB } = require("./controllers/trelloUsers")
const { getStatsAnswerController } = require("./controllers/telegramReq")

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
	console.log(res.data)
}

//! Work with telegram APIs
app.post(URI, async (req, res) => {
	// console.log(req.body);
	const messageText = req.body.message.text
	const chatId = req.body.message.chat.id
	const text = req.body.message.text
	const userName = req.body.message.from.first_name
	const userId = req.body.message.from.id

	//! Get stats logic
	try {
		if (text === '/stats') {
			await getStatsAnswerController()
			// const allUsers = await getAll()

			// await allUsers.forEach(async (user) => {
			// 	const userDataObj = {
			// 		name: user.name,
			// 		tasksCount: 0
			// 	}

			// 	if (user.trelloUserName !== "") {
			// 		const dataFromTrelloDB = await findUserByTrelloUserNameInDB(user.trelloUserName)
			// 		try {
			// 			userDataObj.tasksCount = dataFromTrelloDB.userTasks
			// 		} catch (error) {
			// 			console.log("Error in get write tasks data : ", error.message);
			// 		}
			// 	}
			// 	await sendTelegramMessage(`Користувач ${userDataObj.name} має в опрацюванні ${userDataObj.tasksCount} завдань.`)
			// })
		}
	} catch (error) {
		console.log("Error in get stats: ", error.message);
	}

	//! Left chat part
	try {
		if (req.body.message.left_chat_participant) {
			const telegramId = req.body.message.left_chat_participant.id;
			await findOneByTelegramIdAndDelete(telegramId)
		}
	} catch (error) {
		console.log("Error in left member chat: ", error.message);
	}

	try {
		if (req.body.message.new_chat_participant) {
			const newUserName = req.body.message.new_chat_participant.first_name;
			const newUserId = req.body.message.new_chat_participant.id;

			const newUser = await addUser({
				name: newUserName,
				telegramId: newUserId
			})
			res.status(200).send()
			return await sendTelegramMessage(`Added new user ${newUserName} to Database`)
		}
	} catch (error) {
		console.log("Error in new member in chat: ", error.message);
	}
	try {
		if (messageText.slice(0, 10) === '/addTrello') {
			const array = messageText.split(" ")
			const trelloUserName = array[1]
			const newUser = await findOneByTelegramIdAndUpdateTrelloEmail(userId, trelloUserName)
			if (newUser.trelloUserName) {
				await sendTelegramMessage(`Your account connected to Trello data with ${newUser.trelloUserName} user name!`)
			}
		}
	} catch (error) {
		console.log(error.message);
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

app.get(URI_TRELLO, async (req, res) => {
	res.status(200).send()
})

app.post(URI_TRELLO, async (req, res) => {
	const actionType = req.body.action.display.translationKey
	console.log(actionType);
	// console.log(req.body.action.data.card);
	// 64e50b5dfb220b4806b72b04
	//! Minus user task when delete card
	if (actionType === 'action_archived_card') {
		// console.log(req.body.action.data.card.id)
		const trelloCardId = req.body.action.data.card.id
		const deletedCard = await findTrelloCardById(trelloCardId)
		const usersArrayId = deletedCard.idMembers;
		usersArrayId.forEach(async id =>
		// console.log(id)
		{
			console.log(id)
			await findUserAndMinisOneTask({ trelloId: id })
		}
		)
		// idMembers
	}
	//! Remove user from board
	if (actionType === 'action_removed_from_board' || actionType === 'action_left_board') {
		const userId = req.body.action.member.id
		await findUserByTrelloIdAndDelete(userId)
	}

	//! Part with minus tasks
	if (actionType === 'action_member_left_card' || actionType === 'action_removed_member_from_card') {
		const newUserId = req.body.action.member.id
		const newUser = await findTrelloBoardMemberById(newUserId)

		const { username, fullName: name, id: trelloId } = newUser

		await findUserAndMinisOneTask({ username, name, trelloId })
	}

	//! Part with plus tasks
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
	try {
		const cardName = req.body.action.data.card.name;
		const cardMover = req.body.action.memberCreator.fullName
		const listBefore = req.body.action.data.listBefore.name
		const listAfter = req.body.action.data.listAfter.name

		if (req.body.action.type === "updateCard" && req.body.action.display.translationKey === "action_move_card_from_list_to_list") {
			await sendTelegramMessage(`Користувач ${cardMover} перемістив карту "${cardName}" із колонки "${listBefore}" до колонки "${listAfter}!"`)
		}
	} catch (error) {
		console.log(error.message);
	}

	res.status(200).send()
})

module.exports = { app, init }