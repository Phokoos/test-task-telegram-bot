const { Schema, model } = require("mongoose");

const trelloUserSchema = new Schema({
	username: String,
	name: String,
	trelloId: String,
	userTasks: Number,
}, { versionKey: false, timestamps: true })

const TrelloUser = model("trelloUser", trelloUserSchema);

module.exports = TrelloUser;