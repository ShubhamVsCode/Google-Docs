import io from "socket.io-client";
import { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import Delta from "quill-delta";
import "react-quill/dist/quill.snow.css";

const SAVE_DURATION_MS = 2000;

const NewDocument = ({ documentId }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [content, setContent] = useState("");
  const [socket, setSocket] = useState(null);
  const [quillEditor, setQuillEditor] = useState(null);
  const [changes, setChanges] = useState([]);
  const quillRef = useRef();

  const handleInputChange = (value, delta, source, quill) => {
    if (source !== "user") return;
    socket?.emit("text-change", { delta, documentId });
  };

  useEffect(() => {
    // const s = io("http://localhost:3000");
    const s = io("https://google-docs-abot.onrender.com/");
    setSocket(s);
  }, []);

  useEffect(() => {
    if (!socket) return;
    if (!quillEditor) return;

    socket.on("connect", () => {
      console.log("Connected to the server");
    });

    // socket.on("text-change", (delta) => {
    //   console.log("Text changed", delta);
    //   quillEditor?.updateContents(delta);
    // });
  }, [socket]);

  useEffect(() => {
    if (quillRef === null || socket === null) return;
    socket.emit("join-document", { documentId, user });
    socket.on("user-joined", (user) => {
      console.log("User joined the server", user?.name);
    });

    socket.on("document-changes", (changes) => {
      const merged = mergeDeltas(changes);
      quillRef?.current?.getEditor()?.updateContents(merged);
    });

    socket.on("text-change", (delta) => {
      quillRef?.current?.getEditor()?.updateContents(delta);
      // setChanges((prev) => [...prev, delta]);
    });

    // const interval = setInterval(() => {
    //   // const merged = mergeDeltas(changes);
    //   // socket.emit("save-changes", { documentId, delta: changes });
    // }, SAVE_DURATION_MS);

    return () => {
      // clearInterval(interval);
    };
  }, [content, quillRef, quillEditor, socket]);

  useEffect(() => {
    const quillEditor = quillRef.current.getEditor();

    quillEditor.on("selection-change", (range) => {
      socket?.emit("selection-change", { selection: range, user });
    });

    return () => {
      quillEditor.off("selection-change");
    };
  }, [quillRef, socket]);

  return (
    <main>
      <div className="max-w-6xl m-auto border-black border rounded-lg">
        <ReactQuill
          theme="snow"
          className="min-h-screen"
          value={content}
          //   onChangeSelection={(selection, source, editor) => {
          //     if (source === "user") {
          //       console.log("Selection", selection);
          //     }
          //   }}
          onChange={handleInputChange}
          ref={quillRef}
          id="docs"
        />
      </div>
    </main>
  );
};

function mergeDeltas(deltasArray) {
  if (deltasArray.length === 0) {
    return new Delta(); // Return an empty delta if the array is empty
  }

  let mergedDelta = new Delta(deltasArray[0]); // Initialize the mergedDelta with the first delta

  for (let i = 1; i < deltasArray.length; i++) {
    const nextDelta = new Delta(deltasArray[i]);
    mergedDelta = mergedDelta.compose(nextDelta); // Merge the next delta into the current mergedDelta
  }

  return mergedDelta;
}

export default NewDocument;
