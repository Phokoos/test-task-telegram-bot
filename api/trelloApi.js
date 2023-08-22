// This code sample uses the 'node-fetch' library:
// https://www.npmjs.com/package/node-fetch
const { default: axios } = require("axios");
const fetch = require("node-fetch")
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

module.exports = {
	addTrelloCard
}