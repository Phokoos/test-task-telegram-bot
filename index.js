require("dotenv").config()
const express = require("express")
const bodyParser = require("body-parser")
const axios = require("axios")
const { getStatsAnswerController, leftChatMemberLogic, addedNewMemberToChatController, connectTrelloUser, replyToStartController, createNewList } = require("./controllers/telegramReq")
const { minusUserTaskWhenCardIsDeleted, deleteTrelloUserFromBoard, memberLeftCard, memberJoinToCard, addNewTrelloUserToDB, cardMoving } = require("./controllers/trelloReq")

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

app.get(URI_TRELLO, async (req, res) => {
	await res.send()
})

app.post(URI_TRELLO, async (req, res) => {
	const actionType = req.body.action.display.translationKey
	//! DELETE
	console.log(actionType);

	try {
		//! Minus user task when delete card
		if (actionType === 'action_archived_card') {
			await minusUserTaskWhenCardIsDeleted(req)
		}
		//! Remove user from board
		if (actionType === 'action_removed_from_board' || actionType === 'action_left_board') {
			await deleteTrelloUserFromBoard(req)
		}
		//! Part with minus tasks
		if (actionType === 'action_member_left_card' || actionType === 'action_removed_member_from_card') {
			await memberLeftCard(req)
		}
		//! Part with plus tasks
		if (actionType === 'action_member_joined_card' || actionType === 'action_added_member_to_card') {
			await memberJoinToCard(req)
		}
		//! Part with added trello user to DB 
		if (actionType === 'action_added_member_to_board') {
			await addNewTrelloUserToDB(req)
		}
		//! Card moving
		if (req.body.action.type === "updateCard" && req.body.action.display.translationKey === "action_move_card_from_list_to_list") {
			await cardMoving(req)
		}
	} catch (error) {
		console.log("Error Trello API controllers: ", error.message);
	}
	await res.send()
})

module.exports = { app, init }