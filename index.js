require("dotenv").config()
const express = require("express")
const bodyParser = require("body-parser")
const axios = require("axios")
const mongoose = require("mongoose")
const { addUser, findOneByTelegramIdAndUpdateTrelloEmail, findOneByTelegramIdAndDelete, getAll } = require("./controllers/users")
const { addTrelloCard, findTrelloBoardMemberById, findTrelloCardById } = require("./api/trelloApi")
const sendTelegramMessage = require("./api/telegram/telegramApi")
const { addTrelloUser, findUserAndPlusOneTask, findUserAndMinisOneTask, findUserByTrelloIdAndDelete, findUserByTrelloUserNameInDB } = require("./controllers/trelloUsers")
const { getStatsAnswerController, leftChatMemberLogic, addedNewMemberToChatController, connectTrelloUser, replyToStartController, createNewList } = require("./controllers/telegramReq")

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
	const messageText = req.body.message.text
	const text = req.body.message.text
	const userId = req.body.message.from.id

	try {
		if (text === '/stats') {
			await getStatsAnswerController()
		}
		if (req.body.message.left_chat_participant) {
			await leftChatMemberLogic(req)
		}
		if (req.body.message.new_chat_participant) {
			await addedNewMemberToChatController(req)
		}
		if (text === "/start") {
			await replyToStartController(req)
		}
		if (text === "/newTrelloListInProgress") {
			await createNewList("InProgress")
		}
		if (text === "/newTrelloListDone") {
			await createNewList("Done")
		}
	} catch (error) {
		console.log("Error Telegram API controllers: ", error.message);
	}

	try {
		if (messageText.slice(0, 10) === '/addTrello') {
			await connectTrelloUser(messageText, userId)
		}
	} catch (error) {
		console.log("Error in addTrello slice: ", error.message);
	}
	return res.send()
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