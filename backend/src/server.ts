import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { parseTransactions } from "./services/geminiService";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.post("/api/parse", async (req, res) => {
  try {
    const { text, mimeType, data } = req.body;

    let result;

    if (data && mimeType) {
      result = await parseTransactions("", { mimeType, data });
    } else if (text) {
      result = await parseTransactions(text);
    } else {
      return res.status(400).json({ error: "No input provided" });
    }

    res.send(result); // send raw CSV
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});


app.listen(5000, () => {
  console.log("Backend running on port 5000");
});



