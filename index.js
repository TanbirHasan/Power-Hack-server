const express = require("express");

const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

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



mongoose
  .connect(`mongodb+srv://${process.env.DB_user}:${process.env.DB_PASS}@cluster0.yecar.mongodb.net/?retryWrites=true&w=majority`)
  .then(() => console.log("db connection successfull"))
  .catch((err) => console.log(err));


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



     app.put("/api/update-billing/:id", async (req, res) => {
        const id = req.params.id;
       const userInfo = req.body;
     
     
      
       const result = await billingcollection.updateOne(
         { _id: id },
         { $set: { fullname:req.body.fullname,email:req.body.email,phone:req.body.phone,paidamount:req.body.paidamount } },
         { upsert: true }
       );

       res.send(result);
     });

   //  search result

     app.get("/search", (req,res) => {
      const {q} = req.query;
      console.log(q);

      // const keys = ["fullname","email","phone"];

      // const search = (data) => {
      //   return data.filter((item) => {
      //     keys.some((key) => item[key].toLowerCase().includes(q))

      //   })



      // }

      const users = billingcollection.find({$regex:q})
      res.send(users);



        
     })


     app.post("/api/register", async (req, res) => {
       console.log(req.body);
       try {
         const newPassword = await bcrypt.hash(req.body.password, 10);
         await User.create({
           name: req.body.name,
           email: req.body.email,
           password: newPassword,
         });
         res.json({ status: "ok" });
       } catch (err) {
         res.json({ status: "error", error: "Duplicate email" });
       }
     });

     app.post("/api/login", async (req, res) => {
       const user = await User.findOne({
         email: req.body.email,
       });

       if (!user) {
         return { status: "error", error: "Invalid login" };
       }

       const isPasswordValid = await bcrypt.compare(
         req.body.password,
         user.password
       );

       if (isPasswordValid) {
         const token = jwt.sign(
           {
             name: user.name,
             email: user.email,
           },
           "secret123"
         );

         return res.json({ status: "ok", user: token });
       } else {
         return res.json({ status: "error", user: false });
       }
     });

     app.get("/api/quote", async (req, res) => {
       const token = req.headers["x-access-token"];

       try {
         const decoded = jwt.verify(token, "secret123");
         const email = decoded.email;
         const user = await User.findOne({ email: email });

         return res.json({ status: "ok", quote: user.quote });
       } catch (error) {
         console.log(error);
         res.json({ status: "error", error: "invalid token" });
       }
     });

     app.post("/api/quote", async (req, res) => {
       const token = req.headers["x-access-token"];

       try {
         const decoded = jwt.verify(token, "secret123");
         const email = decoded.email;
         await User.updateOne(
           { email: email },
           { $set: { quote: req.body.quote } }
         );

         return res.json({ status: "ok" });
       } catch (error) {
         console.log(error);
         res.json({ status: "error", error: "invalid token" });
       }
     });


    }
    finally{

    }

}
run().catch(console.dir);


app.listen(port, () => {
  console.log("server is running");
});