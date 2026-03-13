import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import {
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  Tooltip,
  IconButton,
  DialogContent,
  CircularProgress,
} from "@mui/material";
import "./index.css";
import { CheckCircle, Close, Error } from "@mui/icons-material";
import { severities, textMessages } from "../../utils/constants";
import { ipv4Regex, validateFields } from "../../utils/formValidator.jsx";
import { checkConnectivity } from "../../Services/TelnetService.js";
import { showErrorToast } from "../../utils/toastsService.js";

const defaultData = Object.freeze({
  destinationIP: "",
  port: "",
});

const TelnetComponent = forwardRef((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldsData, setFieldsData] = useState({ ...defaultData });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({ destinationIP: "" });

  const closeDirPopup = () => setIsOpen(false);

  useImperativeHandle(ref, () => ({
    handleOpenTelnetDialog: () => {
      setFieldsData({ ...defaultData });
      setResult(null);
      setIsOpen(true);
    },
  }));

  const handleCheckConnection = useCallback(async () => {
    setResult(null);
    setIsLoading(true);
    const dataToSubmit = {
      ip: fieldsData?.destinationIP,
      port: fieldsData?.port,
    };
    const response = await checkConnectivity(dataToSubmit);
    setIsLoading(false);
    if (!response?.isSuccess) {
      setResult({
        success: response?.isSuccess,
        message: response?.message || textMessages?.unableToCheckConnectivity,
      });
      return;
    }
    setResult({
      success: response?.isSuccess,
      message: response?.message || textMessages?.connectionSuccessful,
    });
  }, [
    fieldsData?.destinationIP,
    fieldsData?.port,
    showErrorToast,
  ]);

  const ResultIconComponent = (props) => {
    const options = {
      className: props?.className,
      fontSize: props?.fontSize,
      sx: { ...(props?.sx || {}) },
    };
    return props?.result?.success ? (
      <CheckCircle {...options} />
    ) : (
      <Error {...options} />
    );
  };

  const onDstIpChange = useCallback(({ target }) => {
    const val = target?.value;
    if (!ipv4Regex?.basicPattern?.test(val)) return;
    const newErrors = validateFields("Telnet", { ...fieldsData, destinationIP: val });
    setErrors(newErrors);
    setFieldsData((state) => ({ ...state, destinationIP: val }));
  }, [fieldsData]);

  const onPrtChange = ({ target }) => {
    let val = target?.value;
    if (val < 0 || val === "") {
      val = 0;
    } else if (val > 65535) {
      val = 65535;
    }
    setFieldsData((state) => ({ ...state, port: `${+val}` }));
  }

  const onPortKeyDown = (event) => {
    if (event?.key === "e" || event?.key === "E" || event?.key === "+" || event?.key === "-" || event?.key === ".") {
      event?.preventDefault?.();
    }
  };

  const ConnectionChecker = useMemo(() => {
    return (
      <Paper
        className="telnet-classname"
        elevation={0}
        sx={{
          p: 4,
          alignContent: "center",
          width: "100%",
          height: "100%",
          background: "#ffffff",
          borderRadius: 0,
          "& .MuiTextField-root": {
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              border: "2px solid #e2e8f0",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "#cbd5e1",
                boxShadow: "0 2px 8px rgba(33, 150, 243, 0.08)",
              },
              "&.Mui-focused": {
                borderColor: "#2196F3",
                boxShadow: "0 0 0 4px rgba(33, 150, 243, 0.15), 0 2px 12px rgba(33, 150, 243, 0.2)",
                background: "#ffffff",
              },
            },
            "& .MuiOutlinedInput-input": {
              fontSize: "14px",
              fontWeight: 500,
            },
            "& .MuiInputBase-input.Mui-disabled": {
              background: "#f5f5f5",
              color: "#757575",
              opacity: 0.7,
            },
          },
          "& .MuiInputLabel-root": {
            fontWeight: 600,
            fontSize: "13px",
            letterSpacing: "0.3px",
            textTransform: "uppercase",
            "&.Mui-focused": {
              color: "#2196F3",
            },
          },
        }}
      >
        <Stack
          component="form"
          spacing={2}
          onSubmit={(e) => {
            e.preventDefault();
            if (
              fieldsData?.port &&
              fieldsData?.destinationIP &&
              !isLoading
            ) handleCheckConnection();
          }}
        >
          <TextField
            value={fieldsData?.destinationIP}
            label="Destination IP"
            variant="outlined"
            size="small"
            error={Boolean(errors?.destinationIP)}
            helperText={errors?.destinationIP || ipv4Regex?.helperText}
            fullWidth
            onChange={onDstIpChange}
          />
          <TextField
            value={fieldsData?.port}
            label="Port"
            type="number"
            variant="outlined"
            size="small"
            fullWidth
            onChange={onPrtChange}
            onKeyDown={onPortKeyDown}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={
              !fieldsData?.port ||
              !fieldsData?.destinationIP ||
              isLoading ||
              errors?.destinationIP
            }
            endIcon={
              isLoading && (
                <CircularProgress
                  className="d-flex"
                  size="15px"
                  color="inherit"
                />
              )
            }
            sx={{
              textTransform: "uppercase",
              fontWeight: 700,
              letterSpacing: "0.5px",
              background: "linear-gradient(135deg, #2196F3, #42A4F7)",
              boxShadow: "0 4px 12px rgba(33, 150, 243, 0.25)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover:not(:disabled)": {
                background: "linear-gradient(135deg, #64B5F6, #42A4F7)",
                boxShadow: "0 8px 20px rgba(33, 150, 243, 0.35)",
                transform: "translateY(-2px)",
              },
              "&:active:not(:disabled)": {
                background: "linear-gradient(135deg, #1976D2, #1565C0)",
                transform: "translateY(0)",
                boxShadow: "0 2px 4px rgba(33, 150, 243, 0.2)",
              },
              "&:disabled": {
                background: "#ccc",
                color: "#999",
              },
            }}
          >
            Check Connection
          </Button>
          {result && (
            <Typography
              variant="body1"
              fontWeight={700}
              fontFamily="system-ui"
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 2,
                backgroundColor: result?.success ? "#e8f5e9" : "#ffebee",
                color: result?.success ? "#2e7d32" : "#c62828",
                textAlign: "center",
                border: `2px solid ${result?.success ? "#4caf50" : "#f44336"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                animation: "slideDown 0.3s ease-out",
                "@keyframes slideDown": {
                  "0%": {
                    opacity: 0,
                    transform: "translateY(-10px)",
                  },
                  "100%": {
                    opacity: 1,
                    transform: "translateY(0)",
                  },
                },
              }}
            >
              <ResultIconComponent
                result={result}
                className="me-1"
                fontSize="medium"
                sx={{ marginTop: "-4px" }}
              />
              <span>Result: </span>
              <span style={{ fontWeight: 400 }}>{result?.message}</span>
            </Typography>
          )}
        </Stack>
      </Paper>
    );
  }, [
    handleCheckConnection,
    result,
    fieldsData?.destinationIP,
    fieldsData?.port,
    isLoading,
    errors?.destinationIP,
    onDstIpChange
  ]);

  return (
    <Dialog
      open={isOpen}
      onClose={(event, reason) => {
        if (reason === "backdropClick") return; // Ignore backdrop clicks
        closeDirPopup();
      }}
      fullWidth
      maxWidth="sm"
      sx={{
        "& .MuiBackdrop-root": {
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
        },
        "& .MuiDialog-paper": {
          borderRadius: "12px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3), 0 0 1px rgba(33, 150, 243, 0.5) inset",
          background: "#ffffff",
          animation: "slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          "@keyframes slideUp": {
            "0%": {
              opacity: 0,
              transform: "translateY(40px)",
            },
            "100%": {
              opacity: 1,
              transform: "translateY(0)",
            },
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)",
          color: "#fff",
          fontWeight: 700,
          padding: "18px 24px",
          borderBottom: "2px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 4px 12px rgba(33, 150, 243, 0.2)",
          textTransform: "uppercase",
          letterSpacing: "0.75px",
          fontSize: "13px",
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, textAlign: "center", flex: 1, letterSpacing: "0.5px" }}
        >
          Connection Checker (Telnet)
        </Typography>
        <Tooltip title="Close" arrow>
          <IconButton
            sx={{
              color: "#fff",
              opacity: 0.8,
              transition: "all 0.2s ease",
              "&:hover": {
                opacity: 1,
                transform: "scale(1.1)",
                background: "rgba(255, 255, 255, 0.2)",
              },
            }}
            onClick={closeDirPopup}
          >
            <Close />
          </IconButton>
        </Tooltip>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>{ConnectionChecker}</DialogContent>
    </Dialog>
  );
});

export default TelnetComponent;
