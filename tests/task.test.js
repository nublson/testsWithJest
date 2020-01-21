require('dotenv').config({
	path: '.env.testing'
})

const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const {
	defaultUser,
	defaultUserTwo,
	defaultTaskId,
	setupDatabase
} = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should create a new task', async () => {
	const newTask = {
		description: 'My New task'
	}

	const response = await request(app)
		.post('/tasks')
		.set('Authorization', `Bearer ${defaultUser.tokens[0].token}`)
		.send(newTask)
		.expect(201)

	const task = await Task.findById(response.body._id)
	expect(task).not.toBeNull()
	expect(task.completed).toEqual(false)
})

test('Should get all user tasks', async () => {
	const response = await request(app)
		.get('/tasks')
		.set('Authorization', `Bearer ${defaultUser.tokens[0].token}`)
		.send()
		.expect(200)

	expect(response.body).toHaveLength(2)
})

test("Should not be able to delete a task that doesn't belong to me", async () => {
	const respose = await request(app)
		.delete(`/tasks/${defaultTaskId}`)
		.set('Authorization', `Bearer ${defaultUserTwo.tokens[0].token}`)
		.send()
		.expect(404)

	const task = await Task.findById(defaultTaskId)
	expect(task).not.toBeNull()
})
