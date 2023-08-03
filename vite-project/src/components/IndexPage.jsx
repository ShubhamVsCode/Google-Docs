import React, { useEffect, useState } from "react";
import { AXIOS_API } from "../lib/axiosAPI";
import { Link, redirect, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const IndexPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [sharedDocuments, setSharedDocuments] = useState([]);

  const createNewDocument = async () => {
    const res = await AXIOS_API.post("/documents");
    console.log(res?.data?.document);
    if (res?.data?.document) {
      return navigate(`/document/${res?.data?.document?._id}`);
    }
  };

  const getUser = async () => {
    const res = await AXIOS_API.get("/user?withDocument=true");

    if (res?.data?.user) {
      setUser(res?.data?.user);
      setSharedDocuments(res?.data?.user?.sharedDocuments);
    }
  };

  // Get Shared Documents
  const getSharedDocuments = () => {
    AXIOS_API.get("/user/sharedDocuments")
      .then((res) => {
        setSharedDocuments(res?.data?.sharedDocuments);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getUser();
  }, []);

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

    socket.on("share-document", (docId) => {
      getSharedDocuments();
    });
  }, [socket]);

  return (
    <section className="px-5 py-3">
      <h1 className="my-2 text-3xl font-semibold ">Create Document</h1>

      <button
        className="text-xl font-bold h-52 w-44 rounded-md border border-black/20 shadow-md grid place-content-center hover:shadow-xl duration-200"
        onClick={createNewDocument}
      >
        + New
      </button>

      <section className="my-5">
        <h1 className="my-2 text-xl">All Documents</h1>
        <div
          className="grid sm:grid-cols-2
        md:grid-cols-3
        xl:grid-cols-5
        grid-cols-1 gap-10"
        >
          {user?.documents?.length === 0 ? (
            <h1>No Documents Available</h1>
          ) : (
            user?.documents?.map((doc, index) => {
              return (
                <Link
                  key={doc?._id}
                  to={`/document/${doc?._id}`}
                  className="rounded-full text-lg border shadow-lg px-5 py-3 flex justify-between items-center"
                >
                  <h1>{doc?.title}</h1>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      AXIOS_API.delete(`/documents/${doc?._id}`)
                        .then((res) => {
                          getUser();
                        })
                        .catch((err) => {
                          console.log(err);
                        });
                    }}
                    className="w-6"
                  >
                    <img
                      className="object-contain"
                      src="/trash.png"
                      alt="Delete Icon"
                    />
                  </button>
                </Link>
              );
            })
          )}
        </div>
      </section>

      <section className="my-5">
        <h1 className="my-2 text-xl">Shared Documents</h1>
        <div
          className="grid sm:grid-cols-2
        md:grid-cols-3
        xl:grid-cols-5
        grid-cols-1 gap-10"
        >
          {user?.sharedDocuments?.length === 0 ? (
            <h1>No Shared Documents Available</h1>
          ) : (
            user?.sharedDocuments?.map((doc, index) => {
              return (
                <Link
                  key={doc?.document?._id + index}
                  to={`/document/${doc?.document?._id}`}
                  className="rounded-xl text-lg border border-green-200 bg-green-100/50 shadow-lg px-5 py-3 flex justify-between items-center"
                >
                  <div>
                    <h1>{doc?.document?.title}</h1>
                    <p className="text-sm">Shared by: {doc?.sharedBy}</p>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </section>
    </section>
  );
};

export default IndexPage;
