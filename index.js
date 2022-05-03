const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
require("dotenv").config();

app.use(express.json());
app.use(cors());
//shahadat
//FNxprarHn96jjd2G

const uri = `mongodb+srv://${process.env.USER_ID}:${process.env.USER_PASS}@cluster0.otl3x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const bikeCollection = client.db("bike").collection("machine");

    // json token
    app.post("/login", (req, res) => {
      const email = req.body;

      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET);
      console.log(token);
      res.send({ token });
    });

    //get
    app.get("/items", async (req, res) => {
      const query = req.params;
      const cursor = bikeCollection.find(query);
      const result = await cursor.toArray();

      res.send(result);
    });

    //post
    app.post("/item", async (req, res) => {
      const bike = req.body;
      const tokenInfo = req.headers.authorization;

      const [email, accessToken] = tokenInfo.split(" ");
      const decoded = verifyToken(accessToken);
      console.log("de jwt", decoded);
      console.log(decoded, decoded.email);
      if (email === decoded.email) {
        const result = await bikeCollection.insertOne(bike);
        res.send(result);
      } else {
        res.send({ success: "UnAuthorized Access" });
      }
      // const result = await bikeCollection.insertOne(bike);
      // res.send(result);
    });

    //delete
    app.delete("/item/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };

      const result = await bikeCollection.deleteOne(query);
      res.send(result);
    });
    //get oneItem data
    app.get("/item/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };

      const result = await bikeCollection.findOne(query);
      res.send(result);
    });

    //update
    app.put("/item/:id", async (req, res) => {
      const id = req.params.id;
      const updateQuantity = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          quantity: updateQuantity.quantity,
        },
      };
      const result = await bikeCollection.updateOne(filter, updateDoc, options);
      console.log(result);
      res.send(result);
    });

    // one item delivered
    app.put("/item/:id", async (req, res) => {
      const id = req.params.id;
      const deliveredQuantity = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          quantity: deliveredQuantity.oneItemDelivered,
        },
      };
      const result = await bikeCollection.updateOne(filter, updateDoc, options);
      console.log(result);
    });
  } finally {
  }
}
run().catch(console.dir);

// client.connect((err) => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

function verifyToken(token) {
  let email;
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      email = "Invalid email";
    }
    if (decoded) {
      console.log(decoded);
      email = decoded;
    }
  });
  return email;
}
