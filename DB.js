const { MongoClient } = require('mongodb');

const MONGODBURI = process.env.MONGODBURI;

// init mongoDB connection
const client = new MongoClient(MONGODBURI);

client.connect()
	.then(async () => {
		console.log("DB Connected Successfully");
	})
	.catch(err => console.log(err));


module.exports = {
	UserDB: client.db("EMS").collection("User"),
	PollDB: client.db("EMS").collection("Poll"),
};