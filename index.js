const express = require("express");

const cors = require("cors");

require("dotenv").config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
        console.log(newbilling)
        const result = await billingcollection.insertOne(newbilling);
        res.send(result);
      });

      // getting all billing

      app.get("/api/billing-list", async (req, res) => {
        const page = parseInt(req.query.page);
        const size = parseInt(req.query.size);
        const query = {};
        const cursor = billingcollection.find(query).sort({_id:-1});
        let billings;
        if (page || size) {
          billing = await cursor
            .skip(page * size)
            .limit(size)
            .toArray();
        } else {
          billing = await cursor.toArray();
        }

        res.send(billing);
      });

      // getting billings number for pagination

      app.get("/api/billings-count", async (req, res) => {
        const query = {};
        const cursor = billingcollection.find(query);
        const count = await cursor.count();
        res.send({ count });
      });

      // Deleting the billing list
      app.delete("/api/delete-billing/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = billingcollection.deleteOne(query);
        res.send(result);
      });



    //  app.put("/api/update-billing/:id", async (req, res) => {
    //     const id = req.params.id;
    //    const userInfo = req.body;
     
     
      
    //    const result = await billingcollection.updateOne(
    //      { _id:  ObjectId(id) },
    //      { $set: { fullname:req.body.fullname,email:req.body.email,phone:req.body.phone,paidamount:req.body.paidamount } },
    //      { upsert: true }
    //    );

    //    res.send(result);
    //  });

     // search result

     app.get("/api/billings/search", async (req,res) => {
          try {
            const searchParams = req.query;
            console.log(searchParams);
            const result = await billingcollection.find(searchParams);
            if (!result) throw Error("Error, No result Found...!");
            res.status(200).json(result);
          } catch (err) {
            res.status(400).json({ msg: err });
          }
     })


    }
    finally{

    }

}
run().catch(console.dir);


app.listen(port, () => {
  console.log("server is running");
});