import { useEffect, useState } from "react";
import { useParams, Outlet, useNavigate } from "react-router-dom";
import profile from "../assets/profile.webp";
import { axiosPrivate } from "../axiosClient";
import { useCookies } from "react-cookie";
import { verifyTokenAccess } from "../helpers";
import routes from "../routes";

interface ProfileDetails {
  date_created?: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  description?: string;
}

const Profile = () => {
  const [profileDetails, setProfileDetails] = useState<ProfileDetails>();
  const [feedDetails, setFeedDetails] = useState([]);
  const [error, setError] = useState({ message: "" });
  const [canEditProfile, setCanEditProfile] = useState(false);
  const [cookies] = useCookies(["accessToken"]);
  const navigate = useNavigate();
  let params = useParams();

  const isUserProfile = !params.username;
  const url = isUserProfile ? "/profile" : `/profile/${params.username}`;
  useEffect(() => {
    if (!verifyTokenAccess(cookies)) {
      navigate(routes.LOGIN);
      return;
    }

    axiosPrivate(url)
      .then((result) => result.data)
      .then((data) => {
        setProfileDetails(data.doc!);
        setFeedDetails(data.feeds!);

        if (data.currentUserProfile) {
          setCanEditProfile(true);
        }
      })
      .catch((err) => {
        if (err) setError({ message: "User not found" });
      });
  }, [navigate, cookies, url]);

  if (error.message.toLocaleLowerCase() === "user not found")
    return <h1>No profile with the username {params.username}</h1>;
  return (
    <div className="max-w-4xl mx-auto p-2">
      <div className="flex justify-between select-none">
        <div className="profile-pic">
          <img
            src={profile}
            alt=""
            width={100}
            height={100}
            className="rounded-full border border-gray-100 shadow-sm"
          />
        </div>
        <div className="user-info relative  w-2/3">
          <h1 className="text-3xl font-light my-2">
            {profileDetails?.username}
          </h1>
          <h3 className="font-bold">
            {profileDetails?.firstName} {profileDetails?.lastName}
          </h3>
          {canEditProfile && (
            <button className="edit absolute top-0 right-[20%] md:right-[60%] hover:bg-red-100 rounded-full p-2 ease-in">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                />
              </svg>
            </button>
          )}

          <p className="w-full nowrap overflow-hidden text-ellipsis">
            {profileDetails?.description}
          </p>

          <div className="flex justify-start text-center my-5 font-light">
            <div className="mr-12">
              <p className="text-2xl">33</p>
              <small>followers</small>
            </div>
            <div>
              <p className="text-2xl">318</p>
              <small>following</small>
            </div>
          </div>
          {!canEditProfile && (
            <button className="font-bold mt-2 rounded-full  w-[80px] text-red-600 bg-white border border-red-600 hover:bg-red-600 hover:text-white ease transition-colors">
              Follow
            </button>
          )}
        </div>
      </div>
      <div className="mt-8">
        <p className="font-light select-none border-b-2 py-2 border-gray-300">
          <span className="font-medium">{feedDetails.length}</span>{" "}
          {feedDetails.length > 1 ? "logs" : "log"}
        </p>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="pic h-36 bg-gray-500"></div>
          <div className="pic h-36 bg-red-500"></div>
          <div className="pic h-36 bg-purple-500"></div>
          <div className="pic h-36 bg-green-500"></div>
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default Profile;
