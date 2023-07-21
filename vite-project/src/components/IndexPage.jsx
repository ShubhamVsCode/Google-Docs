import React, { useEffect, useState } from "react";
import { AXIOS_API } from "../lib/axiosAPI";
import { Link, redirect, useNavigate } from "react-router-dom";

const IndexPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const createNewDocument = async () => {
    const res = await AXIOS_API.post("/documents");
    console.log(res?.data?.document);
    if (res?.data?.document) {
      return navigate(`/document/${res?.data?.document?._id}`);
    }
  };

  const getUser = async () => {
    const res = await AXIOS_API.get("/user");

    if (res?.data?.user) {
      setUser(res?.data?.user);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <section className="px-5 py-3">
      <button
        className="text-xl font-bold h-52 w-44 rounded-md border border-black/20 shadow-md grid place-content-center hover:shadow-xl duration-200"
        onClick={createNewDocument}
      >
        + New
      </button>

      <div>
        {user?.documents?.map((doc, index) => {
          return (
            <Link key={doc} to={`/document/${doc}`}>
              Document {index + 1}
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default IndexPage;
