import {
  AssessmentOutlined,
  DashboardOutlined,
  GroupsOutlined,
  Inventory2Outlined,
  LocalDiningOutlined,
  PaymentsOutlined,
  QrCode2Outlined,
  RestaurantOutlined,
  SettingsOutlined,
  StorefrontOutlined,
} from "@mui/icons-material";

import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

import { NavLink } from "react-router-dom";

import { authService } from "../../services/authService";

const workspaceItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <DashboardOutlined />,
  },
  {
    label: "Restaurant",
    path: "/restaurant",
    icon: <RestaurantOutlined />,
  },
  {
    label: "Branches",
    path: "/branches",
    icon: <StorefrontOutlined />,
  },
  {
    label: "Users & Roles",
    path: "/users",
    icon: <GroupsOutlined />,
    permission: "users",
  },
];

const operationItems = [
  {
    label: "Menu",
    path: "/menu",
    icon: <LocalDiningOutlined />,
    permission: "menu",
  },
  {
    label: "Tables & QR",
    path: "/tables",
    icon: <QrCode2Outlined />,
  },
  {
    label: "Orders",
    path: "/orders",
    icon: <Inventory2Outlined />,
  },
  {
    label: "Payments",
    path: "/payments",
    icon: <PaymentsOutlined />,
  },
];

const insightItems = [
  {
    label: "Reports",
    path: "/reports",
    icon: <AssessmentOutlined />,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: <SettingsOutlined />,
  },
];

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  permission?: "users" | "menu";
}

function MenuSection({
  title,
  items,
}: {
  title: string;
  items: MenuItem[];
}) {
  return (
    <>
      <Typography
        variant="caption"
        sx={{
          display: "block",
          px: 2,
          pt: 2.5,
          pb: 0.75,
          color: "text.secondary",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {title}
      </Typography>

      <List disablePadding>
        {items.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            sx={{
              mx: 1,
              mb: 0.5,
              minHeight: 44,
              borderRadius: 2,
              color: "text.secondary",
              position: "relative",

              "& .MuiListItemIcon-root": {
                color: "inherit",
                minWidth: 40,
              },

              "& .MuiListItemText-primary": {
                fontSize: 14,
                fontWeight: 600,
              },

              "&.active": {
                color: "primary.main",
                backgroundColor:
                  "rgba(99, 91, 255, 0.10)",
              },

              "&.active .MuiListItemText-primary": {
                color: "primary.main",
                fontWeight: 700,
              },

              "&.active .MuiListItemIcon-root": {
                color: "primary.main",
              },

              "&.active::before": {
                content: '""',
                position: "absolute",
                left: 0,
                top: 8,
                bottom: 8,
                width: 3,
                borderRadius: "0 4px 4px 0",
                backgroundColor: "primary.main",
              },

              "&:hover": {
                backgroundColor: "action.hover",
              },

              "&.active:hover": {
                backgroundColor:
                  "rgba(99, 91, 255, 0.14)",
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </>
  );
}

export default function Sidebar() {
  const user = authService.getUser();

  const canAccessUsers =
    user?.role === "SuperAdmin" ||
    user?.role === "Admin" ||
    user?.role === "RestaurantManager" ||
    user?.role === "BranchManager";

  const canAccessMenu =
    user?.role === "SuperAdmin" ||
    user?.role === "Admin" ||
    user?.role === "RestaurantManager";

  const visibleWorkspaceItems = workspaceItems.filter((item) => {
    if (item.permission === "users") {
      return canAccessUsers;
    }

    return true;
  });

  const visibleOperationItems = operationItems.filter((item) => {
    if (item.permission === "menu") {
      return canAccessMenu;
    }

    return true;
  });

  return (
    <Box
      component="aside"
      sx={{
        width: 250,
        flexShrink: 0,
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
        zIndex: 1200,
      }}
    >
      <Box
        sx={{
          height: 72,
          px: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            backgroundColor: "primary.main",
            color: "white",
            fontSize: 20,
            fontWeight: 900,
          }}
        >
          M
        </Box>

        <Box>
          <Typography sx={{ fontWeight: 800, lineHeight: 1.1 }}>
            MenuOrdering
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Restaurant Admin
          </Typography>
        </Box>
      </Box>

      <Divider />

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          py: 1,
        }}
      >
        <MenuSection title="Workspace" items={visibleWorkspaceItems} />
        <MenuSection title="Operations" items={visibleOperationItems} />
        <MenuSection title="Insights" items={insightItems} />
      </Box>
    </Box>
  );
}
