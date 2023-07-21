const Document = require("../model/documentModel");
const applyDeltaChanges = require("../utils/jsonPatch");
const { mergeDeltas } = require("../utils/textEditing");

const socketHandler = (socket) => {
  socket.on("join-document", async ({ documentId, user }) => {
    try {
      // Join the document room
      socket.join(documentId);

      console.log(`User: ${user?.name || user} joined Document: ${documentId}`);

      // Broadcast to other users in the document room that a user has joined
      socket.to(documentId).emit("user-joined", user);

      // Get the document from the database
      const document = await Document.findById(documentId);

      // Send the current document content to the newly joined user
      socket.emit("document-content", document.content);
      // const mergedDeltas = mergeDeltas(document.changes);
      // console.log("All Deltas", mergedDeltas);
      socket.emit("document-changes", document.changes);
    } catch (error) {
      console.error("Error joining document:", error);
    }
  });

  socket.on("leave-document", ({ documentId, user }) => {
    console.log(`User: ${user} Left the Document: ${documentId}`);
    // Leave the document room
    socket.leave(documentId);

    // Broadcast to other users in the document room that a user has left
    socket.to(documentId).emit("user-left", user);
  });

  socket.on("text-change", async ({ documentId, delta }) => {
    try {
      // Broadcast the text change to all users in the document room
      socket.to(documentId).emit("text-change", delta);
      const document = await Document.findById(documentId);
      document.changes.push(delta);
      await document.save();
    } catch (error) {
      console.error("Error handling text change:", error);
    }
  });

  socket.on("save-changes", async ({ documentId, delta }) => {
    console.log("Saving changes");
    console.log("Document Id", documentId);
    console.log("Delta", delta);

    // Update the document content with the received delta
    // const document = await Document.findById(documentId);
    // document.changes.push(delta);
    // await document.save();
  });

  socket.on("selection-change", ({ documentId, selection, user }) => {
    // Broadcast the selection change to all users in the document room
    socket.to(documentId).emit("selection-change", { selection, user });
  });

  socket.on("disconnect", () => {
    // console.log("User disconnected\n");
  });
};

module.exports = { socketHandler };
