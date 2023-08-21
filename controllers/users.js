const { json } = require("express");
const User = require("../models/user")

const getAll = async () => {
	const result = await User.find();
	return result
}

const addUser = async (user) => {
	const newUser = await User.create({
		name: user.name,
		telegramId: user.telegramId
	})
	return newUser
}

const findOneByTelegramId = async (telegramId) => {
	const user = await User.find({ telegramId })
	return user
}

module.exports = { getAll, addUser, findOneByTelegramId }