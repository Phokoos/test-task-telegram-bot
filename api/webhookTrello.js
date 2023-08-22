const { default: axios } = require("axios");
require("dotenv").config()

const { TRELLO_API_KEY, TRELLO_SECRET, TRELLO_TOKEN, TRELLO_BOARD_ID, SERVER_URL } = process.env;

const URI_TRELLO = `/webhook/${TRELLO_BOARD_ID}`
const WEBHOOK_URL_TRELLO = (SERVER_URL + URI_TRELLO)

const initTrelloWebhook = async () => {
	const res = await axios.post(`https://api.trello.com/1/webhooks/?callbackURL=${WEBHOOK_URL_TRELLO}&idModel=${TRELLO_BOARD_ID}&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`, {
		headers: {
			'Accept': 'application/json'
		}
	})
	console.log(res.data);
}
const TRELLO_WEBHOOK_ID = "64e538c68e49664efcf5e8db"

const deleteTrelloWebhook = async () => {
	const res = await axios.delete(`https://api.trello.com/1/webhooks/${TRELLO_WEBHOOK_ID}?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
		{
			headers: {
				'Accept': 'application/json'
			}
		})
	console.log(res);
}

module.exports = {
	initTrelloWebhook,
	deleteTrelloWebhook
}