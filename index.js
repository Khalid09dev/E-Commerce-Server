const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

//middlewares
app.use(cors());
app.use(express.json());


//mongodb
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rpbygkt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const flashSalesProductCollections = client.db('Dashdeals').collection('flashSalesProducts');
        const bestSellingProductCollections = client.db('Dashdeals').collection('bestSellingProducts');
        const exploreOurProductCollections = client.db('Dashdeals').collection('exploreOurProducts');
        const userProductWishlistCollections = client.db('Dashdeals').collection('userProductWishlist');

        //jwt related apis
        app.post('/jwt', async(req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1h'
            })
            res.send({token});
        })

        //products related apis
        app.get('/flashSalesProducts', async(req, res) => {
            const result = await flashSalesProductCollections.find().toArray();
            res.send(result);
        })

        app.get('/bestSellingProducts', async(req, res) => {
            const result = await bestSellingProductCollections.find().toArray();
            res.send(result);
        })

        app.get('/exploreOurProducts', async(req, res) => {
            const result = await exploreOurProductCollections.find().toArray();
            res.send(result);
        })

        //users related apis
        app.post('/userProductWishlist', async(req, res) => {
            const data = req.body;
            const query = {_id: (data._id)};
            const existingWishlistItem = await userProductWishlistCollections.findOne(query);
            console.log(existingWishlistItem);
            if(existingWishlistItem) {
                return res.send({message: 'wishlist item exist', insertedId: null});
            }
            const result = await userProductWishlistCollections.insertOne(data);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);
//mongodb


app.get('/', async(req, res) => {
    res.send('Dash Deals server running here....')
})

app.listen(port, () => {
    console.log(`DashDeal server running on port ${port}`);
})