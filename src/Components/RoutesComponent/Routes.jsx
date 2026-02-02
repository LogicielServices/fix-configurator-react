import { lazy, Suspense, useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { pathConstants } from "../../utils/constants";
import GlobalContext from "../../Provider/GlobalProvider";
import Loader from "./../LoaderComponent";
const Login = lazy(() => import("../../Pages/Login"));
const SecuredRoutes = lazy(() => import("./SecuredRoutes"));

const RoutesComponent = () => {
  const { isAuthenticated } = useContext(GlobalContext);

  if (!isAuthenticated)
    return (
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="*" element={<Navigate to={pathConstants.login} />} />
          <Route path={pathConstants.login} element={<Login />} />
        </Routes>
      </Suspense>
    );
  return (
    <Suspense fallback={<Loader />}>
      <SecuredRoutes />
    </Suspense>
  );
};

export default RoutesComponent;
