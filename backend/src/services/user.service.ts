import { User } from "../models";

const createUser = async (data: object) => {
  const user = await User.create(data);
  return user;
};

const findUserByValue = async (value: object) => {
  const user = await User.findOne(value);
  return user;
};

const findUserById = async (id: any) => {
  const user = await User.findById(id);
  return user;
};

export default { createUser, findUserByValue, findUserById };
