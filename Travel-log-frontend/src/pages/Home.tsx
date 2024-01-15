import { LogActionType, TravelLog, TravelLogState } from "../types";
import { Feed } from "../components/Feed";
import React, {
  Consumer,
  Provider,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { FeedContext, initialState, reducer } from "../store";
import { axiosPrivate } from "../axiosClient";
import routes from "../routes";
import { Navigate, useNavigate } from "react-router-dom";
import { useCookies, withCookies } from "react-cookie";
import { verifyTokenAccess } from "../helpers";

interface Props {
  changeDisplayStatus: React.Dispatch<React.SetStateAction<boolean>>;
}

const Home = ({ changeDisplayStatus }: any) => {
  const [error, setError] = useState({
    message: "",
  });
  const [logs, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();
  const [cookies, setCookie] = useCookies(["accessToken"]);

  const fetchData = useMemo(async () => {
    const res = await axiosPrivate.get("/feed/");

    try {
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
          console.log(err);

          setError({ message: err.message });
        }
      });
  }, [fetchData]);

  return (
    <div className="md:flex justify-center items-center flex-col">
      <p>{error.message ? error.message : ""}</p>
      {logs.map((log, index) => (
        <Feed key={index} log={log} dispatchFn={dispatch} />
      ))}
    </div>
  );
};

export default withCookies(Home);
