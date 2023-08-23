const { default: axios } = require("axios");
require("dotenv").config()

const { TRELLO_API_KEY, TRELLO_TOKEN, TRELLO_BOARD_ID } = process.env;

const addTrelloCard = async (name) => {
	const res = await axios.post(
		`https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/lists?name=${name}&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
		{
			headers: {
				'Accept': 'application/json'
			}
		})
	return res.data
}

const findTrelloBoardMemberById = async (memberId) => {
	const res = await axios.get(`https://api.trello.com/1/members/${memberId}?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`, {
		headers: {
			'Accept': 'application/json'
		}
	})
	return res.data
}

const findTrelloCardById = async (cardId) => {
	const res = await axios.get(`https://api.trello.com/1/cards/${cardId}?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`)
	return res.data
}

module.exports = {
	addTrelloCard,
	findTrelloBoardMemberById,
	findTrelloCardById
}