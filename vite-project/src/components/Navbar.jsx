import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AXIOS_API } from "../lib/axiosAPI";

const Navbar = () => {
  const navigate = useNavigate();
  const [userToken, setUserToken] = useState("");
  const [user, setUser] = useState({});

  const logout = async () => {
    await AXIOS_API.get("/logout")
      .then((res) => res.data)
      .then((res) => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUserToken("");
        setUser({});
        return navigate("/login", {
          replace: true,
        });
      })
      .catch((err) => {
        return navigate("/login", {
          replace: true,
        });
      });
  };

  const getUser = async () => {
    const user = await AXIOS_API.get("/user")
      .then((res) => {
        setUser(res.data?.user);
        localStorage.setItem("user", JSON.stringify(res.data?.user));
        return res.data?.user;
      })
      .catch((err) => {
        return err.message;
      });
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      setUserToken(localStorage.getItem("token"));
    }
  }, [localStorage.getItem("token")]);

  useEffect(() => {
    if (localStorage.getItem("user")) {
      setUser(JSON.parse(localStorage.getItem("user")));
    }
  }, [localStorage.getItem("user")]);

  useEffect(() => {
    getUser();
  }, []);

  return (
    <nav className="flex justify-between">
      <ul className="flex gap-10 px-20 py-5 border-b">
        <li>
          <NavLink exact to="/" activeClassName="active">
            Home
          </NavLink>
        </li>
        {userToken ? (
          <li>
            <button onClick={logout}>Logout</button>
          </li>
        ) : (
          <>
            <li>
              <NavLink to="/login" activeClassName="active">
                Login
              </NavLink>
            </li>
            <li>
              <NavLink to="/register" activeClassName="active">
                Register
              </NavLink>
            </li>
          </>
        )}
      </ul>

      {/* {userToken && (
        <div className="flex gap-10">
          Email : <span>{user?.email}</span>
        </div>
      )} */}
    </nav>
  );
};

export default Navbar;
