const express = require('express')
const session = require('express-session')
const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb')
const passport = require('passport')
const GitHubStrategy = require('passport-github2').Strategy

const port = process.env.PORT || 3000

const app = express();
app.use(express.json());
app.use(express.static('public'))

const mongoURI = "mongodb+srv://kastuparu:0L4UkE5roJvXWtdV@cluster0.vabi7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const client = new MongoClient(mongoURI, { serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }})
let tasks = undefined;

passport.serializeUser(function(user, done) {
    process.nextTick(function() {
        done(null, { id: user.id, username: user.username, name: user.name });
    });
})
passport.deserializeUser(function(user, done) {
    process.nextTick(function() {
        return done(null, user);
    });
})
passport.use(new GitHubStrategy({
        clientID: "Ov23li7iYVq5GbrzjhAS",
        clientSecret: "f68e8aa6d250366cb36c70bf692c72a7a5d34e5e",
        callbackURL: "https://a3-kastuparu.vercel.app/auth/github/callback"
    },
    function verify(accessToken, refreshToken, profile, done) {
        return done(null, profile)
    }
))
app.use(passport.initialize());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(passport.authenticate('session'));

app.use('/', (req, res, next) => {
    console.log('Request URL: ' + req.url);
    next() // go to the next middleware for this route
})

app.get('/auth/github',
    passport.authenticate('github'), (req, res) => {
        // The request will be redirected to GitHub for authentication, so this
        // function will not be called.
    })

app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }),
    function(req, res) {
        res.redirect('/')
    })

app.get('/logout', function(req, res){
    req.logout(() => {
        res.redirect('/')
    })
})

app.get('/data', async (req, res) => {
    console.log("getting data")
    if (!req.user) { return res.sendStatus(401) }
    const taskList = await tasks.find({user: req.user.username}).toArray()
    return res.status(200).send(JSON.stringify(taskList))
})

app.post('/data', async (req, res) => {
    if (!req.user) { return res.sendStatus(401) }
    const newTaskStr = req.body
    const newTask = {
        "user": req.user.username,
        "taskName": newTaskStr.taskName,
        "priority": newTaskStr.priority,
        "dueDate": newTaskStr.dueDate,
        "overdue": new Date() - new Date(newTaskStr.dueDate) > 86400000
    };
    const result = await tasks.insertOne(newTask)
    console.log(result)
    const taskList = await tasks.find({}).toArray()
    return res.status(200).send(JSON.stringify(taskList))
})

app.delete('/data', async (req, res) => {
    if (!req.user) { return res.sendStatus(401) }
    const deleteTaskID = req.body._id
    const result = await tasks.deleteOne({_id: new ObjectId(deleteTaskID)})

    if (result.deletedCount === 1) {
        console.log("Deleted task with ID " + deleteTaskID)
        const taskList = await tasks.find({}).toArray()
        return res.status(200).send(JSON.stringify(taskList))
    } else {
        console.log("Task with ID " + deleteTaskID + " was not found.")
        return res.status(400)
    }
})

app.put('/data', async (req, res) => {
    if (!req.user) { return res.sendStatus(401) }
    const taskStr = req.body
    const taskListIndex = taskStr._id
    delete taskStr._id
    delete taskStr.user
    taskStr.overdue = new Date() - new Date(taskStr.dueDate) > 86400000
    const result = await tasks.updateOne({_id: new ObjectId(taskListIndex)}, {$set: taskStr})

    if (result.modifiedCount === 1) {
        console.log("Edited task with ID " + taskStr._id)
        const taskList = await tasks.find({}).toArray()
        return res.status(200).send(JSON.stringify(taskList))
    } else {
        console.log("Task with ID " + taskStr._id + " was not found.")
        return res.status(400)
    }
})

console.log("Running backend")
client.connect().then(() => {
    tasks = client.db('assignment-3').collection('tasks')
    app.listen(port, () => {
        console.log(`App running on port ${port}`);
    });
})