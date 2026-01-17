import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import complaintsRoutes from "./routes/complaints.js";
import reportRoutes from "./reports/reportRoutes.js";
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json()); // 
app.use(express.urlencoded({ extended: true }));
app.use("/api/complaints", complaintsRoutes);
app.use("/api/reports", reportRoutes);
app.get("/", (req, res) => {
  res.send("Server is running and connected!");
});
const PORT = 5050;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
