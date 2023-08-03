import io from "socket.io-client";
import { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import Delta from "quill-delta";
import "react-quill/dist/quill.snow.css";
import { AXIOS_API } from "../lib/axiosAPI";
import ShareDocumentModal from "./ShareDocumentModal";

const SAVE_DURATION_MS = 2000;
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
];

const NewDocument = ({ documentId }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [users, setUsers] = useState([]);
  const [content, setContent] = useState("");
  const [socket, setSocket] = useState(null);
  const [quillEditor, setQuillEditor] = useState(null);
  const [changes, setChanges] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const quillRef = useRef();

  const [title, setTitle] = useState("");
  const [prevTitle, setPrevTitle] = useState("");

  // shareDocumentmodal
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const handleInputChange = (value, delta, source, quill) => {
    if (source !== "user") return;
    socket?.emit("text-change", { delta, documentId });
    socket?.emit("current-value", value);
  };

  useEffect(() => {
    const s = io(
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://google-docs-abot.onrender.com/"
    );
    setSocket(s);
  }, []);

  useEffect(() => {
    if (!socket) return;
    if (!quillEditor) return;

    socket.on("connect", () => {
      console.log("Connected to the server");
      setUsers([user]);
    });

    setQuillEditor(quillRef?.current?.getEditor());
  }, [socket, quillRef, quillEditor, user]);

  useEffect(() => {
    if (quillRef === null || socket === null) return;
    socket.emit("join-document", { documentId, user });
    socket.on("user-joined", (user) => {
      console.log("User joined the server", user?.name);
    });

    socket.on("document-changes", (changes) => {
      // const merged = mergeDeltas(changes);
      console.log("Document Change Socket---------------");
      // quillRef?.current?.getEditor()?.updateContents(merged);

      changes?.map((change) =>
        quillRef?.current?.getEditor()?.updateContents(change)
      );
    });

    socket.on("text-change", (delta) => {
      quillRef?.current?.getEditor()?.updateContents(delta);
      console.log("Text Change Socket---------------");
      // setChanges((prev) => [...prev, delta]);
    });

    const leftDoc = () => socket.emit("leave-document", { documentId, user });

    window.addEventListener("beforeunload", leftDoc);

    return () => {
      console.log("Component Unmounted Successfully");
      socket.emit("leave-document", { documentId, user });
      window.removeEventListener("beforeunload", leftDoc);
    };
  }, [quillRef, socket, documentId, user]);

  useEffect(() => {
    const quillEditor = quillRef.current.getEditor();

    quillEditor.on("selection-change", (range) => {
      socket?.emit("selection-change", { selection: range, user });
    });

    return () => {
      quillEditor.off("selection-change");
    };
  }, [quillRef, socket]);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     // const merged = mergeDeltas(changes);
  //     // console.log(changes);
  //     // socket?.emit("save-changes", { documentId, delta: changes });
  //   }, SAVE_DURATION_MS);

  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, [changes, socket, SAVE_DURATION_MS]);

  function addUsers(newUser) {
    setUsers((prevUsers) => {
      const filteredUsers = prevUsers.filter(
        (user) => user._id !== newUser?._id
      );
      return [...filteredUsers, newUser];
    });
  }

  function removeUsers(user) {
    console.log(user);
  }

  useEffect(() => {
    if (!socket) return;
    socket?.on("user-joined", addUsers);
    socket?.on("leave-document", removeUsers);

    return () => {
      setUsers([]);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    socket?.on("saving-document", (save) => {
      setIsSaving(save);
    });
    socket?.on("leave-document", removeUsers);

    return () => {
      setUsers([]);
    };
  }, [socket]);

  useEffect(() => {
    AXIOS_API.get(`/documents/${documentId}`)
      .then((res) => {
        setTitle(res?.data?.document?.title);
        setPrevTitle(res?.data?.document?.title);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  function shareDocument(email) {
    console.log("Sharing Document to:", email);
    if (!email) return;
    socket?.emit("share-document", {
      documentId,
      toEmail: email,
      fromEmail: user?.email,
    });
  }

  return (
    <main>
      <h2 className="text-2xl text-center my-2">
        <input
          type="text"
          value={title}
          className="text-center hover:border border border-transparent hover:border-black/40 rounded px-1"
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => {
            if (prevTitle == title) return;

            AXIOS_API.put(`/documents/${documentId}`, {
              title: title,
            })
              .then((res) => {
                setPrevTitle(res?.data?.document?.title);
              })
              .catch((err) => {
                console.log(err);
              });
          }}
        />
      </h2>

      <button
        onClick={() => setShareModalOpen(true)}
        className="absolute top-[68px] right-20 bg-green-100 flex items-center px-4 py-2 rounded-full gap-1 border border-green-400"
      >
        <img
          className="object-contain w-4 rotate-180"
          src="/share-button.png"
          alt="Share Icon"
        />
        Share
      </button>

      <ShareDocumentModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareDocumentFunction={shareDocument}
      />

      <div className="max-w-6xl m-auto border-black/30 border shadow-xl rounded-lg">
        {/* {isSaving ? "Saving changes..." : "Saved changes"} */}

        {/* {users.reduce(
          (prev, current) => prev + ", " + current?.name,
          user?.name
        )} */}

        <ReactQuill
          theme="snow"
          className="min-h-screen"
          //   onChangeSelection={(selection, source, editor) => {
          //     if (source === "user") {
          //       console.log("Selection", selection);
          //     }
          //   }}
          onChange={handleInputChange}
          ref={quillRef}
          id="docs"
          modules={{
            toolbar: TOOLBAR_OPTIONS,
          }}
        />
      </div>
    </main>
  );
};

// function mergeDeltas(deltasArray) {
//   if (deltasArray.length === 0) {
//     return new Delta(); // Return an empty delta if the array is empty
//   }

//   let mergedDelta = new Delta(deltasArray[0]); // Initialize the mergedDelta with the first delta

//   for (let i = 1; i < deltasArray.length; i++) {
//     const nextDelta = new Delta(deltasArray[i]);
//     mergedDelta = mergedDelta.compose(nextDelta); // Merge the next delta into the current mergedDelta
//   }

//   return mergedDelta;
// }

export default NewDocument;
