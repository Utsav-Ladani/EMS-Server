const express = require('express');
const { ObjectId, Timestamp } = require('mongodb');
const pollRouter = express.Router()
const { PollDB } = require('../DB');

pollRouter.get('/search', (req, res) => {
	const { poll_name } = req.query;
	
	selector={};
	selector["$or"] = [{ Name: { $regex: poll_name, $options : 'i' } }];
	if(ObjectId.isValid(poll_name)) selector["$or"].push({_id: ObjectId(poll_name)});

	PollDB.find(selector).sort({"Start_Time": -1}).toArray()
		.then(data => {
			if (data) {
				const dateNow = new Date();
				const arr = data.map(d => {
					if (dateNow < d.End_Time)
						delete d.Result;
						
					delete d.WhoGave;
					
					return d;
				}).map(d => {
					d.Upcoming=(dateNow < d.Start_Time);
					return d;
				});
				
				res.json(arr);
			}
			else res.status(404).send("Poll Not Found");
		});
})

pollRouter.post('/vote', (req, res) => {
	const { poll_id, vote } = req.body;
	const { Roles, _id } = req.user;


	if (ObjectId.isValid(poll_id)) {
		const findQuery = {
			"_id": ObjectId(poll_id),
			"WhoCan": { $elemMatch: { $in: Roles } },
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
				if (data.matchedCount == 0) res.status(400).send("you can not vote for this poll");
				else res.status(200).send("Your vote has been recorded");
			});
	}
	else res.status(400).send("Invalid Poll ID or Vote");
})

module.exports = pollRouter
