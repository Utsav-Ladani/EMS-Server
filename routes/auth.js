const express = require('express')
const authRouter = express.Router();
const jsonwebtoken = require('jsonwebtoken');

const { UserDB } = require('../DB');
const JWTSECRET = process.env.JWTSECRET;

authRouter.post('/signin', async (req, res) => {
	const { username, password } = req.body;

	UserDB.findOne({ Name: username, Password: password })
		.then(data => {
			if (data) {
				const { Password, ...user } = data;
				token = jsonwebtoken.sign({ user }, JWTSECRET, { expiresIn: '1h', algorithm: 'HS256' });
				res.json(token);
			}
			else res.status(401).send("Invalid Credential");
		});
})

module.exports = authRouter