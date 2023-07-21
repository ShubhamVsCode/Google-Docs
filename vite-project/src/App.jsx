import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function App({ documentId }) {
  const [content, setContent] = useState("");
  const [socket, setSocket] = useState(null);
  const [quillEditor, setQuillEditor] = useState(null);
  const [username, setUsername] = useState(
    JSON.parse(localStorage.getItem("user"))?.name
  );
  const [users, setUsers] = useState([]);

  const quillRef = useRef();

  useEffect(() => {
    // if (quillRef === null || socket === null) return;

    socket?.on("text-change", (delta) => {
      console.log(delta);
      quillEditor?.updateContents(delta);
    });
  }, [socket]);

  useEffect(() => {
    // if (!quillEditor) {
    setQuillEditor(quillRef.current.getEditor());
    // }
  }, [quillRef]);

  const handleInputChange = (value, delta, source, quill) => {
    if (source !== "user") return;
    socket?.emit("text-change", { documentId, delta });
  };

  const submitUsername = () => {
    socket?.emit("username", username);
  };

  useEffect(() => {
    if (quillRef === null || socket === null) return;

    // Join the document room on mount
    socket?.emit("join-document", { documentId: documentId, username });

    return () => {
      // Leave the document room on unmount
      socket?.emit("leave-document", {
        documentId: documentId,
        username,
      });
    };
  }, [socket]);

  useEffect(() => {
    const quillEditor = quillRef.current.getEditor();

    quillEditor.on("selection-change", (range) => {
      socket?.emit("selection-change", { selection: range, username });
    });

    return () => {
      quillEditor.off("selection-change");
    };
  }, [quillRef, socket]);

  useEffect(() => {
    const socket = io("http://localhost:3000");
    setSocket(socket);

    socket.on("connect", () => {
      console.log("Connected to the server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from the server");
    });

    // socket.on("document-content", (documentContent) => {
    //   setContent(documentContent);
    // });

    // socket.on("text-change", (delta) => {
    //   setContent(delta);
    // });

    socket.on("user-joined", (username) => {
      setUsers((prev) => [...prev, username]);
    });

    socket.on("user-left", (username) => {
      setUsers((prev) => prev.filter((user) => user !== username));
    });

    return () => {
      socket.off("document-content");
      socket.off("text-change");
      socket.off("user-joined");
      socket.off("user-left");
    };
  }, []);

  return (
    <div className="text-center">
      {/* {JSON.stringify(users)} */}
      <div className="max-w-6xl m-auto border-black border rounded-lg">
        <ReactQuill
          theme="snow"
          className="min-h-screen"
          value={content}
          onChangeSelection={(selection, source, editor) => {
            if (source === "user") {
              console.log("Selection", selection);
            }
          }}
          onChange={handleInputChange}
          ref={quillRef}
          id="docs"
        />
      </div>
    </div>
  );
}

export default App;
