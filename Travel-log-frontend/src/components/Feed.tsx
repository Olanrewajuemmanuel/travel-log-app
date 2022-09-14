import { LogAction, TravelLog } from "../types";
import moment from "moment";
import { motion } from "framer-motion";
import { Engagement } from "./Engagement";
import { Link } from "react-router-dom";

interface Props {
  log: TravelLog;
  dispatchFn: React.Dispatch<LogAction>

}
const widthVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

function displayStar(id: number) {
  return (
    <svg
      key={id}
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6 inline my-3"
      fill="#d1d366"
      viewBox="0 0 24 24"
      stroke="none"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  );
}

export const Feed: React.FC<Props> = ({ log, dispatchFn }) => {
  var images =
    log.imgSet &&
    log.imgSet.map((img, index) => (
      <img
        className="w-full md:w-[500px] max-h-[500px]"
        src={img}
        alt={log.location}
        key={index.toString()}
      />
    ));

  return (
    <div className="p-3 max-w-[500px] my-6">
      <Link to={`/profile/${log.username}`}>
        <p className="mb-3 font-bold underline">{log.username}</p>
      </Link>
      <div className="carousel relative">
        {images}
        {/* Location icon */}
        <span className="cursor-pointer absolute top-3 left-2 bg-[#202020] p-2 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#fff"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </span>
        {/* Location tag */}
        <motion.span
          transition={{ duration: 0.5 }}
          variants={widthVariant}
          initial="initial"
          whileHover="animate"
          // layout
          className="cursor-pointer absolute top-3 left-2 bg-[#202020] rounded-full text-gray-100 text-md p-2 opacity-0"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {log.location}
          </motion.span>
        </motion.span>
      </div>
      <Engagement likes={log.likes} visited={log.visited} feedId={log._id} userLiked={log.userhasLikedFeed} dispatchFn={dispatchFn} />
      <p>{Array.from(Array(log.rating)).map((_, index) => displayStar(index))}</p>
      <p className="mb-5">{log.caption}</p>
      <p>Comment Section</p>
      <i className="block text-sm text-gray-700 text-right">
        {moment(log.dateModified).fromNow()}
      </i>
    </div>
  );
};
