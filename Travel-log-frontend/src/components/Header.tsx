import { AxiosResponse } from "axios";
import { withCookies } from "react-cookie";
import { Link, useNavigate } from "react-router-dom";
import { axiosClient } from "../axiosClient";
import routes from "../routes";

interface LogOutResponse extends AxiosResponse {
  message: string;
}

const Header = ({ cookies, changeDisplayStatus }: any) => {
  const navigate = useNavigate();
  const logout = async () => {
    try {
      const { message }: LogOutResponse = await (
        await axiosClient.post("user/logout")
      ).data;
      if (message) {
        changeDisplayStatus(false)
        return navigate(routes.LOGIN);
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
        {!cookies.get("accessToken") ? (
          <li>
            <button className="rounded-full bg-red-600 hover:bg-red-800 text-gray-100 px-5 py-2">
              <Link to={routes.LOGIN}>Login</Link>
            </button>
          </li>
        ) : (
          <li>
            <button
              onClick={logout}
              className="rounded-full hover:bg-red-600 hover:text-gray-200 text-red-600 px-5 py-2 border-2 border-red-600"
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
