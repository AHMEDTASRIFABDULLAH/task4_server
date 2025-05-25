const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
app.use(express.json());
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const corsOptions = {
  origin: ["https://itransition4.netlify.app"],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
const uri = `mongodb+srv://${process.env.TASK_USERS}:${process.env.TASK_PASS}@cluster0.hwzxp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    const db = client.db("userAppDB");
    const usersCollection = db.collection("usersCollection");
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    app.post("/register", async (req, res) => {
      const user = req.body;
      const email = user.email;
      try {
        const result = await usersCollection.insertOne(user);
        res.send(result);
      } catch (err) {
        if (err.code === 11000) {
          const existingUser = await usersCollection.findOne({ email });

          if (existingUser?.status === "blocked") {
            return res
              .status(403)
              .send({ message: "You are blocked. Contact support." });
          }
          return res
            .status(409)
            .send({ message: "You are already registered. Please login." });
        }
        return res
          .status(500)
          .send({ message: "Registration failed", error: err });
      }
    });
    app.post("/login", async (req, res) => {
      const { email, password } = req.body;
      const user = await usersCollection.findOne({ email });
      if (!user) {
        return res.status(404).send({ message: "Please register first." });
      }
      if (user.password !== password) {
        return res.status(401).send({ message: "Invalid email or password." });
      }
      if (user.status === "blocked") {
        return res.status(403).send({ message: "Your account is blocked" });
      }
      res.send({ message: "Login successful", user });
    });
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });
    app.delete("/delete", async (req, res) => {
      const ids = req.body.ids;
      const objectIds = ids.map((id) => new ObjectId(id));
      const result = await usersCollection.deleteMany({
        _id: { $in: objectIds },
      });
      res.send(result);
    });
    app.patch("/blocked", async (req, res) => {
      const { ids, status } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res
          .status(400)
          .send({ message: "Please select users to block" });
      }
      const objectIds = ids.map((id) => new ObjectId(id));
      const alreadyBlocked = await usersCollection.findOne({
        _id: { $in: objectIds },
        status: "blocked",
      });

      if (alreadyBlocked) {
        return res.status(403).send({
          message: `Some selected user's are already blocked. Cannot update.`,
        });
      }
      const result = await usersCollection.updateMany(
        { _id: { $in: objectIds } },
        { $set: { status: status } }
      );

      res.send(result);
    });
    app.patch("/unblocked", async (req, res) => {
      const { ids, status } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res
          .status(400)
          .send({ message: "Please select users to active" });
      }
      const objectIds = ids.map((id) => new ObjectId(id));
      const alreadyActive = await usersCollection.findOne({
        _id: { $in: objectIds },
        status: "active",
      });

      if (alreadyActive) {
        return res.status(403).send({
          message: `Some selected user's are already Active. Cannot update.`,
        });
      }
      const result = await usersCollection.updateMany(
        { _id: { $in: objectIds } },
        { $set: { status: status } }
      );
      res.send(result);
    });
    app.patch("/update-time", async (req, res) => {
      const { email, logoutAt } = req.body;
      const result = await usersCollection.updateOne(
        { email: email },
        { $set: { createdAt: logoutAt } }
      );

      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Task4 server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
