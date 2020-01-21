const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const User = require('../../src/models/user')
const Task = require('../../src/models/task')

const defaultUserId = new mongoose.Types.ObjectId()
const defaultUser = {
	_id: defaultUserId,
	name: 'Nubelson Fernandes',
	email: 'nubelsondev@example.com',
	password: '12345678',
	tokens: [
		{
			token: jwt.sign({ _id: defaultUserId }, process.env.JWT_SECRET)
		}
	]
}

const defaultUserIdTwo = new mongoose.Types.ObjectId()
const defaultUserTwo = {
	_id: defaultUserIdTwo,
	name: 'Djaminy Fernandes',
	email: 'djaminydev@example.com',
	password: '12345678',
	tokens: [
		{
			token: jwt.sign({ _id: defaultUserIdTwo }, process.env.JWT_SECRET)
		}
	]
}

const defaultTaskId = new mongoose.Types.ObjectId()
const defaultTask = {
	_id: defaultTaskId,
	completed: false,
	description: 'My default Task',
	owner: defaultUserId
}

const defaultTaskIdTwo = new mongoose.Types.ObjectId()
const defaultTaskTwo = {
	_id: defaultTaskIdTwo,
	completed: true,
	description: 'My second default Task',
	owner: defaultUserId
}

const defaultTaskIdThree = new mongoose.Types.ObjectId()
const defaultTaskThree = {
	_id: defaultTaskIdThree,
	completed: true,
	description: 'My third default Task',
	owner: defaultUserIdTwo
}

const setupDatabase = async () => {
	await User.deleteMany()
	await Task.deleteMany()

	await new User(defaultUser).save()
	await new User(defaultUserTwo).save()
	await new Task(defaultTask).save()
	await new Task(defaultTaskTwo).save()
	await new Task(defaultTaskThree).save()
}

module.exports = {
	defaultUserId,
	defaultUser,
	defaultUserIdTwo,
	defaultUserTwo,
	defaultTaskId,
	defaultTask,
	defaultTaskIdTwo,
	defaultTaskTwo,
	defaultTaskIdThree,
	defaultTaskThree,
	setupDatabase
}
