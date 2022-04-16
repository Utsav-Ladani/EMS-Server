const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const jwt = require('express-jwt');
const jsonwebtoken = require('jsonwebtoken');

const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const pollRouter = require('./routes/poll');
const adminRouter = require('./routes/admin');

const PORT = process.env.PORT || 5055;
const JWTSECRET = process.env.JWTSECRET;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//  ----------------- unprotected route -----------------

// static content
app.use(express.static('public'))

// APIS
// 	auth
//		signin - post
app.use('/auth', authRouter)

// ------------------- protected route ------------------
// token
app.use(jwt({
	secret: JWTSECRET,
	getToken: req => {
		const auth = req.headers?.authorization;
		if (auth && auth.split(" ").length == 2)
			return auth.split(" ")[1];
		return null;
	},
	algorithms: ['HS256']
}), (err, req, res, next) => {
	if (err) res.status(401).send('invalid token...');
	else next();
},
	(req, res, next) => {
		const token = req.headers.authorization.split(" ")[1];
		const { user } = jsonwebtoken.verify(token, JWTSECRET);
		req.user = user;
		// console.log(req.user);
		next();
	});

// APIs
//	user
// 		profile - get
//		password reset - post
app.use('/user', userRouter)

//	poll
//		get poll
//		search
// 		vote counter
app.use('/poll', pollRouter)

// 	admin
//		get
//		create
//		delete
//		update
app.use('/admin', adminRouter)

app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}...`);
});
