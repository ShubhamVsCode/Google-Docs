const documentUsers = {};

const socketHandlerNext = (socket) => {
  //   console.log("User connected");

  socket.on("join-document", ({ documentId, user }) => {
    socket.join(documentId);
    console.log(`User: ${user} Joined Document: ${documentId}`);

    if (documentUsers.hasOwnProperty(documentId)) {
      documentUsers[documentId].push({ user, socket: socket.id });
      socket
        .to(documentUsers[documentId][0].socket)
        .emit("another-user-joined", { user, socket: socket.id });
      console.log(`Another User Joined Document`);
    } else {
      documentUsers[documentId] = [{ user, socket: socket.id }];
    }
    console.log({
      documentUsers,
    });
  });

  socket.on("text-change", async ({ documentId, delta }) => {
    socket.to(documentId).emit("text-changed", { delta });
  });

  socket.on("send-content", ({ user, socketId, content }) => {
    console.log(`User: ${user} Sent Content to socketId: ${socketId}`);
    socket.to(socketId).emit("receive-content", { user, content });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
};

module.exports = { socketHandlerNext };
