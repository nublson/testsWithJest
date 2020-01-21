/**
 * @jest-environment node
 */

require('dotenv').config({
	path: '.env.testing'
})

const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user')

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

beforeEach(async () => {
	await User.deleteMany()

	await new User(defaultUser).save()
})

test('Should sign up a new user', async () => {
	const newUser = {
		name: 'Nubelson',
		email: 'nubelson00@gmail.com',
		password: '12345678'
	}

	const response = await request(app)
		.post('/users')
		.send(newUser)
		.expect(201)

	// Assert that the database was changed correctly
	const user = await User.findById(response.body.user._id)
	expect(user).not.toBeNull()

	// Assertions about the response
	//* ToMatchObject nos permite fornecer um objeto e o response.body precisa conter pelo menos uma propriedade delineada dentro dele
	expect(response.body).toMatchObject({
		user: {
			name: 'Nubelson',
			email: 'nubelson00@gmail.com'
		},
		token: user.tokens[0].token
	})

	expect(user.password).not.toBe('12345678')
})

test('Should login existing user', async () => {
	const response = await request(app)
		.post('/users/login')
		.send({
			email: defaultUser.email,
			password: defaultUser.password
		})
		.expect(200)

	const user = await User.findById(defaultUserId)
	expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login nonexistent user', async () => {
	await request(app)
		.post('/users/login')
		.send({
			email: defaultUser.email,
			password: '123456789'
		})
		.expect(400)
})

test('Should get user profile', async () => {
	await request(app)
		.get('/users/me')
		.set('Authorization', `Bearer ${defaultUser.tokens[0].token}`)
		.send()
		.expect(200)
})

test('Should not get profile for unauthenticated user ', async () => {
	await request(app)
		.get('/users/me')
		.send()
		.expect(401)
})

test('Should delete account for user', async () => {
	await request(app)
		.delete('/users/me')
		.set('Authorization', `Bearer ${defaultUser.tokens[0].token}`)
		.send()
		.expect(200)

	const user = await User.findById(defaultUserId)
	expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user', async () => {
	await request(app)
		.delete('/users/me')
		.send()
		.expect(401)
})

test('Should upload avatar image', async () => {
	await request(app)
		.post('/users/me/avatar')
		.set('Authorization', `Bearer ${defaultUser.tokens[0].token}`)
		.attach('avatar', 'tests/fixtures/profile-pic.jpg')
		.expect(200)

	const user = await User.findById(defaultUserId)
	expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
	await request(app)
		.patch('/users/me')
		.set('Authorization', `Bearer ${defaultUser.tokens[0].token}`)
		.send({
			name: 'Weya'
		})
		.expect(200)

	const user = await User.findById(defaultUserId)
	expect(user.name).toEqual('Weya')
})

test('Should not update invalid user fields', async () => {
	await request(app)
		.patch('/users/me')
		.set('Authorization', `Bearer ${defaultUser.tokens[0].token}`)
		.send({
			location: 'Porto'
		})
		.expect(400)
})
