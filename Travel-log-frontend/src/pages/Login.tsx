import axios from "axios";
import React, { ChangeEvent, FormEvent, useState } from "react";
import { withCookies } from "react-cookie";
import { Link, Navigate } from "react-router-dom";
import routes from "../routes";
import { UserInfo } from "../types";

const Login = ({ cookies }: any) => {
  const [formData, setFormData] = useState({
    userOrEmail: "",
    password: "",
    signedIn: false,
  });
  const [errors, setErrors] = useState({ message: "" });
  const [loginSuccess, setLoginSuccess] = useState<UserInfo>({
    token: "",
    user: {
      id: "",
      username: "",
      email: "",
    },
  });
  const [isLoading, setIsLoading] = useState(false);

  // redirect user after login
  if (cookies.get("accessToken")) {
    localStorage.setItem("currentUser", loginSuccess.user.username);
    return <Navigate to={routes.HOME} />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target;
    if (target.type === "checkbox") {
      setFormData({ ...formData, signedIn: target.checked });
    } else {
      setFormData({ ...formData, [target.name]: target.value });
    }
  };
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const { userOrEmail, password } = formData;
    var controller = new AbortController();
    if (!userOrEmail || !password) {
      setErrors({ message: "Please fill the required fields" });
      return;
    }
    setIsLoading(true);
    if (isLoading && controller) {
      // cancel request
      controller.abort();
      setIsLoading(false);
    }
    axios({
      method: "post",
      url: "api/user/login",
      data: {
        userOrEmail: userOrEmail,
        password: password,
      },
      signal: controller.signal,
    })
      .then((res) => {
        setLoginSuccess(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.code === "ERR_BAD_RESPONSE") {
          setErrors({ message: "Network Error, Please try again later." });
          setIsLoading(false);
          return;
        }
        setErrors(err.response.data);
        setIsLoading(false);
      });
  };

  return (
    <div>
      {errors.message && (
        <p className="p-3 md:w-1/5 bg-red-200 rounded-md text-gray-600">
          {errors.message}
        </p>
      )}
      <h1 className="mb-5 text-2xl font-medium">Login To Travel Log</h1>
      <form className="space-y-5" onSubmit={(e: FormEvent) => handleSubmit(e)}>
        <div className="form-grp space-y-2">
          <label htmlFor="userOrEmail">
            Username or Email <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="userOrEmail"
            placeholder="@username or email"
            value={formData.userOrEmail}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e)}
            className="block py-2 px-3 border border-gray-200 outline-none rounded-lg bg-white"
          />
        </div>
        <div className="form-grp space-y-2">
          <label htmlFor="password">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e)}
            className="block py-2 px-3 border border-gray-200 outline-none rounded-lg bg-white"
          />
        </div>
        <div className="form-grp space-y-2">
          <label htmlFor="signedIn" className="mr-2 text-sm font-medium">
            Stay signed in?
          </label>
          <input
            type="checkbox"
            name="signedIn"
            className="cursor-pointer"
            checked={formData.signedIn}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e)}
          />
        </div>
        <button
          type="submit"
          className={`px-3 py-2 bg-red-600 hover:bg-red-700 text-gray-100 rounded-lg ${
            isLoading ? "disabled:opacity-0" : ""
          }`}
        >
          {isLoading ? "Loading..." : "Submit"}
        </button>
      </form>
      <p className="mt-3">
        Not signed up yet?{" "}
        <Link to={routes.REGISTER}>
          <b className="text-blue-500 underline">Register</b>
        </Link>
      </p>
    </div>
  );
};

export default withCookies(Login);
