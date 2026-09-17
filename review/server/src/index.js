import express from "express";
import cors from "cors";

const port = process.env.PORT;
const app = express();

const games = [];

app.use(cors());

app.use(express.json({ limit: "10kb" }));

app.get("/boards", (req, res) => {
  res.json(games);
});

app.post("/boards", (req, res) => {
  console.log(req.body);

  games.push(req.body);

  res.json({ message: "Game Saved" });
});

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});