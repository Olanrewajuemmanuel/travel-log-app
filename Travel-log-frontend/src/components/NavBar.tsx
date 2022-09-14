import { Link } from "react-router-dom";



const NavBar = () => {
  const currentUser = localStorage.getItem("currentUser")
  return (
    <div className="stay-at-bottom bg-gray-100">
      <div className="p-2 flex justify-between">
        <Link to="/">
          <button className="block p-2 hover:bg-gray-200 rounded-full hover:rounded-full hover:scale-[1.1] transition ease-out">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h8 w-8"
              viewBox="0 0 20 20"
              fill="#2c2c2c"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </button>
        </Link>

        <Link to="/add-travel">
          <button className="block p-2 hover:bg-gray-200 rounded-full hover:rounded-full hover:scale-[1.1] transition ease-out">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#2c2c2c"
              stroke-width="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </Link>

        <Link to={`/profile/${currentUser}`}>
          <button className="block p-2 hover:bg-gray-200 rounded-full hover:rounded-full hover:scale-[1.1] transition ease-out">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#2c2c2c"
              stroke-width="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </button>
        </Link>
      </div>
    </div>
  );
};

export default NavBar;
