import { LogAction, LogActionType, TravelLogState } from "../types";

interface Props {
  likes: number;
  visited: boolean;
  feedId: number | string;
  userLiked: boolean;
  dispatchFn: React.Dispatch<LogAction>;
}

export const Engagement = ({
  likes,
  visited,
  feedId,
  userLiked,
  dispatchFn,
}: Props) => {
  return (
    <div className="flex items-center justify-between pt-3">
      <div className="like">
        <button
          className="inline-flex"
          onClick={() =>
            dispatchFn({ type: LogActionType.LIKE, payload: { id: feedId } })
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2"
            fill={`${userLiked ? "#b60404" : "none"}`}
            viewBox="0 0 24 24"
            stroke={`${userLiked ? "none" : "currentColor"}`}
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
          {likes}
        </button>
      </div>
      <div className="visited">
        <button
          className="inline-flex"
          onClick={() =>
            dispatchFn({ type: LogActionType.BOOKMARK, payload: { id: feedId } })
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-3"
            fill={`${visited ? "#5957da" : "none"}`}
            viewBox="0 0 24 24"
            stroke={`${visited ? "none" : "currentColor"}`}
            stroke-width="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          Want to visit?
        </button>
      </div>
    </div>
  );
};
