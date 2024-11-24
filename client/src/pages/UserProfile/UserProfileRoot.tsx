import { useOutlet } from "react-router-dom";
import UserProfile from "./UserProfile";

const UserProfileRoot = (): JSX.Element => {
  const outlet = useOutlet();

  if (outlet) {
    return outlet;
  }

  return <UserProfile />;
};

export default UserProfileRoot;
