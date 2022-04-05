const express = require('express')
const userRouter = express.Router()
const { UserDB } = require('../DB');

userRouter.get('/profile', (req, res) => {
	UserDB.findOne({ Voter_ID: req.user.Voter_ID })
		.then(data => {
			if (data) {
				const {Password, ...user} = data;
				res.status(200).json(user);
			}
			else res.status(404).send("User not found");
		})
		.catch(e => res.status(400).json(e));
})

userRouter.put('/reset-password', (req, res) => {
	const { Voter_ID } = req.user;
	const { password } = req.body;
	UserDB.findOneAndUpdate({ Voter_ID: Voter_ID }, { $set: { Password: password } })
		.then(data => res.status(200).send("Okay"))
		.catch(e => res.status(400).json(e));
})

module.exports = userRouter
