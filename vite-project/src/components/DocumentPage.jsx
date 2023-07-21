import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import App from "../App";
import NewDocument from "./NewDocument";

const DocumentPage = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();

  if (!documentId) return navigate("/");

  return (
    <div>
      {/* <App documentId={documentId} /> */}
      <NewDocument documentId={documentId} />
    </div>
  );
};

export default DocumentPage;
