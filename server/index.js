const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const ChallengeEntry = mongoose.model(
  "ChallengeEntry",
  new mongoose.Schema({
    date: Date,
    username: String,
    score: Number,
  })
);

app.use(express.json());

// Post route for submitting score
app.post("/submit", async (req, res) => {
  const { points, username } = req.body;
  let challengeEntry = new ChallengeEntry();
  challengeEntry.date = new Date();
  challengeEntry.score = points;
  challengeEntry.username = username;

  await challengeEntry.save();

  res.end();
});

// Returns sorted leaderboard
app.get("/", async (req, res) => {
  const challengeEntries = await ChallengeEntry.find();
  let nameMap = new Map();
  for (const entry of challengeEntries) {
    const mapEntry = nameMap.get(entry.username);
    if ((mapEntry && mapEntry < entry.score) || !mapEntry) {
      nameMap.set(entry.username, entry.score);
    }
  }
  const leaderboard = Array.from(nameMap.entries())
    .map(([username, score]) => ({ username, score }))
    .sort((a,b) => b.score - a.score)
    .slice(0, 10);

  res.json(leaderboard);
});

mongoose.connect(process.env.DB_CONN_STR).then(() =>
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  })
);
