import React, { Fragment, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { LayoutContext } from "../index";
import { getCSRFToken, loginReq } from "./fetchApi";

const Login = (props) => {
  const { data: layoutData, dispatch: layoutDispatch } = useContext(LayoutContext);

  const [data, setData] = useState({
    email: "",
    password: "",
    csrfToken: "",
    success: false,
    error: false,
    loading: true,
  });

  useEffect(() => {
    const fetchCSRFToken = async () => {
      const token = await getCSRFToken();
      console.log('Fetched CSRF Token:', token);
      setData((prevData) => ({ ...prevData, csrfToken: token }));
    };
    fetchCSRFToken();
  }, []);

  const alert = (msg) => <div className="text-xs text-red-500">{msg}</div>;

  const formSubmit = async () => {
    setData({ ...data, loading: true });
    try {
      let responseData = await loginReq({
        email: data.email,
        password: data.password,
        _csrf: data.csrfToken,
      });
      if (responseData.error) {
        setData({
          ...data,
          loading: false,
          error: responseData.error,
          password: "",
        });
      } else if (responseData.success === true) {
        setData({ email: "", password: "", loading: false, error: false, success: responseData.success });
        localStorage.setItem("jwt", JSON.stringify(responseData));
        toast.success("Login Successfully");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Fragment>
      <div className="text-center text-2xl mb-6">Login</div>
      {layoutData.loginSignupError ? (
        <div className="bg-red-200 py-2 px-4 rounded">
          You need to login for checkout. Haven't account? Create a new one.
        </div>
      ) : (
        ""
      )}
      <form className="space-y-4">
        <div className="flex flex-col">
          <label htmlFor="name">
            Username or email address
            <span className="text-sm text-gray-600 ml-1">*</span>
          </label>
          <input
            onChange={(e) => {
              setData({ ...data, email: e.target.value, error: false });
              layoutDispatch({ type: "loginSignupError", payload: false });
            }}
            value={data.email}
            type="text"
            id="name"
            className={`${!data.error ? "" : "border-red-500"} px-4 py-2 focus:outline-none border`}
          />
          {!data.error ? "" : alert(data.error)}
        </div>
        <div className="flex flex-col">
          <label htmlFor="password">
            Password<span className="text-sm text-gray-600 ml-1">*</span>
          </label>
          <input
            onChange={(e) => {
              setData({ ...data, password: e.target.value, error: false });
              layoutDispatch({ type: "loginSignupError", payload: false });
            }}
            value={data.password}
            type="password"
            id="password"
            className={`${!data.error ? "" : "border-red-500"} px-4 py-2 focus:outline-none border`}
          />
          {!data.error ? "" : alert(data.error)}
        </div>
        <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center">
          <div>
            <input
              type="checkbox"
              id="rememberMe"
              className="px-4 py-2 focus:outline-none border mr-1"
            />
            <label htmlFor="rememberMe">
              Remember me<span className="text-sm text-gray-600">*</span>
            </label>
          </div>
          <Link className="block text-gray-600" to="/reset-password">
            Lost your password?
          </Link>
        </div>
        <div
          onClick={(e) => formSubmit()}
          style={{ background: "#303031" }}
          className="font-medium px-4 py-2 text-white text-center cursor-pointer"
        >
          Login
        </div>
      </form>
    </Fragment>
  );
};

export default Login;




