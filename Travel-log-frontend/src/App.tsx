import { Route, Routes } from "react-router-dom";
import AddTravelLog from "./pages/AddTravelLog";
import Header from "./components/Header";
import Home from "./pages/Home";
import NavBar from "./components/NavBar";
import Profile from "./pages/Profile";
import routes from "./routes";
import { TravelLogState } from "./types";
import Login from "./pages/Login";
import RegisterUser from "./pages/RegisterUser";
import { FeedContext, initialState } from "./store";
import { Cookies, withCookies } from "react-cookie";
import { useEffect, useState } from "react";

type TravelLogContext = {
  logs: TravelLogState;
};

type User = {
  user: {
    id?: string;
    username?: string;
    email?: string;
  };
};
function App({ cookies }: any) {
  const [displayNav, setDisplayNav] = useState(false);
  return (
    <FeedContext.Provider value={initialState}>
      <Header changeDisplayStatus={setDisplayNav} />
      <div className="container text-gray-600 min-h-screen max-w-[780px] mx-auto scroll-smooth">
        <main className="overflow-auto pb-[80px] p-5">
          <Routes>
            <Route
              path={routes.HOME}
              element={<Home changeDisplayStatus={setDisplayNav} />}
            />
            <Route path={routes.ADD_TRAVEL_LOG} element={<AddTravelLog />} />
            <Route path={routes.PROFILE}>
              <Route path=":username" element={<Profile />}/>
              <Route index element={<Profile />} />
            </Route>
            <Route path={routes.LOGIN} element={<Login />} />
            <Route path={routes.REGISTER} element={<RegisterUser />} />
            <Route path="*" element={<h1>Not found</h1>} />
          </Routes>
        </main>
        {displayNav ? <NavBar /> : null}
      </div>
    </FeedContext.Provider>
  );
}

export default withCookies(App);
