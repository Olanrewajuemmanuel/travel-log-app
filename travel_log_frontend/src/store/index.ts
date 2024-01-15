import { createContext } from "react";
import { LogAction, LogActionType, TravelLogState } from "../types";

const initialState: TravelLogState = [];

function reducer(state: TravelLogState, action: LogAction): TravelLogState {
  switch (action.type) {
    case LogActionType.UPD_STORE:
      const feedState = action.payload.feeds
      return feedState || []
    case LogActionType.BOOKMARK:
      const getLog = state.map((log) => {
        if (log._id === action.payload.id) {
          const newLog = {
            ...log,
            visited: !log.visited,
          };
          return newLog;
        } else {
          return log;
        }
      });
      return getLog;
    case LogActionType.LIKE:
      const likedLog = state.map((log) => {
        let newLog;
        if (log._id === action.payload.id) {
          if (log.userhasLikedFeed === false) {
            // user has not liked post
            newLog = {
              ...log,
              likes: log.likes + 1,
              userhasLikedFeed: true
            };
          } else {
            // has already liked
            newLog = {
              ...log,
              likes: log.likes - 1,
              userhasLikedFeed: false 
            }
          }

          return newLog;
        } else {
          return log;
        }
      });

      return likedLog;

    default:
      return state;
  }
}
const FeedContext = createContext(initialState);

export { initialState, reducer, FeedContext };
