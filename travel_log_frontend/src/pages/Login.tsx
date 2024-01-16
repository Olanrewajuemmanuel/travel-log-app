import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { withCookies, useCookies } from "react-cookie";
import { Link, useNavigate } from "react-router-dom";
import routes from "../routes";
import { UserInfo } from "../types";
import { verifyTokenAccess } from "../helpers";
import moment from "moment";
import { axiosClient } from "../axiosClient";

const Login = () => {
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
  const navigate = useNavigate();
  const [cookies, setCookie] = useCookies(["accessToken"]);

  // redirect user after login
  useEffect(() => {
    if (verifyTokenAccess(cookies)) {
      navigate(routes.HOME);
    }
    return;
  }, [cookies.accessToken]);

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
    axiosClient({
      method: "post",
      url: "/user/login",
      data: {
        userOrEmail: userOrEmail,
        password: password,
      },
      signal: controller.signal,
    })
      .then((res) => {
        setIsLoading(false);
        localStorage.setItem("currentUser", res.data.user.id);

        setCookie("accessToken", res.data.token, {
          path: "/",
          expires: moment().add("1", "hour").toDate(),
        });
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
    <div className="flex justify-center align-middle w-full">
      <div className="w-full md:w-1/3">
        <h1 className="mb-5 text-2xl md:text-3xl md:text-center font-medium">
          Login
        </h1>
        {errors.message && (
          <p className="p-3 bg-red-200 rounded-md text-gray-600">
            {errors.message}
          </p>
        )}
        <form
          className="space-y-5"
          onSubmit={(e: FormEvent) => handleSubmit(e)}
        >
          <div className="form-grp space-y-2 md:space-y-5">
            <label htmlFor="userOrEmail">
              Username or Email <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="userOrEmail"
              placeholder="@username or email"
              value={formData.userOrEmail}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e)}
              className="block w-full py-2 px-3 border border-gray-200 outline-none rounded-lg bg-white"
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
              className="block w-full py-2 px-3 border border-gray-200 outline-none rounded-lg bg-white"
            />
          </div>
          <div className="form-grp space-y-2">
            <label htmlFor="signedIn" className="mr-2 text-sm font-medium">
              Stay signed in?
            </label>
            <input
              type="checkbox"
              name="signedIn"
              id="signedIn"
              className="cursor-pointer"
              checked={formData.signedIn}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e)}
            />
          </div>
          <button
            type="submit"
            className={`px-8 py-2 bg-red-600 hover:bg-red-700 text-gray-100 rounded-full ${
              isLoading ? "disabled:opacity-0" : ""
            }`}
          >
            {isLoading ? "Logging in..." : "Submit"}
          </button>
        </form>
        <p className="mt-10">
          Not signed up yet?{" "}
          <Link to={routes.REGISTER}>
            <b className="text-blue-500 underline">Register</b>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default withCookies(Login);
