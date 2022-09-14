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
import { Navigate } from "react-router-dom";
import { withCookies } from "react-cookie";

interface Props {
  changeDisplayStatus: React.Dispatch<React.SetStateAction<boolean>>;
  cookies: any;
}

const Home = ({ cookies, changeDisplayStatus }: Props) => {
  const [error, setError] = useState({
    message: "",
  });
  const [logs, dispatch] = useReducer(reducer, initialState);
  const fetchData = useMemo(async () => {
    const res = await axiosPrivate.get("/feed");
    try {
      const feeds = await res.data;

      return Promise.resolve(feeds);
    } catch (error) {
      return Promise.reject(error);
    }
  }, []);
  useEffect(() => {
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
  }, [fetchData]);

  if (!cookies.get("accessToken")) return <Navigate to={routes.LOGIN} />;
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
