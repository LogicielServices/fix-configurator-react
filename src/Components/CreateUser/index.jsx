import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Dialog,
  Tooltip,
  IconButton,
  DialogContent,
  CircularProgress,
  Stack,
  FormControlLabel,
  Switch,
  Grid,
  Divider,
  Slide,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { Close, PersonAddRounded } from "@mui/icons-material";
import GlobalContext from "../../Provider/GlobalProvider.jsx";
import { severities, textMessages } from "../../utils/constants.js";
// import { addUser } from "../../services/userService.js";
import { validateFields } from "../../utils/formValidator.jsx";
import { getAllUserRoles, registerUser } from "../../Services/AccountService.js";
import { showErrorToast, showSuccessToast } from "../../utils/toastsService.js";
import { LoadIndicator } from "devextreme-react";
import { GlobalLoaderComponent } from "../../utils/GlobalHandler.jsx";

const defaultData = Object.freeze({
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  allowTFA: false,
  role: "",
  password: "",
  confirmPassword: "",
});

// Slide transition for dialog
const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CreateUser = forwardRef((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldsData, setFieldsData] = useState({ ...defaultData });
  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({});
  const [dataLoading, setDataLoading] = useState({ roles: false });

  const closeDirPopup = () => setIsOpen(false);

  useImperativeHandle(ref, () => ({
    handleOpenCreateUserDialog: () => {
      setFieldsData({ ...defaultData });
      setErrors({});
      setIsOpen(true);
    },
  }));

  const getRoles = async () => {
    setDataLoading((dl) => ({ ...dl, roles: true }));
    const response = await getAllUserRoles();
    const roleDTOs = response?.roleDTOs?.map(x => x?.roleName);
    setRoles(roleDTOs || []);
    setDataLoading((dl) => ({ ...dl, roles: false }));
  }

  useEffect(() => {
    if (isOpen) getRoles();
  }, [isOpen])

  const handleSubmitData = useCallback(async () => {
    const newErrors = validateFields("Users", fieldsData);
    setErrors(newErrors);
    if (!Object.keys(newErrors)?.length) {
      setIsLoading(true);
      fieldsData.allowTFA = undefined;
      const response = await registerUser(fieldsData);
      setIsLoading(false);
      if (response?.isSuccess) {
        showSuccessToast(response?.message || textMessages?.userWasCreatedSuccessfully);
        closeDirPopup();
        return;
      } else {
        showErrorToast(response?.message || textMessages?.userCanNotBeCreated);
      }
    }
  }, [fieldsData]);

  const handleChange = (field, value) =>
    setFieldsData((state) => ({ ...state, [field]: value }));

  const allowSubmit =
    fieldsData?.firstName &&
    fieldsData?.lastName &&
    fieldsData?.username &&
    fieldsData?.email &&
    fieldsData?.role &&
    fieldsData?.password &&
    fieldsData?.confirmPassword &&
    !isLoading;

  const AddUserForm = useMemo(() => {
    return (
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          if (allowSubmit) handleSubmitData();
        }}
        noValidate
      >
        <Stack spacing={2}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Create a new user!
          </Typography>

          <Grid container columnGap={1}>
            <Grid item xs={12} sm={5.8}>
              <TextField
                label="First Name"
                variant="outlined"
                size="small"
                fullWidth
                required
                autoFocus
                value={fieldsData?.firstName}
                onChange={({ target }) =>
                  handleChange("firstName", target?.value)
                }
                error={!!errors?.firstName}
                helperText={errors?.firstName}
                autoComplete="given-name"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name"
                variant="outlined"
                size="small"
                fullWidth
                required
                value={fieldsData?.lastName}
                onChange={({ target }) =>
                  handleChange("lastName", target?.value)
                }
                error={!!errors?.lastName}
                helperText={errors?.lastName}
                autoComplete="family-name"
              />
            </Grid>
          </Grid>

          <TextField
            label="Username"
            variant="outlined"
            size="small"
            fullWidth
            required
            value={fieldsData?.username}
            onChange={({ target }) => handleChange("username", target?.value)}
            error={!!errors?.username}
            helperText={errors?.username}
            autoComplete="username"
          />

          <TextField
            label="Email"
            variant="outlined"
            type="email"
            size="small"
            fullWidth
            required
            value={fieldsData?.email}
            onChange={({ target }) => handleChange("email", target?.value)}
            error={!!errors?.email}
            helperText={errors?.email}
            autoComplete="email"
          />
          
          <Grid container columnGap={1}>
            <Grid item xs={12} sm={5.8}>
              <TextField
                label="Password"
                variant="outlined"
                type="password"
                size="small"
                fullWidth
                required
                value={fieldsData?.password}
                onChange={({ target }) => handleChange("password", target?.value)}
                error={!!errors?.password}
                helperText={errors?.password}
                autoComplete="password"
              />
            </Grid>
              
            <Grid item xs={12} sm={6}>
              <TextField
                label="Confirm Password"
                variant="outlined"
                type="password"
                size="small"
                fullWidth
                required
                value={fieldsData?.confirmPassword}
                onChange={({ target }) => handleChange("confirmPassword", target?.value)}
                error={!!errors?.confirmPassword}
                helperText={errors?.confirmPassword}
                autoComplete="confirmPassword"
              />
            </Grid>
          </Grid>

          <FormControl sx={{ width: "100%" }} size="small" required error={!!errors?.role}>
            <InputLabel>Role</InputLabel>
            <Select
              label="Role"
              value={fieldsData?.role}
              MenuProps={{ sx: { height: 300 } }}
              onChange={({ target }) => handleChange("role", target?.value)}
            >
              {
                dataLoading?.roles ? <GlobalLoaderComponent /> :
                (roles || []).map((x) => (
                  <MenuItem key={x} value={x}>
                    {x}
                  </MenuItem>
                ))
              }
            </Select>
            {!!errors?.role && <FormHelperText>{errors?.role}</FormHelperText>}
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={fieldsData?.allowTFA || false}
                onChange={({ target }) =>
                  handleChange("allowTFA", target.checked)
                }
                color="primary"
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: "#1976d2" },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#1976d2",
                  },
                  "& .MuiSwitch-track": { backgroundColor: "#ccc" },
                }}
                inputProps={{ "aria-label": "Allow Two-Factor Authentication" }}
              />
            }
            label="Allow Two-Factor Authentication"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              color: "rgba(0, 0, 0, 0.6)",
              p: 0.3,
              pr: 2,
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              backgroundColor: "#fafafa",
              m: 0,
            }}
          />

          <Divider sx={{ my: 1.5 }} />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            disabled={!allowSubmit}
            endIcon={
              isLoading && (
                <CircularProgress className="d-flex" size="15px" color="inherit" />
              )
            }
            sx={{
              textTransform: "none",
              fontWeight: "bold",
              py: 1.2,
              borderRadius: 2,
              boxShadow: "0 8px 20px rgba(25,118,210,0.3)",
            }}
          >
            Create
          </Button>
        </Stack>
      </Box>
    );
  }, [handleSubmitData, fieldsData, isLoading, errors, allowSubmit, roles]);

  return (
    <Dialog
      open={isOpen}
      onClose={(event, reason) => {
        if (reason === "backdropClick") return; // Ignore backdrop clicks
        closeDirPopup();
      }}
      fullScreen
      TransitionComponent={Transition}
      aria-labelledby="create-user-title"
      sx={{
        "& .MuiDialog-paper": {
          backgroundColor: "#f5f7fb !important",
          boxShadow: "none",
        },
      }}
    >
      {/* Floating close button */}
      <Tooltip title="Close">
        <IconButton
          onClick={closeDirPopup}
          sx={{
            position: "fixed",
            top: 16,
            right: 16,
            zIndex: (theme) => theme.zIndex.tooltip + 1,
            bgcolor: "rgba(0,0,0,0.5)",
            color: "#fff",
            "&:hover": { bgcolor: "rgba(0,0,0,0.65)" },
          }}
          aria-label="Close create user dialog"
        >
          <Close />
        </IconButton>
      </Tooltip>

      <DialogContent sx={{ p: 0 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            height: "100vh",
          }}
        >
          {/* LEFT HERO PANEL */}
          <Box
            sx={{
              position: "relative",
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              justifyContent: "center",
              p: { xs: 4, md: 6 },
              color: "#fff",
              background:
                "radial-gradient(1200px 600px at 80% -20%, rgba(66,165,245,0.35) 0%, transparent 60%), " +
                "radial-gradient(1000px 500px at -20% 120%, rgba(25,118,210,0.35) 0%, transparent 60%), " +
                "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
              overflow: "hidden",
            }}
          >
            <Box sx={{ textAlign: "center", maxWidth: 560 }}>
              <PersonAddRounded
                sx={{
                  fontSize: { xs: 96, md: 128, lg: 160 },
                  filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.35))",
                }}
                aria-hidden="true"
              />
              <Typography
                id="create-user-title"
                variant="h3"
                sx={{
                  fontWeight: 800,
                  mt: 2,
                  letterSpacing: 0.4,
                  textShadow: "0 4px 18px rgba(0,0,0,0.25)",
                }}
              >
                Create User
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  display: 'block',
                  mt: 1.5,
                  opacity: 0.9,
                }}
              >
                Create a new user, and optionally enable 2FA for
                added security.
              </Typography>

              {/* Decorative soft blobs */}
              <Box
                sx={{
                  position: "absolute",
                  width: 220,
                  height: 220,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.12)",
                  top: { xs: "8%", md: "12%" },
                  left: { xs: "-8%", md: "-5%" },
                  filter: "blur(10px)",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  width: 280,
                  height: 280,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.08)",
                  bottom: { xs: "-6%", md: "-10%" },
                  right: { xs: "-10%", md: "-6%" },
                  filter: "blur(14px)",
                }}
              />
            </Box>
          </Box>

          {/* RIGHT FORM PANEL */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: { xs: 3, md: 6 },
              backgroundColor: "#f5f7fb",
            }}
          >
            <Paper
              elevation={8}
              sx={{
                width: "100%",
                maxWidth: 600,
                borderRadius: 3,
                p: { xs: 3, md: 4 },
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(6px)",
                boxShadow:
                  "0 24px 64px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.6)",
              }}
            >
              {/* Small heading to complement left title */}
              <Typography
                variant="subtitle2"
                sx={{ color: "text.secondary", mb: 1 }}
              >
                Please fill in the following details
              </Typography>

              {AddUserForm}
            </Paper>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
});

export default CreateUser;
