import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { authService } from "../../../services/authService";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const result = await authService.login({
        email: email.trim(),
        password,
      });

      console.log("Logged in user:", result);

      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      console.error("Login failed:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Invalid email or password.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #f5f7ff 0%, #eef1ff 100%)",
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            maxWidth: 440,
            mx: "auto",
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                mx: "auto",
                mb: 2,
                borderRadius: 2,
                backgroundColor: "primary.main",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 25,
                fontWeight: 800,
              }}
            >
              M
            </Box>

            <Typography variant="h4" fontWeight={800}>
              MenuOrdering
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Restaurant Admin
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3 }}
              onClose={() => setError("")}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading}
              autoComplete="email"
              autoFocus
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading}
              autoComplete="current-password"
              sx={{ mb: 3 }}
            />

            <Button
              fullWidth
              size="large"
              variant="contained"
              type="submit"
              disabled={loading}
              sx={{
                py: 1.4,
                borderRadius: 2,
                fontWeight: 700,
              }}
            >
              {loading ? (
                <CircularProgress
                  size={24}
                  color="inherit"
                />
              ) : (
                "Login"
              )}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}