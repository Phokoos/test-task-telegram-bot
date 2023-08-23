const sendTelegramMessage = require("../api/telegram/telegramApi")
const { findUserByTrelloUserNameInDB } = require("./trelloUsers")
const { getAll } = require("./users")


const getStatsAnswerController = async () => {
	const allUsers = await getAll()

	await allUsers.forEach(async (user) => {
		const userDataObj = {
			name: user.name,
			tasksCount: 0
		}

		if (user.trelloUserName !== "") {
			const dataFromTrelloDB = await findUserByTrelloUserNameInDB(user.trelloUserName)
			try {
				userDataObj.tasksCount = dataFromTrelloDB.userTasks
			} catch (error) {
				console.log("Error in get write tasks data : ", error.message);
			}
		}
		await sendTelegramMessage(`Користувач ${userDataObj.name} має в опрацюванні ${userDataObj.tasksCount} завдань.`)
	})
}

module.exports = {
	getStatsAnswerController
}