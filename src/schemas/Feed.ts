import { Document, model, ObjectId, Schema } from "mongoose";
import UserSchema from "./User";

interface FeedDocument extends Document {
  userhasLiked: boolean;
  userId: ObjectId;
  dateModified: Date;
  rating: number;
  caption: string;
  location: string;
  imgSet: Array<string>;
  likes: number;
  visited: boolean;
}

const Feed = new Schema({
  userhasLikedFeed: {
    type: Boolean,
    default: false
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true, // user can create multiple feeds
    unique: false

  },
  username: String,
  dateModified: {
    type: Date,
    default: Date.now,
  },
  rating: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  caption: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  imgSet: [String],
  likes: {
    type: Number,
    default: 0
  },
  visited: {
    type: Boolean,
    default: true,
  },
});

Feed.pre("save", async function (next) {
  const doc = await UserSchema.findById(this.userId).select('username')
  this.username = doc?.username
  next()
})

const FeedSchema = model<FeedDocument>("Feed", Feed);
export default FeedSchema;
