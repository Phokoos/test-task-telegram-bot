const { Schema, model } = require("mongoose");

const userSchema = new Schema({
	name: String,
	telegramId: String,
	trelloUserName: String,
}, { versionKey: false, timestamps: true })

const User = model("user", userSchema);

module.exports = User;