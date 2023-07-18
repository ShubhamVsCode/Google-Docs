import { useState, useEffect, useRef } from "react";
import "./App.css";
import io from "socket.io-client";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function App() {
  const [content, setContent] = useState("");
  const [socket, setSocket] = useState(null);
  const [quillEditor, setQuillEditor] = useState(null);
  const [username, setUsername] = useState("");
  // const [username, setUsername] = useState(window.prompt());
  const [users, setUsers] = useState([]);

  const quillRef = useRef();

  useEffect(() => {
    if (quillRef === null || socket === null) return;

    socket.on("new-change", (delta) => {
      quillEditor?.updateContents(delta);
    });
  }, [content, quillRef, socket]);

  useEffect(() => {
    // if (!quillEditor) {
    setQuillEditor(quillRef.current.getEditor());
    // }
  }, [quillRef]);

  useEffect(() => {
    // const s = io("http://localhost:3000");
    const s = io("https://google-docs-production-6f29.up.railway.app/");
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  const handleInputChange = (value, delta, source, quill) => {
    if (source !== "user") return;
    socket.emit("text-change", delta);
  };

  const submitUsername = () => {
    socket.emit("username", username);
  };

  useEffect(() => {
    socket?.on("get-username", (username) => {
      setUsers((prev) => [...prev, username]);
    });

    socket?.on("selection-change", ({ selection, username }) => {
      console.log(username, selection);

      const text = quillEditor?.getText(selection.index, selection.length);
      console.log("User has highlighted: ", text);
    });

    quillEditor?.on("selection-change", (selection) => {
      socket.emit("selection-change", { selection, username });
    });

    let range = quillEditor?.getSelection();
    // console.log(quillEditor?.selection);
    if (range) {
      if (range.length == 0) {
        console.log("User cursor is at index", range.index);
      } else {
        var text = quill.getText(range.index, range.length);
        console.log("User has highlighted: ", text);
      }
    } else {
      console.log("User cursor is not in editor");
    }
  }, [socket]);

  return (
    <div className="container">
      {/* <input type="text" onChange={(e) => setUsername(e.target.value)} />
      <button onClick={submitUsername}>Set UserName</button> */}
      {/* {JSON.stringify(users, null, 2)} */}
      <h1>Google Dcos</h1>
      <ReactQuill
        theme="snow"
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
  );
}

export default App;
