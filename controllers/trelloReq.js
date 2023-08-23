const sendTelegramMessage = require("../api/telegram/telegramApi");
const { findTrelloCardById, findTrelloBoardMemberById } = require("../api/trelloApi");
const { findUserAndMinisOneTask, findUserByTrelloIdAndDelete, findUserAndPlusOneTask, addTrelloUser } = require("./trelloUsers");


const minusUserTaskWhenCardIsDeleted = async (req) => {
	const trelloCardId = req.body.action.data.card.id
	const deletedCard = await findTrelloCardById(trelloCardId)
	const usersArrayId = deletedCard.idMembers;

	usersArrayId.forEach(async id => {
		await findUserAndMinisOneTask({ trelloId: id })
	})
}

const deleteTrelloUserFromBoard = async (req) => {
	const userId = req.body.action.member.id
	await findUserByTrelloIdAndDelete(userId)
}

const memberLeftCard = async (req) => {
	const newUserId = req.body.action.member.id
	const newUser = await findTrelloBoardMemberById(newUserId)

	const { username, fullName: name, id: trelloId } = newUser

	await findUserAndMinisOneTask({ username, name, trelloId })
}

const memberJoinToCard = async (req) => {
	const newUserId = req.body.action.member.id
	const newUser = await findTrelloBoardMemberById(newUserId)
	const { username, fullName: name, id: trelloId } = newUser

	await findUserAndPlusOneTask({ username, name, trelloId })
}

const addNewTrelloUserToDB = async (req) => {
	const newUserId = req.body.action.member.id
	const newUser = await findTrelloBoardMemberById(newUserId)
	const { username, fullName: name, id: trelloId } = newUser

	await addTrelloUser({ username, name, trelloId })
}

const cardMoving = async (req) => {
	const cardName = req.body.action.data.card.name;
	const cardMover = req.body.action.memberCreator.fullName
	const listBefore = req.body.action.data.listBefore.name
	const listAfter = req.body.action.data.listAfter.name

	await sendTelegramMessage(`Користувач ${cardMover} перемістив карту "${cardName}" із колонки "${listBefore}" до колонки "${listAfter}!"`)
}

module.exports = {
	minusUserTaskWhenCardIsDeleted,
	deleteTrelloUserFromBoard,
	memberLeftCard,
	memberJoinToCard,
	addNewTrelloUserToDB,
	cardMoving
}