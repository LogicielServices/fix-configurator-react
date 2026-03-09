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
        elevation={6}
        sx={{
          p: 4,
          alignContent: "center",
          width: "100%",
          height: "100%",
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
            sx={{ textTransform: "none", fontWeight: "bold" }}
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
                p: 1,
                borderRadius: 2,
                backgroundColor: result?.success ? "#e8f5e9" : "#ffebee",
                color: result?.success ? "#2e7d32" : "#c62828",
                textAlign: "center",
              }}
            >
              <ResultIconComponent
                success={result?.success}
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
        "& .MuiDialog-paper": {
          borderRadius: "10px",
          boxShadow: "0 12px 32px rgba(0,0,0,0.3)",
          background: "#fdfdfd",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "linear-gradient(135deg, #1976d2, #42a5f5)",
          color: "#fff",
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", textAlign: "center" }}
        >
          Connection Checker (Telnet)
        </Typography>
        <Tooltip title="Close">
          <IconButton sx={{ color: "#fff" }} onClick={closeDirPopup}>
            <Close />
          </IconButton>
        </Tooltip>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>{ConnectionChecker}</DialogContent>
    </Dialog>
  );
});

export default TelnetComponent;
