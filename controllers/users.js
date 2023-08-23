const User = require("../models/user")

const getAll = async () => {
	const result = await User.find();
	return result
}

const addUser = async (user) => {
	const oldUser = await findOneByTelegramId(user.telegramId)
	const newUserStringId = user.telegramId.toString()

	if (oldUser) {
		if (oldUser.telegramId === newUserStringId) {
			console.log("You have this user now");
			return
		}
	}

	const newUser = await User.create({
		name: user.name,
		telegramId: user.telegramId,
		trelloUserName: ""
	})
	return newUser
}

const findOneByTelegramId = async (telegramId) => {
	const user = await User.findOne({ telegramId })
	return user
}

const findOneByTelegramIdAndUpdateTrelloEmail = async (telegramId, trelloUserName) => {
	const updaterUser = await User.findOneAndUpdate({ telegramId }, { trelloUserName: trelloUserName }, { new: true })
	return updaterUser
}

const findOneByTelegramIdAndDelete = async (telegramId) => {
	const deletedUser = await User.findOneAndDelete({ telegramId });
	console.log(deletedUser);
	return deletedUser
}

module.exports = {
	getAll,
	addUser,
	findOneByTelegramId,
	findOneByTelegramIdAndUpdateTrelloEmail,
	findOneByTelegramIdAndDelete
}