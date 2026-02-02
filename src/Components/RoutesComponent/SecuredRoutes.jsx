import { Navigate, Route, Routes } from "react-router-dom";
import { pathConstants, REFRESH_INTERVAL } from "../../utils/constants.js";
import { checkExpirationTime } from "../../utils/helper";
import { useEffect, Suspense, lazy } from "react";
import { Box } from "@mui/material";
import Loader from "./../LoaderComponent";
import MenuBar from "../MenuBarComponent/MenuBar.jsx";
const Dashboard = lazy(() => import("../../Pages/Dashboard"));

const SecuredRoutes = () => {

  useEffect(() => {
    checkExpirationTime();
    const interval = setInterval(checkExpirationTime, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <Suspense fallback={<Loader />}>
        <Box className="m-4 w-100">
          <MenuBar />
          <Routes>
            <Route
              path="*"
              element={<Navigate to={pathConstants.dashboard} />}
            />
            <Route
              path={pathConstants.dashboard}
              element={<Dashboard />}
            />
          </Routes>
        </Box>
      </Suspense>
    </div>
  );
};

export default SecuredRoutes;
