require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    // origin: ["https://guileless-lebkuchen-42e91f.netlify.app"],
  },
});

const authRoutes = require("./routes/auth");
const documentRoutes = require("./routes/document");
const { socketHandler } = require("./sockets/socketHandler");

app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:5173",
      "https://guileless-lebkuchen-42e91f.netlify.app",
    ],
  })
);
app.use(cookieParser());

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Failed to connect to MongoDB", error));

// HTTP API Routes
app.get("/info", (req, res) => {
  return res.send("Server running ");
});
app.use("/api", authRoutes);
app.use("/api/documents", documentRoutes);

// Web Sockets
io.on("connection", socketHandler);

io.on("disconnect", () => {
  console.log("User disconnected");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ message: "Internal server error" });
});

// Start the server
const port = 3000;
http.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
