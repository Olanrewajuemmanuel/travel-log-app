import axios from "axios";
import React, { ChangeEvent, FormEvent, useState } from "react";
import {  withCookies } from "react-cookie";
import { Link, Navigate } from "react-router-dom";
import routes from "../routes";
import { UserInfo } from "../types";

interface Form {
  username?: string;
  password?: string;
  passwordVerify?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

const RegisterUser = ({ cookies }: any) => {
  const [formData, setFormData] = useState<Form>({
    username: "",
    lastName: "",
    email: "",
    firstName: "",
    password: "",
    passwordVerify: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    message: "",
  });
  const [registerSuccess, setRegisterSuccess] = useState<UserInfo>({
    token: "",
    user: {
      id: "",
      username: "",
      email: "",
    },
  });
  // redirect user after login
  if (cookies.get("accessToken")) {
    localStorage.setItem("currentUser", registerSuccess.user.username)
    return <Navigate to={routes.HOME} />;}

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // update username suggestion

    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // clear all errors
    setErrors({
      message: "",
    });
    // all fields required
    const { lastName, firstName, username, email, password, passwordVerify } =
      formData;
    if (!lastName || !firstName || !username || !email || !password) {
      setErrors({ message: "Please fill the required fields" });
    }
    // passwords match
    if (!(password === passwordVerify)) {
      setErrors({ message: "Passwords do not match" });
      window.scroll(0, 0);
      return;
    }
    setIsLoading(true);
    var controller = new AbortController();
    if (isLoading && controller) {
      // cancel request
      controller.abort();
      setIsLoading(false)
    }

    axios({
      method: "post",
      url: "api/user/register",
      data: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password1: formData.password,
        passwordVerify: formData.passwordVerify,
      },
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        setRegisterSuccess(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        setErrors(err.response.data);
        setIsLoading(false);
      });
  };
  return (
    <div className="flex flex-col">
      <h1 className="mb-5 text-2xl font-medium">
        Register to Connect with Travelers around the globe
      </h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        {errors.message && (
          <p className="p-3 md:w-1/5 bg-red-200 rounded-md text-gray-600">
            {errors.message}
          </p>
        )}
        <div className="form-grp space-y-2">
          <label htmlFor="firstName">
            First name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e)}
            placeholder="First name"
            className="block py-2 px-3 border border-gray-200 outline-none rounded-lg bg-white"
          />
        </div>
        <div className="form-grp space-y-2">
          <label htmlFor="lastName">
            Last name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e)}
            placeholder="Last name"
            className="block py-2 px-3 border border-gray-200 outline-none rounded-lg bg-white"
          />
        </div>
        <div className="form-grp space-y-2">
          <label htmlFor="username">
            Choose a username for people to find{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e)}
            placeholder="@username"
            className="block py-2 px-3 border border-gray-200 outline-none rounded-lg bg-white"
          />{" "}
          {/** suggestions fullname + 12 or _12 */}
          {formData.firstName ? (
            <p>
              Suggestions:
              <p className="font-medium space-x-2 ml-3 inline-block">
                <b className="underline">@{formData.firstName}</b>
                <b className="underline">
                  @{formData.lastName}_{Math.floor(Math.random() * 10)}
                </b>
                <b className="underline">
                  {" "}
                  @{formData.firstName}_{Math.floor(Math.random() * 10)}
                </b>{" "}
                ,
              </p>
            </p>
          ) : (
            ""
          )}
        </div>
        <div className="form-grp space-y-2">
          <label htmlFor="email">
            Email address: <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e)}
            placeholder="Email address"
            className="block py-2 px-3 border border-gray-200 outline-none rounded-lg bg-white"
          />
        </div>
        <div className="form-grp space-y-2">
          <label htmlFor="phone">Phone</label>
          <input
            type="phone"
            name="phone"
            value={formData.phone}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e)}
            placeholder="Phone"
            className="block py-2 px-3 border border-gray-200 outline-none rounded-lg bg-white"
          />
        </div>
        <div className="form-grp space-y-2">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e)}
            placeholder="Password"
            className="block py-2 px-3 border border-gray-200 outline-none rounded-lg bg-white"
          />
        </div>
        <div className="form-grp space-y-2">
          <label htmlFor="passwordVerify">Verify your password:</label>
          <input
            type="password"
            name="passwordVerify"
            value={formData.passwordVerify}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e)}
            placeholder="Verify your password"
            className="block py-2 px-3 border border-gray-200 outline-none rounded-lg bg-white"
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
        Already signed up?{" "}
        <Link to={routes.LOGIN}>
          <b className="text-blue-500 underline">Login</b>
        </Link>
      </p>
    </div>
  );
};

export default withCookies(RegisterUser);
