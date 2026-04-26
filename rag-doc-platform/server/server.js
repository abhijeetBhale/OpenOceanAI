import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import queryRoutes from "./routes/queryRoutes.js";
import suggestedQuestionsRoutes from "./routes/suggestedQuestionsRoutes.js";
import compareRoutes from "./routes/compareRoutes.js";
import jobsRoutes from "./routes/jobsRoutes.js";
import shareRoutes from "./routes/shareRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import atsRoutes from "./routes/atsRoutes.js";
import langchainRoutes from "./routes/langchainRoutes.js";
import summaryRoutes from "./routes/summaryRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/uploads", express.static("uploads"));

// Connect to database
await connectDB();

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// All routes are now public (no authentication required)
app.use("/api/upload", uploadRoutes);
app.use("/api/ask", queryRoutes);
app.use("/api/suggested-questions", suggestedQuestionsRoutes);
app.use("/api/compare", compareRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/share", shareRoutes);
app.use("/api/ats-score", atsRoutes);
app.use("/api/langchain", langchainRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/chat", chatRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
