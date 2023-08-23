require("dotenv").config()
const { default: axios } = require("axios")

const { TOKEN, TELEGRAM_CHAT_ID } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`

const sendTelegramMessage = async (text) => {
	const res = await axios.post(`${TELEGRAM_API}/sendMessage`, {
		chat_id: TELEGRAM_CHAT_ID,
		text: text
	})
}

module.exports = sendTelegramMessage