const express = require('express')
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId;
const { MongoClient } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;

/*========= Middleware============== */
app.use(cors())
app.use(express.json())

/* ===========MongoDb================ */
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2rvjh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("EDU_Champ");
        const usersCollection = database.collection("users");



        /* =========User data Post api for save user email,name,photo, in db=== */
        app.post('/users', async (req, res) => {
            const result = await usersCollection.insertOne(req.body)
            res.send(result)
        })
        /* ===========upsert/put new user Api for google log in data=========== */
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user }
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            // console.log(result);
            res.send(result)
        })



    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Welcome to EDUcamp!')
})

app.listen(port, () => {
    console.log(`listening at :${port}`)
})
