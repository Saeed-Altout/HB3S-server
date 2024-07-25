import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import { router } from "./routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/", router);

app.get("/", (_req: Request, res: Response) => {
  res.sendFile(__dirname + "/index.html");
});

const PORT: number = Number(process.env.PORT) || 5002;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
