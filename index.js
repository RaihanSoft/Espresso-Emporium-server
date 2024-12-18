const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


//middleware
app.use(cors())
app.use(express.json())

// ! connect 


const uri = `mongodb+srv://${process.env.S3_BUCKET}:${process.env.SECRET_KEY}@cluster0.p73no.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

console.log(uri)

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

        const coffeeCollection = client.db('coffeeDB').collection('coffee');


        app.get('/coffee', async (req, res) => {
            const cursor = coffeeCollection.find();
            const result = await cursor.toArray();
            res.send(result)


        })

        app.post('/coffee', async (req, res) => {
            const newCoffee = req.body;
            console.log(newCoffee)
            const result = await coffeeCollection.insertOne(newCoffee);
            res.send(result)
        })


        // delete operation 
        app.delete('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await coffeeCollection.deleteOne(query)
            res.send(result)


        })

        // load of find 
        app.get('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await coffeeCollection.findOne(query)
            res.send(result)
        })


        // Corrected server-side code
        app.put('/coffee/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const filter = { _id: new ObjectId(id) };
                const options = { upsert: true }; // <-- Fixed typo: ture => true
                const updateCoffee = req.body;

                const coffee = {
                    $set: {
                        photo: updateCoffee.photo,
                        name: updateCoffee.name,
                        details: updateCoffee.details,
                        category: updateCoffee.category,
                        taste: updateCoffee.taste,
                        supplier: updateCoffee.supplier,
                        chef: updateCoffee.chef,
                    },
                };

                const result = await coffeeCollection.updateOne(filter, coffee, options);
                res.send(result);
            } catch (error) {
                console.error("Error updating coffee:", error); // <-- Error logging
                res.status(500).send({ message: "Server error" });
            }
        });



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



// ! connect 




app.get('/', (req, res) => {
    res.send("Coffe making server is running ")
})
app.listen(port, () => {
    console.log(`Coffe Server is runnig on port ${port} `)
}) 