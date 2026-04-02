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

  const getId = useMemo(() => {
    const id = queryParams.get("id") ?? null;
    if (id) {
      return (
        <Typography fontWeight="bold" sx={{ color: "primary.main" }}>
          {id}
        </Typography>
      );
    }
    return "";
  }, [queryParams, location]);

  return (
    <Breadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextIcon fontSize="small" sx={{ transition: "all 0.2s ease" }} />}
      sx={{
        fontSize: "0.9rem",
        alignContent: "center",
        padding: "8px 12px",
        background: "linear-gradient(to right, #ffffff, #f8fafc)",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 8px rgba(33, 150, 243, 0.05)",
        "& .MuiBreadcrumbs-ol": {
          gap: "8px",
        },
        "& .MuiBreadcrumbs-separator": {
          color: "#cbd5e1",
          fontSize: "16px",
        },
      }}
    >
      <Link
        underline="hover"
        color="inherit"
        href="/"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "#64748b",
          transition: "all 0.2s ease",
          fontWeight: 500,
          "&:hover": {
            color: "#2196F3",
            textDecoration: "none",
            transform: "translateX(2px)",
            "& .MuiSvgIcon-root": {
              color: "#2196F3",
              transform: "scale(1.15)",
            },
          },
        }}
      >
        <HomeIcon
          fontSize="small"
          sx={{
            fontSize: "18px",
            transition: "all 0.2s ease",
            color: "inherit",
          }}
        />
        <span style={{ textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
          FIX CONFIGURATOR
        </span>
      </Link>

      {(routes || []).map((route, index) => {
        const isLast = index === routes.length - 1;
        return isLast ? (
          <Typography
            key={route.i}
            sx={{
              fontWeight: 700,
              color: "#2196F3",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              textTransform: "capitalize",
              fontSize: "0.95rem",
            }}
          >
            {getRouteLinkName(route.element)}
          </Typography>
        ) : (
          <Link
            key={route.i}
            underline="hover"
            color="inherit"
            href={getHref(routes, route.i)}
            sx={{
              textTransform: "capitalize",
              color: "#64748b",
              transition: "all 0.2s ease",
              fontWeight: 500,
              "&:hover": {
                color: "#2196F3",
                textDecoration: "none",
                transform: "translateX(2px)",
              },
            }}
          >
            {getRouteLinkName(route.element)}
          </Link>
        );
      })}

      {getId && (
        <Typography
          sx={{
            fontWeight: 600,
            color: "#2196F3",
            fontSize: "0.95rem",
            padding: "2px 8px",
            background: "rgba(33, 150, 243, 0.08)",
            borderRadius: "6px",
          }}
        >
          {queryParams.get("id")}
        </Typography>
      )}
    </Breadcrumbs>
  );
};

export default StylishBreadcrumbs;
