import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminLayout() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
      }}
    >
      <Sidebar />

      <Topbar />

      <Box
        component="main"
        sx={{
          ml: "250px",
          pt: "72px",
          minHeight: "100vh",
        }}
      >
        <Box
          sx={{
            p: {
              xs: 2,
              md: 3,
              lg: 4,
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}