const express = require('express')
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId;
const { MongoClient } = require('mongodb');
const res = require('express/lib/response');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;
const stripe = require("stripe")(process.env.STRIPE_SECRET);
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
        const reviewCollection = database.collection("review")
        const usersCollection = database.collection("users");


        /* =========User data Post api for save user email,name,photo, in db=== */
        app.post('/users', async (req, res) => {
            const result = await usersCollection.insertOne(req.body)
            // res.send(result)
            console.log(result);
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

        app.get('/users', async(req, res) => {
            const result = await usersCollection.find().toArray()
            res.send(result)
        })

        //make user admin
        app.put('/users/admin', async (req, res) => {
            const email = req.body.email 
            const filter = {email : email}
            const updateDoc = {
                $set : {
                    role : 'admin'
                }
            }
            const user = await usersCollection.updateOne(filter, updateDoc)
            res.json(user)
        })

        app.get('/users/:email', async(req, res) => {
            const email = req.params.email
            const query = {email : email}
            const user = await usersCollection.findOne(query)
            let isAdmin = false
            if (user.role === 'admin') {
                isAdmin = true
            }
            else{
                isAdmin = false
            }
            const result = {admin : isAdmin}
            res.send(result)
        })

        //review collection for user
        app.post('/review', async (req, res) => {
            const data = req.body
            const review = await reviewCollection.insertOne(data)
            res.json(review)
        })

        app.get('/review', async(req, res) => {
            const review = await reviewCollection.find({}).toArray()
            res.send(review)
        })

        app.post("/create-payment-intent", async (req, res) => {
            const paymentInfo = req.body;
            const amount = paymentInfo.totalAmount * 100
            // Create a PaymentIntent with the order amount and currency
            console.log(amount);
            const paymentIntent = await stripe.paymentIntents.create({
              amount: amount,
              currency: "eur",
              payment_method_types: ["card"],
            });
          
            res.send({
              clientSecret: paymentIntent.client_secret,
            });
          });


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
