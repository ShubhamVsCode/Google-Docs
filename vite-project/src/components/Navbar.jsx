import { useEffect, useState } from "react";
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
        console.log(res);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUserToken("");
        setUser({});
        return navigate("/login", {
          replace: true,
        });
      })
      .catch((err) => {
        console.log(err);
        return navigate("/login", {
          replace: true,
        });
      });
  };

  const getUser = async () => {
    await AXIOS_API.get("/user")
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
    <nav className="">
      <ul className="flex gap-10 px-20 py-5 border-b justify-between">
        <li>
          <NavLink exact={"true"} to="/">
            Home
          </NavLink>
        </li>
        {user?.email && <div className="flex gap-10">Email: {user?.email}</div>}
        {userToken ? (
          <li>
            <button onClick={logout}>Logout</button>
          </li>
        ) : (
          <div className="flex gap-10">
            <li>
              <NavLink to="/login">Login</NavLink>
            </li>
            <li>
              <NavLink to="/register">Register</NavLink>
            </li>
          </div>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
