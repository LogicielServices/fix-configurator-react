import { Navigate, Route, Routes } from "react-router-dom";
import { pathConstants, REFRESH_INTERVAL } from "../../utils/constants.js";
import { checkExpirationTime } from "../../utils/helper";
import { useEffect, Suspense, lazy } from "react";
import { Box } from "@mui/material";
import Loader from "./../LoaderComponent";
import MenuBar from "../MenuBarComponent/MenuBar.jsx";
import Footer from "../Footer/Footer.jsx";
import { useCategoryAccess } from "../../hooks/usePermissions";

const RolesByUser = lazy(() => import("../../Pages/RolesByUser"));
const Roles = lazy(() => import("../../Pages/Roles"));
const SessionDetails = lazy(() => import("../../Pages/Dashboard"));
const Unauthorized = lazy(() => import("../../Pages/Unauthorized"));

const SecuredRoutes = () => {
  // Check permissions for restricted routes
  const { hasAccess: canAccessRoles } = useCategoryAccess("Role");

  useEffect(() => {
    checkExpirationTime();
    const interval = setInterval(checkExpirationTime, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="m-4 d-flex">
      <Suspense fallback={<Loader />}>
        <Box className="w-100" sx={{ display: "flex", flexDirection: "column", minHeight: "calc(100vh - 3rem)" }}>
          <MenuBar />
          <Routes>
            <Route
              path="*"
              element={<Navigate to={pathConstants.dashboard} />}
            />
            <Route
              path={pathConstants.unauthorized}
              element={<Unauthorized />}
            />
            <Route
              path={pathConstants.dashboard}
              element={<SessionDetails />}
            />
            <Route
              path={pathConstants.roles}
              element={canAccessRoles ? <Roles /> : <Navigate to={pathConstants.unauthorized} />}
            />
            <Route
              path={pathConstants.assignedUsersByRole}
              element={canAccessRoles ? <RolesByUser /> : <Navigate to={pathConstants.unauthorized} />}
            />
          </Routes>
          <Footer />
        </Box>
      </Suspense>
    </div>
  );
};

export default SecuredRoutes;
