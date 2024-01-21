import { LogActionType } from "../types";
import { Feed } from "../components/Feed";
import React, { useEffect, useMemo, useReducer, useState } from "react";
import { initialState, reducer } from "../store";
import { axiosPrivate } from "../axiosClient";
import routes from "../routes";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { verifyTokenAccess } from "../helpers";

interface Props {
  changeDisplayStatus: React.Dispatch<React.SetStateAction<boolean>>;
}

const Home = ({ changeDisplayStatus }: Props) => {
  const [error, setError] = useState({
    message: "",
  });
  const [logs, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();
  const [cookies] = useCookies(["accessToken"]);

  const fetchData = useMemo(async () => {
    try {
      const res = await axiosPrivate.get("/feed/");
      const feeds = await res.data;

      if (!feeds) throw new Error("There was an error getting your feeds");

      return Promise.resolve(feeds);
    } catch (error) {
      return Promise.reject({
        message: "An unexpected error occured! Try reloading the page.",
      });
    }
  }, []);
  useEffect(() => {
    if (!verifyTokenAccess(cookies)) {
      navigate(routes.LOGIN);
      return;
    }
    changeDisplayStatus(true); // display nav

    fetchData
      .then((feeds) => {
        // update store

        dispatch({ type: LogActionType.UPD_STORE, payload: { feeds } });
      })
      .catch(async (err) => {
        if (err.code === "ERR_NETWORK") {
          setError({ message: "Network error, please ty again later." });
        } else {
          setError({ message: err.message });
        }
      });
  }, [fetchData, changeDisplayStatus, cookies, navigate]);

  return (
    <div className="md:flex justify-center items-center flex-col">
      <p>{error.message ? error.message : ""}</p>
      {logs.map((log, index) => (
        <Feed key={index} log={log} dispatchFn={dispatch} />
      ))}
    </div>
  );
};

export default Home;
