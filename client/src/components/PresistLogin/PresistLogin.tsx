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

  if (isError) {
    // Error no Login verification
    return <Outlet />;
  } else if (isSuccess && trueSuccess) {
    // Successfull login verification
    console.log("Login Successfull");
    return <Outlet />;
  } else if (!token && isUninitialized && trueSuccess) {
    // Fix after Logout
    return <Outlet />;
  } else if (token && isUninitialized && trueSuccess) {
    // Login after Logout
    console.log("Login after Logout Successfull");
    return <Outlet />;
  } else {
    // console.log(
    //   trueSuccess,
    //   isUninitialized,
    //   isLoading,
    //   isSuccess,
    //   isError,
    //   token,
    // );
    return <></>;
  }
};

export default PresistLogin;
