const express = require('express');
const { ObjectId } = require('mongodb');
const { PollDB } = require('../DB');
const adminRouter = express.Router()

adminRouter.use((req, res, next) => {
	if (req.user.Role.includes("Admin")) next();
	else res.status(400).send("You are not an admin!");
})

adminRouter.post('/create', (req, res) => {
	PollDB.insertOne(req.body)
		.then(data => res.status(200).send("Poll created successfully"))
		.catch(e => res.status(400).send("Invalid Poll"));
})

adminRouter.put('/update/:poll_id', (req, res) => {
	const { poll_id } = req.params;

	if (ObjectId.isValid(poll_id)) {
		PollDB.findOneAndReplace({ "_id": ObjectId(poll_id) }, req.body)
			.then(data => res.status(200).send("Poll updated successfully"));
	}
	else res.status(400).send("Invalid Poll");
})

adminRouter.delete('/delete/:poll_id', (req, res) => {
	const { poll_id } = req.params;

	if (ObjectId.isValid(poll_id)) {
		PollDB.deleteOne({ "_id": ObjectId(poll_id) })
			.then(data => {
				if (data.deletedCount == 1) res.status(200).send("Poll deleted successfully");
				else res.status(404).send("Poll Not Found");
			});
	}
	else res.status(400).send("Invalid Poll");
})

module.exports = adminRouter