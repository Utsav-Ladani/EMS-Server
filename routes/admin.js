const express = require('express');
const { ObjectId } = require('mongodb');
const { PollDB } = require('../DB');
const adminUserRouter = require('./admin-user');
const adminRouter = express.Router()

adminRouter.use((req, res, next) => {
	if (req.user.Roles.includes("Admin")) next();
	else res.status(400).send("Only admin can access this page!");
})

adminRouter.get('/', (req, res) => {
	const { poll_id } = req.query;

	if (ObjectId.isValid(poll_id)) {
		PollDB.findOne({ _id: ObjectId(poll_id) })
			.then(data => {
				if (data) {
					delete data.Result;
					delete data.WhoGave;
					res.json(data);
				}
				else res.status(404).send("Poll Not Found");
			});
	}
	else res.status(400).send("Invalid Poll ID");

})

adminRouter.post('/create', (req, res) => {
	const data = {
		Name: req.body.Name,
		Start_Time: req.body.Start_Time,
		End_Time: req.body.End_Time,
		WhoCan: req.body.WhoCan,
		Options: req.body.Options,
		WhoGave: [],
		Result: req.body.Options.map(v => 0),
		Total_Vote: 0
	};

	PollDB.insertOne(data)
		.then(data => res.status(200).send("Poll created successfully"))
		.catch(e => res.status(400).send("Invalid Poll"));
})

adminRouter.put('/update', (req, res) => {
	const { poll_id } = req.query;

	const data = {
		Name: req.body.Name,
		Start_Time: req.body.Start_Time,
		End_Time: req.body.End_Time,
		WhoCan: req.body.WhoCan,
		Options: req.body.Options,
		Result: req.body.Options.map(v => 0),
		Total_Vote: 0
	};

	if (ObjectId.isValid(poll_id)) {
		PollDB.findOneAndReplace({ "_id": ObjectId(poll_id) }, { _id: ObjectId(poll_id), ...data })
			.then(data => {
				if (data?.value?._id) res.status(200).send("Poll updated successfully");
				else res.status(404).send("Poll Not Found");
			});
	}
	else res.status(400).send("Invalid Poll");
})

adminRouter.delete('/delete', (req, res) => {
	const { poll_id } = req.query;

	if (ObjectId.isValid(poll_id)) {
		PollDB.deleteOne({ "_id": ObjectId(poll_id) })
			.then(data => {
				if (data.deletedCount == 1) res.status(200).send("Poll deleted successfully");
				else res.status(404).send("Poll Not Found");
			});
	}
	else res.status(400).send("Invalid Poll");
})

adminRouter.use('/user', adminUserRouter)

module.exports = adminRouter
