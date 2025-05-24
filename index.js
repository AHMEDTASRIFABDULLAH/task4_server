const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");
const corsOptions = {
  origin: ["http://localhost:5173"],
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
