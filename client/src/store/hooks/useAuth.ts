import { useSelector } from "react-redux";
import { RootState } from "../store";
import { selectCurrentToken } from "../../api/auth/authSlice";
import { jwtDecode, JwtPayload } from "jwt-decode";

type UserInfo = {
  id: string;
  name: string;
  email: string;
  roles: string[];
};

type AuthInfo = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  isAdmin: boolean;
  status: string | null;
};

const useAuth = (): AuthInfo => {
  const token = useSelector((state: RootState) => selectCurrentToken(state));
  let isAdmin = false;
  let status = "User";

  if (token) {
    const decoded: JwtPayload & { UserInfo: UserInfo } = jwtDecode(token);
    const { id, name, email, roles } = decoded.UserInfo;

    isAdmin = roles.includes("Admin") || roles.includes("admin");

    if (isAdmin) {
      status = "Admin";
    }
    return { id, name, email, roles, isAdmin, status };
  }
  return {
    id: "",
    name: "",
    email: "",
    roles: [],
    isAdmin: false,
    status: null,
  };
};

export default useAuth;
