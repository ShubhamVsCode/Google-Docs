import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AXIOS_API } from "../lib/axiosAPI";

const OneTimeRoute = () => {
  const navigate = useNavigate();

  const isLoggedIn = async () => {
    const res = await AXIOS_API.get("/checkUser")
      .then((res) => {
        return navigate("/", { replace: true });
      })
      .catch((err) => {
        return navigate("/login", { replace: true });
      });
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return <Outlet />;
};

export default OneTimeRoute;
