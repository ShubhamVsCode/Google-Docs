const Document = require("../model/documentModel");
const User = require("../model/userModel");
const applyDeltaChanges = require("../utils/jsonPatch");
const { mergeDeltas } = require("../utils/textEditing");

const deltaQueue = {};

const socketHandler = (socket) => {
  socket.on("join-document", async ({ documentId, user }) => {
    try {
      // Join the document room
      socket.join(documentId);
      // socket.join(user?.email);

      console.log(`User: ${user?.name || user} Joined Document: ${documentId}`);

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
    console.log(`User: ${user?.name || user} Left the Document: ${documentId}`);
    // Leave the document room
    socket.leave(documentId);

    // Broadcast to other users in the document room that a user has left
    socket.to(documentId).emit("user-left", user);
  });

  socket.on("text-change", async ({ documentId, delta }) => {
    try {
      // Broadcast the text change to all users in the document room
      socket.to(documentId).emit("text-change", delta);

      // Store the delta in the queue for the specific documentId
      if (!deltaQueue[documentId]) {
        deltaQueue[documentId] = [];
      }
      deltaQueue[documentId].push(delta);

      // If there's no timer set for the documentId, set one to save deltas after 2 seconds
      if (!deltaQueue[documentId].timer) {
        socket.to(documentId).emit("saving-document", true);
        console.log("Saving document: ", documentId);
        deltaQueue[documentId].timer = setTimeout(async () => {
          try {
            const document = await Document.findById(documentId);
            document.changes.push(...deltaQueue[documentId]);
            await document.save();
            console.log("Saved document: ", documentId);
            socket.to(documentId).emit("saving-document", false);
            // Clear the queue and timer for this documentId
            delete deltaQueue[documentId];
          } catch (error) {
            console.error("Error saving text changes:", error);
          }
        }, 2000); // 1000ms delay
      }
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

  socket.on("share-document", async ({ documentId, toEmail, fromEmail }) => {
    const user = await User.findOne({ email: toEmail });
    user?.sharedDocuments?.push({
      sharedBy: fromEmail,
      document: documentId,
    });
    await user.save();

    socket.to(toEmail).emit("share-document", documentId);
  });

  socket.on("disconnect", () => {
    // console.log("User disconnected\n");
  });
};

module.exports = { socketHandler };
