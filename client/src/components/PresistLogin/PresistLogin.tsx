import { Outlet, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useRefreshMutation } from "../../pages/authApi";
import { useSelector } from "react-redux";
import { selectCurrentToken } from "../../api/auth/authSlice";

const PresistLogin = (): JSX.Element => {
  const token = useSelector(selectCurrentToken);
  const effectRan = useRef(false);

  const [trueSuccess, setTrueSuccess] = useState(false);

  const [refresh, { isUninitialized, isLoading, isSuccess, isError, error }] =
    useRefreshMutation();

  useEffect(() => {
    if (effectRan.current === true || process.env.NODE_ENV !== "development") {
      // React 18 Strict Mode

      const verifyRefreshToken = async () => {
        try {
          //const response =
          await refresh();
          //const { accessToken } = response.data
          setTrueSuccess(true);
        } catch (err) {
          console.error(err);
        }
      };

      if (!token) verifyRefreshToken();
    }

    return () => {
      effectRan.current = true;
    };
  }, []);

  // if (isLoading) {
  //   console.log("loading");
  //   return <Outlet />;
  // } else if (isError) {
  //   console.log("error");
  //   return <Outlet />;
  // } else if (isSuccess && trueSuccess) {
  //   //persist: yes, token: yes
  //   console.log("success");
  //   return <Outlet />;
  // } else if (token && isUninitialized) {
  //   //persist: yes, token: yes
  //   console.log("token and uninit");
  //   console.log(isUninitialized);
  //   return <Outlet />;
  // } else if (!token && isUninitialized) {
  //   //persist: yes, token: yes
  //   console.log("no token and uninit");
  //   console.log(isUninitialized);
  //   return <Outlet />;
  // }
  return <Outlet />;
};

export default PresistLogin;
