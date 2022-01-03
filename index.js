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
        const database = client.db("insertDB");
        const haiku = database.collection("haiku");
        const reviewCollection = database.collection("review")


        app.post('/review', async (req, res) => {
            const data = req.body
            const review = await reviewCollection.insertOne(data)
            res.json(review)
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
