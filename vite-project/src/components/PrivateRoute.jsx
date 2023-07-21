import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AXIOS_API } from "../lib/axiosAPI";

const PrivateRoute = () => {
  const navigate = useNavigate();

  const isLoggedIn = async () => {
    const res = await AXIOS_API.get("/checkUser")
      .then((res) => {
        console.log(res);
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

export default PrivateRoute;
