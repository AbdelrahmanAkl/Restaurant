import {
  AccountCircleOutlined,
  LogoutOutlined,
  NotificationsNoneOutlined,
} from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { authService } from "../../services/authService";

export default function Topbar() {
  const user = authService.getUser();

  const [anchorEl, setAnchorEl] =
    useState<null | HTMLElement>(null);

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      color="inherit"
      sx={{
        left: 250,
        width: "calc(100% - 250px)",
        borderBottom: 1,
        borderColor: "divider",
        backgroundColor: "background.paper",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Restaurant Admin
          </Typography>

          <Typography
            variant="body1"
            fontWeight={700}
          >
            Overview
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <IconButton>
            <NotificationsNoneOutlined />
          </IconButton>

          <IconButton
            onClick={(event) =>
              setAnchorEl(event.currentTarget)
            }
          >
            <Avatar
              sx={{
                width: 34,
                height: 34,
                backgroundColor: "primary.main",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {user?.fullName?.charAt(0).toUpperCase() ?? "U"}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem disabled>
              <AccountCircleOutlined
                sx={{ mr: 1 }}
              />
              {user?.fullName ?? "User"}
            </MenuItem>

            <MenuItem
              onClick={handleLogout}
            >
              <LogoutOutlined
                sx={{ mr: 1 }}
              />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}