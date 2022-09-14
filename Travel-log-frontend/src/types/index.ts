export type User = {
  username: string;
};
export interface TravelLog {
  _v: number
  _id: number | string;
  username: string;
  userId: string;
  imgSet?: string[];
  dateModified: string;
  rating: number;
  location: string;
  caption?: string;
  likes: number;
  visited: boolean;
  userhasLikedFeed: boolean;
}

export type TravelLogState = Array<TravelLog>;
export enum LogActionType {
  BOOKMARK = "BOOKMARK",
  LIKE = "LIKE",
  UPD_STORE = "UPD_STORE",
}

export interface LogAction {
  type: LogActionType;
  payload: {
    id?: number | string;
    feeds?: TravelLogState;
  };
}

export interface UserInfo {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}
