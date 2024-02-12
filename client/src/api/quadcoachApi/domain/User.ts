import { PartialBy } from "../../../helpers/typeHelpers";


type User = {
    _id: string;
    name: string;
    email: string;
    password?: string;
    roles?: string[];
    active: boolean;
  };

export default User;
export type UserWithOutId = Omit<User, "_id">;
export type UserPartialId = PartialBy<User, "_id">;