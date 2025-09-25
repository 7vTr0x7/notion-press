import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { initializeDB } from "./db/db.connect.js";
import bookRouter from "./routes/book.routes.js";

config();
const app = express();

app.use(express.json());

const PORT = process.env.PORT;

const corsOptions = {
  origin: "*",
  credentials: true,
};

app.use(cors(corsOptions));

app.use("/api", bookRouter);

initializeDB();

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
