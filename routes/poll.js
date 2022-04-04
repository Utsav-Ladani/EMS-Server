const express = require('express');
const { ObjectId, Timestamp } = require('mongodb');
const pollRouter = express.Router()
const { PollDB } = require('../DB');

pollRouter.get('/', (req, res) => {
	const { poll_id } = req.query;

	if (ObjectId.isValid(poll_id)) {
		PollDB.findOne({ _id: ObjectId(poll_id) })
			.then(data => {
				if (data) {
					const timestamp = new Timestamp(new Date());
					if (timestamp < data.End_Time)
						delete data.Result;
					delete data.WhoGave;
					res.json(data);
				}
				else res.status(404).send("Poll Not Found");
			});
	}
	else res.status(400).send("Invalid Poll ID");

})



pollRouter.get('/search/', (req, res) => {
	const { poll_name } = req.query;

	PollDB.find({ Name: { $regex: poll_name, $options : 'i' } }).sort({"Start_Time": -1}).toArray()
		.then(data => {
			if (data) {
				const dateNow = new Date();
				const arr = data.map(d => {
					if (dateNow < d.End_Time)
						delete d.Result;
						
					delete d.WhoGave;
					
					return d;
				}).filter(d => dateNow >= d.Start_Time);
				
				res.json(arr);
			}
			else res.status(404).send("Poll Not Found");
		});
})

pollRouter.post('/vote', (req, res) => {
	const { poll_id, vote } = req.body;
	const { Role, _id } = req.user;


	if (ObjectId.isValid(poll_id)) {
		const findQuery = {
			"_id": ObjectId(poll_id),
			"WhoCan": { $elemMatch: { $in: Role } },
			"WhoGave": { $nin: [_id] }
		};
		selector = {};
		selector['Result.' + vote] = 1;
		selector["Total_Vote"] = 1;
		const updateQuery = {
			$push: { "WhoGave": _id },
			$inc: selector
		};

		PollDB.updateOne(findQuery, updateQuery)
			.then(data => {
				if (data.matchedCount == 0) res.status(400).send("You are not illegible for this poll");
				else res.status(200).send("Your vote has been recorded");
			});
	}
	else res.status(400).send("Invalid Poll ID or Vote");
})

module.exports = pollRouter
