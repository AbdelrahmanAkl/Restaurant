import { useEffect, useMemo, useState } from "react";
import {
  AccessTimeOutlined,
  ArrowForwardOutlined,
  AssessmentOutlined,
  GroupsOutlined,
  Inventory2Outlined,
  PaymentsOutlined,
  RefreshOutlined,
  RestaurantOutlined,
  TableRestaurantOutlined,
  TrendingUpOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { authService } from "../../../services/authService";

interface Restaurant {
  id: number;
  name: string;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
  createdAt: string;
  branchCount: number;
}

interface Branch {
  id: number;
  restaurantId: number;
  restaurantName: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  isActive: boolean;
  tableCount: number;
}

interface Table {
  id: number;
  tableNumber: string;
  qrCode?: string | null;
  isActive: boolean;
}

interface OrderItem {
  id: number;
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string | null;
}

interface Order {
  id: number;
  tableId: number;
  tableNumber: string;
  status: number | string;
  subTotal: number;
  tax: number;
  total: number;
  createdAt: string;
  completedAt?: string | null;
  items: OrderItem[];
}

function isToday(date: string) {
  const value = new Date(date);
  const now = new Date();

  return (
    value.getFullYear() === now.getFullYear() &&
    value.getMonth() === now.getMonth() &&
    value.getDate() === now.getDate()
  );
}

function getStatusName(status: number | string) {
  if (typeof status === "string") {
    return status;
  }

  switch (status) {
    case 1:
      return "Pending";
    case 2:
      return "Preparing";
    case 3:
      return "Ready";
    case 4:
      return "Completed";
    case 5:
      return "Cancelled";
    default:
      return "Unknown";
  }
}

function getStatusColor(
  status: number | string
):
  | "warning"
  | "info"
  | "success"
  | "error"
  | "default" {
  const name =
    getStatusName(status).toLowerCase();

  switch (name) {
    case "pending":
      return "warning";

    case "preparing":
      return "info";

    case "ready":
    case "completed":
      return "success";

    case "cancelled":
      return "error";

    default:
      return "default";
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatTime(date: string) {
  return new Intl.DateTimeFormat("en-EG", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = authService.getUser();

  const [restaurant, setRestaurant] =
    useState<Restaurant | null>(null);

  const [branches, setBranches] =
    useState<Branch[]>([]);

  const [tables, setTables] =
    useState<Table[]>([]);

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        branchesResponse,
        tablesResponse,
        ordersResponse,
      ] = await Promise.all([
        api.get<Branch[]>("/Branches"),
        api.get<Table[]>("/Tables"),
        api.get<Order[]>("/Orders"),
      ]);

      setBranches(
        branchesResponse.data ?? []
      );

      setTables(
        tablesResponse.data ?? []
      );

      setOrders(
        ordersResponse.data ?? []
      );

      if (user?.restaurantId) {
        try {
          const restaurantResponse =
            await api.get<Restaurant>(
              `/Restaurants/${user.restaurantId}`
            );

          setRestaurant(
            restaurantResponse.data
          );
        } catch {
          // Restaurant details are optional
          // for the dashboard.
        }
      }
    } catch (err: any) {
      console.error(
        "Dashboard loading failed:",
        err
      );

      const message =
        err?.response?.data?.message ||
        "Unable to load dashboard data.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const todayOrders = useMemo(
    () =>
      orders.filter((order) =>
        isToday(order.createdAt)
      ),
    [orders]
  );

  const todayRevenue = useMemo(
    () =>
      todayOrders.reduce(
        (sum, order) =>
          sum + Number(order.total || 0),
        0
      ),
    [todayOrders]
  );

  const pendingOrders = useMemo(
    () =>
      todayOrders.filter(
        (order) =>
          getStatusName(
            order.status
          ).toLowerCase() === "pending"
      ).length,
    [todayOrders]
  );

  const preparingOrders = useMemo(
    () =>
      todayOrders.filter(
        (order) =>
          getStatusName(
            order.status
          ).toLowerCase() === "preparing"
      ).length,
    [todayOrders]
  );

  const readyOrders = useMemo(
    () =>
      todayOrders.filter(
        (order) =>
          getStatusName(
            order.status
          ).toLowerCase() === "ready"
      ).length,
    [todayOrders]
  );

  const completedOrders = useMemo(
    () =>
      todayOrders.filter(
        (order) =>
          getStatusName(
            order.status
          ).toLowerCase() === "completed"
      ).length,
    [todayOrders]
  );

  const activeTables = tables.filter(
    (table) => table.isActive
  ).length;

  const activeBranches = branches.filter(
    (branch) => branch.isActive
  );

  const inactiveBranches = branches.filter(
    (branch) => !branch.isActive
  );

  const recentOrders = orders.slice(0, 6);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <CircularProgress />

        <Typography color="text.secondary">
          Loading dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: {
            xs: "flex-start",
            md: "center",
          },
          flexDirection: {
            xs: "column",
            md: "row",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
          >
            Good morning,{" "}
            {user?.fullName?.split(" ")[0] ||
              "there"}
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Here's what's happening across
            your restaurant today.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh dashboard">
            <IconButton
              onClick={loadDashboard}
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <RefreshOutlined />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            startIcon={
              <Inventory2Outlined />
            }
            onClick={() =>
              navigate("/orders")
            }
            sx={{
              borderRadius: 2,
              fontWeight: 700,
            }}
          >
            View Orders
          </Button>
        </Stack>
      </Box>

      {/* Error */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={loadDashboard}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Restaurant */}
      {restaurant && (
        <Paper
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
            border: 1,
            borderColor: "divider",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                backgroundColor:
                  "rgba(99,91,255,0.10)",
                color: "primary.main",
              }}
            >
              <RestaurantOutlined />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography fontWeight={800}>
                {restaurant.name}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {restaurant.branchCount}{" "}
                {restaurant.branchCount === 1
                  ? "branch"
                  : "branches"}
              </Typography>
            </Box>

            <Chip
              label={
                restaurant.isActive
                  ? "Active"
                  : "Inactive"
              }
              color={
                restaurant.isActive
                  ? "success"
                  : "error"
              }
              size="small"
            />
          </Stack>
        </Paper>
      )}

      {/* Statistics */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Today's Revenue"
            value={formatCurrency(
              todayRevenue
            )}
            subtitle="From today's orders"
            icon={<PaymentsOutlined />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Today's Orders"
            value={todayOrders.length.toString()}
            subtitle="Orders received today"
            icon={
              <Inventory2Outlined />
            }
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Pending Orders"
            value={pendingOrders.toString()}
            subtitle={`${preparingOrders} currently preparing`}
            icon={<AccessTimeOutlined />}
            warning={pendingOrders > 0}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Active Tables"
            value={`${activeTables} / ${tables.length}`}
            subtitle="Active restaurant tables"
            icon={
              <TableRestaurantOutlined />
            }
          />
        </Grid>
      </Grid>

      {/* Main */}
      <Grid
        container
        spacing={2.5}
        sx={{ mt: 0.5 }}
      >
        {/* Recent Orders */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper
            sx={{
              borderRadius: 3,
              border: 1,
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                p: 2.5,
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={800}
                >
                  Recent Orders
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Latest restaurant activity
                </Typography>
              </Box>

              <Button
                size="small"
                endIcon={
                  <ArrowForwardOutlined />
                }
                onClick={() =>
                  navigate("/orders")
                }
              >
                View all
              </Button>
            </Box>

            <Divider />

            {recentOrders.length === 0 ? (
              <EmptyState
                icon={
                  <Inventory2Outlined />
                }
                title="No orders yet"
                subtitle="Orders will appear here when customers place them."
              />
            ) : (
              recentOrders.map(
                (order, index) => (
                  <Box key={order.id}>
                    <Box
                      onClick={() =>
                        navigate(
                          `/orders/${order.id}`
                        )
                      }
                      sx={{
                        p: 2,
                        display: "flex",
                        alignItems:
                          "center",
                        gap: 2,
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor:
                            "action.hover",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          flexShrink: 0,
                          borderRadius: 2,
                          display: "grid",
                          placeItems: "center",
                          backgroundColor:
                            "action.hover",
                        }}
                      >
                        <Typography
                          fontWeight={800}
                          fontSize={13}
                        >
                          #{order.id}
                        </Typography>
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={700}>
                          Table{" "}
                          {order.tableNumber}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {order.items?.length ||
                            0}{" "}
                          {order.items?.length ===
                          1
                            ? "item"
                            : "items"}{" "}
                          ·{" "}
                          {formatTime(
                            order.createdAt
                          )}
                        </Typography>
                      </Box>

                      <Chip
                        label={getStatusName(
                          order.status
                        )}
                        color={getStatusColor(
                          order.status
                        )}
                        size="small"
                      />

                      <Typography
                        fontWeight={800}
                        sx={{
                          minWidth: 100,
                          textAlign:
                            "right",
                        }}
                      >
                        {formatCurrency(
                          Number(
                            order.total || 0
                          )
                        )}
                      </Typography>
                    </Box>

                    {index <
                      recentOrders.length -
                        1 && <Divider />}
                  </Box>
                )
              )
            )}
          </Paper>
        </Grid>

        {/* Branches */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper
            sx={{
              borderRadius: 3,
              border: 1,
              borderColor: "divider",
              height: "100%",
            }}
          >
            <Box
              sx={{
                p: 2.5,
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={800}
                >
                  Branches
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Current branch status
                </Typography>
              </Box>

              <Button
                size="small"
                onClick={() =>
                  navigate("/branches")
                }
              >
                Manage
              </Button>
            </Box>

            <Divider />

            {branches.length === 0 ? (
              <EmptyState
                icon={
                  <RestaurantOutlined />
                }
                title="No branches"
                subtitle="Create your first branch."
              />
            ) : (
              <Box sx={{ px: 2.5 }}>
                {branches
                  .slice(0, 5)
                  .map(
                    (branch, index) => (
                      <Box key={branch.id}>
                        <Box
                          sx={{
                            py: 2,
                            display: "flex",
                            alignItems:
                              "center",
                            gap: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              display: "grid",
                              placeItems:
                                "center",
                              backgroundColor:
                                branch.isActive
                                  ? "rgba(46,125,50,0.10)"
                                  : "rgba(211,47,47,0.10)",
                              color:
                                branch.isActive
                                  ? "success.main"
                                  : "error.main",
                            }}
                          >
                            <RestaurantOutlined fontSize="small" />
                          </Box>

                          <Box
                            sx={{ flex: 1 }}
                          >
                            <Typography
                              fontWeight={700}
                              noWrap
                            >
                              {branch.name}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {
                                branch.tableCount
                              }{" "}
                              {branch.tableCount ===
                              1
                                ? "table"
                                : "tables"}
                            </Typography>
                          </Box>

                          <Chip
                            label={
                              branch.isActive
                                ? "Open"
                                : "Inactive"
                            }
                            color={
                              branch.isActive
                                ? "success"
                                : "default"
                            }
                            size="small"
                            variant="outlined"
                          />
                        </Box>

                        {index <
                          Math.min(
                            branches.length,
                            5
                          ) -
                            1 && (
                          <Divider />
                        )}
                      </Box>
                    )
                  )}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Order Status */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: 1,
              borderColor: "divider",
            }}
          >
            <Typography
              variant="h6"
              fontWeight={800}
            >
              Order Status
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Today's order workflow
            </Typography>

            <StatusRow
              label="Pending"
              value={pendingOrders}
              total={todayOrders.length}
              color="warning"
            />

            <StatusRow
              label="Preparing"
              value={preparingOrders}
              total={todayOrders.length}
              color="info"
            />

            <StatusRow
              label="Ready"
              value={readyOrders}
              total={todayOrders.length}
              color="success"
            />

            <StatusRow
              label="Completed"
              value={completedOrders}
              total={todayOrders.length}
              color="success"
            />
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: 1,
              borderColor: "divider",
            }}
          >
            <Typography
              variant="h6"
              fontWeight={800}
            >
              Quick Actions
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              Common restaurant tasks
            </Typography>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6 }}>
                <QuickAction
                  icon={
                    <RestaurantOutlined />
                  }
                  title="Manage Menu"
                  subtitle="Products & categories"
                  onClick={() =>
                    navigate("/menu")
                  }
                />
              </Grid>

              <Grid size={{ xs: 6 }}>
                <QuickAction
                  icon={
                    <TableRestaurantOutlined />
                  }
                  title="Tables & QR"
                  subtitle="Manage tables"
                  onClick={() =>
                    navigate("/tables")
                  }
                />
              </Grid>

              <Grid size={{ xs: 6 }}>
                <QuickAction
                  icon={<GroupsOutlined />}
                  title="Staff"
                  subtitle="Users & roles"
                  onClick={() =>
                    navigate("/users")
                  }
                />
              </Grid>

              <Grid size={{ xs: 6 }}>
                <QuickAction
                  icon={
                    <AssessmentOutlined />
                  }
                  title="Reports"
                  subtitle="View performance"
                  onClick={() =>
                    navigate("/reports")
                  }
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Inactive branches */}
      {inactiveBranches.length > 0 && (
        <Alert
          severity="warning"
          icon={
            <WarningAmberOutlined />
          }
          sx={{
            mt: 2.5,
            borderRadius: 3,
          }}
        >
          {inactiveBranches.length}{" "}
          {inactiveBranches.length === 1
            ? "branch is"
            : "branches are"}{" "}
          currently inactive.
        </Alert>
      )}

      {/* Active branch summary */}
      {activeBranches.length > 0 && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            mt: 2,
          }}
        >
          {activeBranches.length} active{" "}
          {activeBranches.length === 1
            ? "branch"
            : "branches"}{" "}
          are currently available.
        </Typography>
      )}
    </Box>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  warning = false,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  warning?: boolean;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 3,
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "flex-start",
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight={600}
          >
            {title}
          </Typography>

          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              color: warning
                ? "warning.main"
                : "primary.main",
              backgroundColor: warning
                ? "rgba(237,108,2,0.10)"
                : "rgba(99,91,255,0.10)",
            }}
          >
            {icon}
          </Box>
        </Box>

        <Typography
          variant="h5"
          fontWeight={800}
          sx={{ mt: 2 }}
        >
          {value}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
        >
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
}

function StatusRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color:
    | "warning"
    | "info"
    | "success";
}) {
  const percentage =
    total === 0
      ? 0
      : Math.min(
          100,
          Math.round(
            (value / total) * 100
          )
        );

  return (
    <Box sx={{ mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent:
            "space-between",
          mb: 0.75,
        }}
      >
        <Typography
          variant="body2"
          fontWeight={600}
        >
          {label}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          {value}
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={percentage}
        color={color}
        sx={{
          height: 7,
          borderRadius: 10,
        }}
      />
    </Box>
  );
}

function QuickAction({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <Button
      fullWidth
      onClick={onClick}
      sx={{
        p: 1.5,
        minHeight: 76,
        justifyContent:
          "flex-start",
        textAlign: "left",
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        color: "text.primary",
        textTransform: "none",
      }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          mr: 1.5,
          borderRadius: 1.5,
          display: "grid",
          placeItems: "center",
          backgroundColor:
            "action.hover",
          color: "primary.main",
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography
          variant="body2"
          fontWeight={700}
        >
          {title}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
        >
          {subtitle}
        </Typography>
      </Box>
    </Button>
  );
}

function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Box
      sx={{
        py: 6,
        px: 3,
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          mx: "auto",
          mb: 1.5,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          backgroundColor:
            "action.hover",
          color: "text.secondary",
        }}
      >
        {icon}
      </Box>

      <Typography fontWeight={700}>
        {title}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 0.5 }}
      >
        {subtitle}
      </Typography>
    </Box>
  );
}