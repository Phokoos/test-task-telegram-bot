require("dotenv").config()
const { default: axios } = require("axios")

const { TOKEN, SERVER_URL, TELEGRAM_CHAT_ID, TRELLO_BOARD_ID } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`
// -984963929
const sendTelegramMessage = async (text) => {
	const res = await axios.post(`${TELEGRAM_API}/sendMessage`, {
		chat_id: TELEGRAM_CHAT_ID,
		text: text
	})
}

module.exports = sendTelegramMessage