import { AxiosResponse } from "axios";
import { useCookies, withCookies } from "react-cookie";
import { Link, useNavigate } from "react-router-dom";
import { axiosPrivate } from "../axiosClient";
import routes from "../routes";
import { useEffect, useState } from "react";

interface LogOutResponse extends AxiosResponse {
  message: string;
}

const Header = ({ changeDisplayStatus }: any) => {
  const navigate = useNavigate();
  const [cookies, setCookies] = useCookies(["accessToken"]);
  const [inRegister, setInRegister] = useState(false);
  const logout = async () => {
    try {
      const { message }: LogOutResponse = await (
        await axiosPrivate.post("user/logout")
      ).data;
      if (message) {
        changeDisplayStatus(false);
        setCookies("accessToken", "");

        navigate(routes.LOGIN);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="w-full  shadow-md p-5 flex items-center justify-between">
      <Link to="/">
        <span className="text-2xl text-red-600 font-medium uppercase">
          Travel Log
        </span>
      </Link>

      <ul className="flex space-x-4">
        {!cookies.accessToken ? (
          <li>
            <Link to={inRegister ? routes.LOGIN : routes.REGISTER}>
              <button
                className="rounded-full bg-red-600 hover:bg-red-800 text-gray-100 px-5 py-2"
                onClick={() => setInRegister(!inRegister)}
              >
                {inRegister ? "Login" : "Register"}
              </button>
            </Link>
          </li>
        ) : (
          <li>
            <button
              onClick={logout}
              className="rounded-full hover:bg-red-600 hover:text-gray-200 text-red-600 px-2.5 py-0.5 border-2 border-red-600"
            >
              Logout
            </button>
          </li>
        )}
      </ul>
    </div>
  );
};

export default withCookies(Header);
