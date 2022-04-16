const express = require('express');
const { ObjectId } = require('mongodb');
const { UserDB } = require('../DB');
const adminUserRouter = express.Router()

adminUserRouter.get('/', (req, res) => {
	const { voter_id } = req.query;

	UserDB.findOne({ Voter_ID: voter_id })
		.then(data => {
			if (data) res.status(200).json(data);
			else res.status(404).send("User Not found");
		});

})

adminUserRouter.post('/create', async (req, res) => {
	const data = {
		Voter_ID: req.body.Voter_ID,
		Name: req.body.Name,
		DOB: req.body.DOB,
		Contact_No: req.body.Contact_No,
		Address: req.body.Address,
		State: req.body.State,
		City: req.body.City,
		PIN: req.body.PIN,
		Password: req.body.Password,
		Roles: req.body.Roles
	};

	const result = await UserDB.find({ Voter_ID: data.Voter_ID }).toArray();
	if (result.length == 0) {
		UserDB.insertOne(data)
			.then(data => res.status(200).send("User created successfully"))
			.catch(e => res.status(400).send("Invalid User"));
	}
	else res.status(400).send("User Already exist");
})

adminUserRouter.put('/update', (req, res) => {
	const { voter_id } = req.query;

	const data = {
		Voter_ID: voter_id,
		Name: req.body.Name,
		DOB: req.body.DOB,
		Contact_No: req.body.Contact_No,
		Address: req.body.Address,
		State: req.body.State,
		City: req.body.City,
		PIN: req.body.PIN,
		Password: req.body.Password,
		Roles: req.body.Roles
	};

	if (voter_id && ObjectId.isValid(req.body._id)) {
		UserDB.findOneAndReplace({ "Voter_ID": voter_id }, { _id: ObjectId(req.body._id), ...data })
			.then(d => {
				if (d?.value?._id) res.status(200).send("User updated successfully");
				else res.status(404).send("User Not Found");
			});
	}
	else res.status(400).send("Invalid Voter ID");
})

adminUserRouter.delete('/delete', (req, res) => {
	const { voter_id } = req.query;

	if (voter_id) {
		UserDB.deleteOne({ "Voter_ID": voter_id })
			.then(data => {
				if (data.deletedCount == 1) res.status(200).send("User deleted successfully");
				else res.status(404).send("User Not Found");
			});
	}
	else res.status(400).send("Invalid Voter ID");
})

module.exports = adminUserRouter
