import { createContext } from "react";
import { LogAction, LogActionType, TravelLogState } from "../types";

const initialState: TravelLogState = [];

function reducer(state: TravelLogState, action: LogAction): TravelLogState {
  switch (action.type) {
    case LogActionType.UPD_STORE:
      const feedState = action.payload.feeds;
      if (!feedState) return [];
      return feedState;
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
          if (!log.userhasLikedFeed) {
            // owner like actions
            let newLog;
            if (!log.shouldUnlikeNext) {
              // Like
              newLog = {
                ...log,
                likes: log.likes + 1,
                userhasLikedFeed: true,
                shouldUnlikeNext: true,
              };
            } else {
              newLog = {
                ...log,
                likes: log.likes - 1,
                userhasLikedFeed: false,
                shouldUnlikeNext: false,
              };
            }
            return newLog;
          } else {
            // Other users like actions
            let newLog;
            if (!log.shouldUnlikeNext) {
              // Like
              newLog = {
                ...log,
                likes: log.likes + 1,
                userhasLikedFeed: true,
                shouldUnlikeNext: true,
              };
            } else {
              newLog = {
                ...log,
                likes: log.likes - 1,
                userhasLikedFeed: false,
                shouldUnlikeNext: false,
              };
            }
            return newLog;
          }
        }
        return log;
      });

      return likedLog;

    default:
      return state;
  }
}
const FeedContext = createContext(initialState);

export { initialState, reducer, FeedContext };
