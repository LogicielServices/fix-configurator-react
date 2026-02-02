import { Breadcrumbs, Link, Typography } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useEffect, useMemo, useState } from "react";
import { pathConstants } from "../../utils/constants";
import { useLocation } from "react-router-dom";

const StylishBreadcrumbs = () => {
  const location = useLocation();
  const urlSearchParams = new URLSearchParams(location?.search);
  const [queryParams, setQueryParams] = useState(urlSearchParams);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    setQueryParams(new URLSearchParams(location?.search));
  }, [location])

  useEffect(() => {
    const formattedLocation = location?.pathname
      .split("/")
      .slice(1)
      .map((x, i) => ({ element: x, i }))
      .filter((x) => x?.element);
    setRoutes(formattedLocation);
  }, [location]);

  const getHref = (routes, i) => {
    const hRef =
      "/" +
      routes
        ?.slice(0, i + 1)
        ?.map((x) => x?.element)
        ?.join("/");
    return hRef === window.location.pathname ? null : hRef;
  };

  const getRouteLinkName = (routeName) =>
    routeName
      ?.split("-")
      ?.map((key) => key.charAt(0).toUpperCase() + key.slice(1))
      ?.join(" ");

  const getHostname = useMemo(() => {
    const hostName = queryParams.get("id") ?? null;
    if (
      hostName &&
      location?.pathname.includes(pathConstants.systemsMonitorServices)
    ) {
      return (
        <Typography fontWeight="bold" sx={{ color: "primary.main" }}>
          {hostName}
        </Typography>
      );
    }
    return "";
  }, [queryParams, location]);

  return (
    <Breadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextIcon fontSize="small" />}
      sx={{ fontSize: "0.95rem", alignContent: 'center' }}
    >
      <Link
        underline="hover"
        color="inherit"
        href="./"
        sx={{ display: "flex", alignItems: "center", gap: "10px" }}
      >
        <HomeIcon fontSize="small" />
        FIX CONFIGURATOR
      </Link>

      {(routes || []).map((route, index) => {
        const isLast = index === routes.length - 1;
        return isLast ? (
          <Typography
            key={route.i}
            sx={{ fontWeight: "bold", color: "primary.main" }}
          >
            {getRouteLinkName(route.element)}
          </Typography>
        ) : (
          <Link
            key={route.i}
            underline="hover"
            color="inherit"
            href={getHref(routes, route.i)}
            sx={{ textTransform: "capitalize" }}
          >
            {getRouteLinkName(route.element)}
          </Link>
        );
      })}

      {getHostname}
    </Breadcrumbs>
  );
};

export default StylishBreadcrumbs;
