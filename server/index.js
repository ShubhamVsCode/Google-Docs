const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

let documentContent = "";

io.on("connection", (socket) => {
  console.log("User connected\n");

  socket.on("username", (username) => {
    console.log(username);
    socket.broadcast.emit("get-username", username);
  });

  socket.on("text-change", (delta) => {
    socket.broadcast.emit("new-change", delta);
  });

  socket.on("selection-change", ({ selection, username }) => {
    socket.broadcast.emit("selection-change", { selection, username });
  });

  // Handle updates from the client
  socket.on("update", (content) => {
    // Update the document content
    documentContent = content;

    // Broadcast the updated content to all connected clients
    socket.broadcast.emit("content", content);
  });
});

io.on("disconnect", () => {
  console.log("User disconnected");
});

// Start the server
const port = 3000;
http.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
