const express = require("express");

const cors = require("cors");

require("dotenv").config();
const app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 7000;

app.use(express.json());
app.use(cors());

const uri =
  `mongodb+srv://${process.env.DB_user}:${process.env.DB_PASS}@cluster0.yecar.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});


app.get("/", (req, res) => {
  res.send("Hello, server is running");
}); 




async function run(){
    try{
      await client.connect();

      const billingcollection = client
        .db("Billing")
        .collection("billingcollection");

      // positng new billing

      app.post("/api/add-billing", async (req, res) => {
        const newbilling = req.body;
        const result = await billingcollection.insertOne(newbilling);
        res.send(result);
      });

      // getting all billing

      app.get("/api/billing-list", async (req, res) => {
        const query = {};
        const cursor = billingcollection.find(query);
        const billing = await cursor.toArray();
        res.send(billing);
      });
    }
    finally{

    }

}
run().catch(console.dir);


app.listen(port, () => {
  console.log("server is running");
});