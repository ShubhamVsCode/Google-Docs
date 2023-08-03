import ReactDOM from "react-dom/client";
// import App from "./App.jsx";
import "./index.css";

import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import IndexPage from "./components/IndexPage.jsx";
import DocumentPage from "./components/DocumentPage.jsx";
import LoginPage from "./components/LoginPage.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import OneTimeRoute from "./components/OneTimeRoute.jsx";
import RegisterPage from "./components/RegisterPage.jsx";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Navbar />
        <Outlet />
      </>
    ),
    children: [
      {
        path: "/",
        element: <PrivateRoute />,
        children: [
          {
            path: "/",
            element: (
              <div>
                <IndexPage />
              </div>
            ),
          },
          {
            path: "/document/:documentId",
            element: (
              <>
                <DocumentPage />
              </>
            ),
          },
        ],
      },
      {
        path: "/",
        element: <OneTimeRoute />,
        children: [
          {
            path: "/login",
            element: (
              <div>
                <LoginPage />
              </div>
            ),
          },
          {
            path: "/register",
            element: (
              <div>
                <RegisterPage />
              </div>
            ),
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);
