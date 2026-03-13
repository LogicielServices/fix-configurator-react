import { Box } from "@mui/material";
import { InfinitySpin } from "react-loader-spinner";

export const Loader = () => {
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100dvh",
        width: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.75)",
        backdropFilter: "blur(2px)",
        zIndex: (t) => (t?.zIndex?.modal || 0) + 1,
        transform: "translateZ(0)",
        willChange: "opacity, transform",
      }}
    >
      <Box
        sx={{
          transform: "translateZ(0)",
          willChange: "transform",
          animation: "fadeIn 120ms ease-out",
          "@keyframes fadeIn": { from: { opacity: 0 }, to: { opacity: 1 } },
        }}
      >
        <InfinitySpin width="140" color="#2196F3" />
      </Box>
    </Box>
  );
};

export default Loader;
