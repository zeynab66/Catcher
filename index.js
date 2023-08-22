const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();

app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const dbName = "catchgame";

    // Check if the "catchgame" database exists, and create it if not
    db.listCollections({ name: dbName }).next((err, collinfo) => {
      if (!collinfo) {
        db.createCollection(dbName, (err, result) => {
          if (err) {
            console.error("Error creating collection:", err);
          } else {
            console.log(`Database "${dbName}" created`);
          }
        });
      }
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

const playerSchema = new mongoose.Schema({
  name: String,
  score: Number,
});

const Player = mongoose.model("Player", playerSchema);

app.post("/addPlayer", async (req, res) => {
  const { name, score } = req.body;
  console.log("addPlayer:", req.body);
  try {
    const player = new Player({ name, score });
    await player.save();
    res.status(200).send("Player added successfully");
  } catch (error) {
    res.status(500).send("Error adding player");
  }
});

app.get("/leaderboard", async (req, res) => {
  try {
    const topPlayers = await Player.find().sort({ score: -1 }).limit(100);
    res.status(200).json(topPlayers);
  } catch (error) {
    res.status(500).send("Error getting leaderboard");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
