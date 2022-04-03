const express = require('express')
const userRouter = express.Router()
const { UserDB } = require('../DB');

userRouter.get('/profile', (req, res) => {
	res.json(req.user);
})

userRouter.put('/reset-password', (req, res) => {
	const user = req.user;
	const { newPassword } = req.body;
	UserDB.findOneAndUpdate({ Name: user.Name }, { $set: { Password: newPassword } })
		.then(data => res.status(200).send("Okay"))
		.catch(e => res.status(400).json(e));
})

module.exports = userRouter