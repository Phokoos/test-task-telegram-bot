// This code sample uses the 'node-fetch' library:
// https://www.npmjs.com/package/node-fetch
const { default: axios } = require("axios");
require("dotenv").config()

const { TRELLO_API_KEY, TRELLO_SECRET, TRELLO_TOKEN, TRELLO_BOARD_ID } = process.env;

const addTrelloCard = async (name) => {
	const res = await axios.post(
		`https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/lists?name=${name}&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
		{
			headers: {
				'Accept': 'application/json'
			}
		})
	// console.log(res.data)
	return res.data
}
// 63a0c094a1ec5b01eaaf5580
const findTrelloBoardMemberById = async (memberId) => {
	const res = await axios.get(`https://api.trello.com/1/members/${memberId}?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`, {
		headers: {
			'Accept': 'application/json'
		}
	})
	return res.data
}

module.exports = {
	addTrelloCard,
	findTrelloBoardMemberById
}