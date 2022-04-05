const express = require('express')
const authRouter = express.Router();
const jsonwebtoken = require('jsonwebtoken');

const { UserDB } = require('../DB');
const JWTSECRET = process.env.JWTSECRET;

authRouter.post('/signin', async (req, res) => {
	const { voter_id, password } = req.body;

	UserDB.findOne({ Voter_ID: voter_id, Password: password })
		.then(data => {
			if (data) {
				const { Password, ...user } = data;
				token = jsonwebtoken.sign({ user }, JWTSECRET, { expiresIn: '1h', algorithm: 'HS256' });
				res.status(200).json(token);
			}
			else res.status(401).send("Invalid Credential");
		});
})

module.exports = authRouter
