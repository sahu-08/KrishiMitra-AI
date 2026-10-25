import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./Database/db.js";
import userRoutes from "./routes/userRoutes.js";
import cropRoutes from "./routes/cropRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();
const PORT = process.env.PORT || 7000;

await connectDB();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET || "krishimitra-dev-secret"));

app.get("/", (req, res) => {
  res.json({ message: "KrishiMitra AI API is running" });
});

app.use("/api/auth", userRoutes);
app.use("/api/crops", cropRoutes);
app.use("/api/chat", chatRoutes);

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
