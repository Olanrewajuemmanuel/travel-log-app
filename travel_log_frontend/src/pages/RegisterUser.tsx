import axios from "axios";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useCookies, withCookies } from "react-cookie";
import { Link, Navigate, useNavigate } from "react-router-dom";
import routes from "../routes";
import { UserInfo } from "../types";
import { axiosClient } from "../axiosClient";
import moment from "moment";

interface Form {
  username?: string;
  password?: string;
  passwordVerify?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

const RegisterUser = () => {
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
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const navigate = useNavigate();
  const [cookies, setCookie] = useCookies(["accessToken"]);

  // redirect user after signup

  useEffect(() => {
    if (cookies.accessToken) {
      navigate(routes.HOME);
    }
    return;
  }, [registerSuccess, cookies, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (["firstName", "lastName"].includes(e.target.name)) {
      // update username suggestion
      let timeout: undefined | NodeJS.Timeout;
      e.target.onchange = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          let userNamesArr = [];
          let { firstName, lastName } = formData;
          let randNo = Math.round(Math.random() * 100);
          if (firstName) {
            // Append first and second name or add random number
            userNamesArr.push(`${firstName}_${lastName}`);
            userNamesArr.push(`${firstName}${lastName?.toLowerCase()}`);
            userNamesArr.push(`${firstName}_${randNo}`);
            userNamesArr.push(`${firstName}_${lastName}_${randNo}`);
          } else {
            userNamesArr.push(`${lastName}_${randNo}`);
          }
          setUsernameSuggestions(userNamesArr);
        }, 1000);
      };
    }
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
      setTimeout(() => setErrors({ message: "" }), 4000);
      window.scroll(0, 0);
      return;
    }
    // passwords match
    if (!(password === passwordVerify)) {
      setErrors({ message: "Passwords do not match" });
      setTimeout(() => setErrors({ message: "" }), 4000);
      window.scroll(0, 0);
      return;
    }
    setIsLoading(true);
    var controller = new AbortController();
    if (isLoading && controller) {
      // cancel request
      controller.abort();
      setIsLoading(false);
    }

    axiosClient({
      method: "post",
      url: "/api/user/register",
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
        localStorage.setItem("currentUser", res.data.user.id);

        setCookie("accessToken", res.data.token, {
          path: "/",
          expires: moment().add("1", "hour").toDate(),
        });
        navigate(routes.HOME);
      })
      .catch((err) => {
        setErrors(err.response.data);
        setTimeout(() => setErrors({ message: "" }), 4000);
        window.scroll(0, 0);
        setIsLoading(false);
      });
  };
  return (
    <div className="flex justify-center align-middle w-full">
      <div className="w-full md:w-1/3">
        <h1 className="mb-5 text-2xl md:text-3xl md:text-center font-medium">
          Sign up and connect with Travelers around the globe
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5 md:space-y-8">
          {errors.message && (
            <p className="p-3 bg-red-200 rounded-md text-gray-600">
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
              className="block w-full py-2 px-3 border border-gray-200 outline-none rounded-lg bg-white"
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
              className="block w-full py-2 px-3 border border-gray-200 outline-none rounded-lg bg-white"
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
              value={formData.username?.toLocaleLowerCase()}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e)}
              placeholder="@username"
              className="block w-full py-2 px-3 border border-gray-200 outline-none rounded-lg bg-white"
            />{" "}
            {usernameSuggestions.length > 0 ? (
              <p className="font-medium space-x-2 ml-3 inline-block">
                {usernameSuggestions.map((username) => (
                  <button>
                    <b
                      className="underline after:content-[',']"
                      onClick={(e) => {
                        e.preventDefault();
                        setFormData((formData) => ({
                          ...formData,
                          username,
                        }));
                      }}
                    >
                      @{username}
                    </b>
                  </button>
                ))}
              </p>
            ) : null}
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
              className="block w-full py-2 px-3 border border-gray-200 outline-none rounded-lg bg-white"
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
              className="block w-full py-2 px-3 border border-gray-200 outline-none rounded-lg bg-white"
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
              className="block w-full py-2 px-3 border border-gray-200 outline-none rounded-lg bg-white"
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
              className="block w-full py-2 px-3 border border-gray-200 outline-none rounded-lg bg-white"
            />
          </div>
          <button
            type="submit"
            className={`px-8 py-2 bg-red-600 hover:bg-red-700 text-gray-100 rounded-full ${
              isLoading ? "disabled:opacity-0" : ""
            }`}
          >
            {isLoading ? "Signing up..." : "Submit"}
          </button>
        </form>
        <p className="mt-10">
          Already signed up?{" "}
          <Link to={routes.LOGIN}>
            <b className="text-blue-500 underline">Login</b>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default withCookies(RegisterUser);
