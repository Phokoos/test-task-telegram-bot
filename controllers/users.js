const { json } = require("express");
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
		telegramId: user.telegramId
	})
	return newUser
}

const findOneByTelegramId = async (telegramId) => {
	const user = await User.findOne({ telegramId })
	return user
}

module.exports = { getAll, addUser, findOneByTelegramId }