const TrelloUser = require("../models/trelloUser");

const addTrelloUser = async ({ username, name, trelloId, userTasks = 0 }) => {
	const userSearch = await findUserByTrelloIdInDB(trelloId)
	if (userSearch) {
		return userSearch
	}
	const user = await TrelloUser.create({ username, name, trelloId, userTasks })
	return user
}

const findUserByTrelloIdInDB = async (trelloId) => {
	const user = await TrelloUser.findOne({ trelloId });
	return user
}

const findUserByTrelloUserNameInDB = async (username) => {
	const user = await TrelloUser.findOne({ username });
	return user
}

const findUserAndPlusOneTask = async ({ username, name, trelloId }) => {
	const oldUser = await findUserByTrelloIdInDB(trelloId)
	if (!oldUser) {
		return await addTrelloUser({ username, name, trelloId, userTasks: 1 })
	}
	const user = await TrelloUser.findOneAndUpdate({ trelloId }, { userTasks: oldUser.userTasks + 1 }, { new: true })
	return user
}

const findUserAndMinisOneTask = async ({ username, name, trelloId }) => {
	const oldUser = await findUserByTrelloIdInDB(trelloId)
	if (!oldUser) {
		return await addTrelloUser({ username, name, trelloId })
	}
	const user = await TrelloUser.findOneAndUpdate({ trelloId }, { userTasks: oldUser.userTasks - 1 }, { new: true })
	return user
}

const findUserByTrelloIdAndDelete = async (trelloId) => {
	const oldUser = await TrelloUser.findOneAndDelete({ trelloId });
	return oldUser
}


module.exports = {
	addTrelloUser,
	findUserByTrelloIdInDB,
	findUserAndPlusOneTask,
	findUserAndMinisOneTask,
	findUserByTrelloIdAndDelete,
	findUserByTrelloUserNameInDB
}