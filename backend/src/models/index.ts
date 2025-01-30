import { model } from "mongoose";
import userSchema from "../schemas/user.schema";

const User = model("User", userSchema);

export { User };
