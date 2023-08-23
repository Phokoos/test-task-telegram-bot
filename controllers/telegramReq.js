const sendTelegramMessage = require("../api/telegram/telegramApi")
const { addTrelloCard } = require("../api/trelloApi")
const { findUserByTrelloUserNameInDB } = require("./trelloUsers")
const { getAll, findOneByTelegramIdAndDelete, addUser, findOneByTelegramIdAndUpdateTrelloEmail } = require("./users")


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

const leftChatMemberLogic = async (req) => {
	const telegramId = req.body.message.left_chat_participant.id;
	await findOneByTelegramIdAndDelete(telegramId)
}

const addedNewMemberToChatController = async (req) => {
	const newUserName = req.body.message.new_chat_participant.first_name;
	const newUserId = req.body.message.new_chat_participant.id;
	const newUser = await addUser({
		name: newUserName,
		telegramId: newUserId
	})
	await sendTelegramMessage(`Added new user ${newUserName} to Database`)
}

const connectTrelloUser = async (messageText, userId) => {
	const array = messageText.split(" ")
	const trelloUserName = array[1]
	const newUser = await findOneByTelegramIdAndUpdateTrelloEmail(userId, trelloUserName)

	if (newUser.trelloUserName) {
		await sendTelegramMessage(`Your account connected to Trello data with ${newUser.trelloUserName} user name!`)
	}
}

const replyToStartController = async (req) => {
	const userName = req.body.message.from.first_name
	const userId = req.body.message.from.id

	await addUser({
		name: userName,
		telegramId: userId
	})

	sendTelegramMessage(`Hello ${userName}`)
}

const createNewList = async (listName) => {
	const data = await addTrelloCard(listName)
	const { id, name } = data;
	await sendTelegramMessage(`Create list "${name}" with id: ${id}`)
}

module.exports = {
	getStatsAnswerController,
	leftChatMemberLogic,
	addedNewMemberToChatController,
	connectTrelloUser,
	replyToStartController,
	createNewList
}