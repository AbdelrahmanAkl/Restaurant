import { useEffect, useMemo, useState } from "react";
import {
  AddOutlined,
  DeleteOutlined,
  EditOutlined,
  PeopleAltOutlined,
  RefreshOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import { authService } from "../../../services/authService";
import { branchService } from "../../../services/branchService";
import { restaurantService } from "../../../services/restaurantService";
import { userService } from "../../../services/userService";
import type { Branch } from "../../../types/branch";
import type { Restaurant } from "../../../types/restaurant";
import type {
  CreateUserRequest,
  UpdateUserRequest,
  User,
  UserRole,
} from "../../../types/user";

const ROLE_ORDER: UserRole[] = [
  "SuperAdmin",
  "Admin",
  "RestaurantManager",
  "BranchManager",
  "Waiter",
  "Kitchen",
  "Cashier",
];

const ROLE_LABELS: Record<UserRole, string> = {
  SuperAdmin: "Super Admin",
  Admin: "Admin",
  RestaurantManager: "Restaurant Manager",
  BranchManager: "Branch Manager",
  Waiter: "Waiter",
  Kitchen: "Kitchen",
  Cashier: "Cashier",
};

const ROLE_SCOPE: Record<UserRole, string> = {
  SuperAdmin: "All restaurants",
  Admin: "Restaurant",
  RestaurantManager: "Restaurant",
  BranchManager: "Branch",
  Waiter: "Branch",
  Kitchen: "Branch",
  Cashier: "Branch",
};

const ROLE_COLORS: Record<
  UserRole,
  "default" | "primary" | "secondary" | "success" | "warning" | "info" | "error"
> = {
  SuperAdmin: "secondary",
  Admin: "primary",
  RestaurantManager: "info",
  BranchManager: "success",
  Waiter: "default",
  Kitchen: "warning",
  Cashier: "secondary",
};

interface UserForm {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  restaurantId: number | "";
  branchId: number | "";
  isActive: boolean;
}

const emptyForm: UserForm = {
  fullName: "",
  email: "",
  password: "",
  role: "Waiter",
  restaurantId: "",
  branchId: "",
  isActive: true,
};

function getErrorMessage(error: any, fallback: string) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.title ||
    fallback
  );
}

export default function UsersPage() {
  const currentUser = authService.getUser();
  const currentRole = currentUser?.role as UserRole | undefined;

  const [users, setUsers] = useState<User[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);

  const isSuperAdmin = currentRole === "SuperAdmin";
  const isAdmin = currentRole === "Admin";
  const isRestaurantManager = currentRole === "RestaurantManager";
  const isBranchManager = currentRole === "BranchManager";

  const canCreateUsers =
    isSuperAdmin || isAdmin || isRestaurantManager || isBranchManager;

  const canManageUsers =
    isSuperAdmin || isAdmin || isRestaurantManager || isBranchManager;

  const allowedRoles = useMemo((): UserRole[] => {
    if (isSuperAdmin) return ROLE_ORDER;
    if (isAdmin) return ROLE_ORDER.filter((role) => role !== "SuperAdmin");
    if (isRestaurantManager) {
      return ["BranchManager", "Waiter", "Kitchen", "Cashier"];
    }
    if (isBranchManager) return ["Waiter", "Kitchen", "Cashier"];
    return [];
  }, [isSuperAdmin, isAdmin, isRestaurantManager, isBranchManager]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      setUsers(await userService.getUsers());
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load users."));
    } finally {
      setLoading(false);
    }
  };

  const loadLookups = async () => {
    try {
      setLoadingLookups(true);
      const [restaurantData, branchData] = await Promise.all([
        isSuperAdmin ? restaurantService.getRestaurants() : Promise.resolve([]),
        branchService.getBranches(),
      ]);
      setRestaurants(restaurantData);
      setBranches(branchData);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load restaurant or branch data."));
    } finally {
      setLoadingLookups(false);
    }
  };

  useEffect(() => {
    void loadUsers();
    void loadLookups();
  }, []);

  const refresh = async () => {
    await Promise.all([loadUsers(), loadLookups()]);
  };

  const openCreate = () => {
    const role = allowedRoles[0] ?? "Waiter";
    setEditingUser(null);
    setFormError("");
    setForm({
      ...emptyForm,
      role,
      restaurantId: isSuperAdmin ? "" : currentUser?.restaurantId ?? "",
      branchId: isBranchManager ? currentUser?.branchId ?? "" : "",
    });
    setDialogOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setFormError("");
    setForm({
      fullName: user.fullName,
      email: user.email,
      password: "",
      role: user.role,
      restaurantId: user.restaurantId ?? "",
      branchId: user.branchId ?? "",
      isActive: user.isActive,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (!saving) setDialogOpen(false);
  };

  const availableBranches = useMemo(() => {
    if (form.restaurantId === "") return branches;
    return branches.filter((branch) => branch.restaurantId === form.restaurantId);
  }, [branches, form.restaurantId]);

  const needsRestaurant = form.role !== "SuperAdmin";
  const needsBranch = [
    "BranchManager",
    "Waiter",
    "Kitchen",
    "Cashier",
  ].includes(form.role);

  const changeRole = (role: UserRole) => {
    setForm((current) => ({
      ...current,
      role,
      restaurantId: role === "SuperAdmin" ? "" : current.restaurantId,
      branchId:
        role === "SuperAdmin" ||
        role === "Admin" ||
        role === "RestaurantManager"
          ? ""
          : current.branchId,
    }));
  };

  const handleSave = async () => {
    if (!form.fullName.trim()) {
      setFormError("Full name is required.");
      return;
    }

    if (!form.email.trim()) {
      setFormError("Email is required.");
      return;
    }

    if (!editingUser && !form.password) {
      setFormError("Password is required when creating a user.");
      return;
    }

    if (needsRestaurant && form.restaurantId === "") {
      setFormError("Restaurant is required for this role.");
      return;
    }

    if (needsBranch && form.branchId === "") {
      setFormError("Branch is required for this role.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const restaurantId =
        form.role === "SuperAdmin" || form.restaurantId === ""
          ? null
          : form.restaurantId;

      const branchId = needsBranch && form.branchId !== "" ? form.branchId : null;

      if (editingUser) {
        const request: UpdateUserRequest = {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          role: form.role,
          restaurantId,
          branchId,
          isActive: form.isActive,
        };
        await userService.updateUser(editingUser.id, request);
      } else {
        const request: CreateUserRequest = {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          restaurantId,
          branchId,
          isActive: form.isActive,
        };
        await userService.createUser(request);
      }

      setDialogOpen(false);
      await loadUsers();
    } catch (err) {
      setFormError(
        getErrorMessage(
          err,
          editingUser ? "Unable to update the user." : "Unable to create the user."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const canEditUser = (user: User) => {
    if (!canManageUsers) return false;
    if (user.id === currentUser?.userId) return true;
    if (isSuperAdmin) return true;
    if (isAdmin) return user.role !== "SuperAdmin";
    if (isRestaurantManager) {
      return ["BranchManager", "Waiter", "Kitchen", "Cashier"].includes(user.role);
    }
    if (isBranchManager) {
      return (
        user.branchId === currentUser?.branchId &&
        ["Waiter", "Kitchen", "Cashier"].includes(user.role)
      );
    }
    return false;
  };

  const canDeleteUser = (user: User) =>
    canEditUser(user) && user.id !== currentUser?.userId;

  const handleStatusChange = async (user: User) => {
    if (!canEditUser(user)) return;
    try {
      await userService.changeStatus(user.id, !user.isActive);
      await loadUsers();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update user status."));
    }
  };

  const handleDelete = async (user: User) => {
    if (!canDeleteUser(user)) return;
    if (!window.confirm(`Delete user "${user.fullName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      setError("");
      await userService.deleteUser(user.id);
      await loadUsers();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to delete the user."));
    }
  };

  const scopeFor = (user: User) => {
    if (user.role === "SuperAdmin") return "All restaurants";
    return user.branchName ?? user.restaurantName ?? "Restaurant";
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3, justifyContent: "space-between", alignItems: { xs: "stretch", md: "center" } }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Users & Roles</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Manage staff accounts, roles, access scope, and account status.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<RefreshOutlined />} onClick={refresh}>Refresh</Button>
          {canCreateUsers && (
            <Button variant="contained" startIcon={<AddOutlined />} onClick={openCreate}>Add User</Button>
          )}
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {ROLE_ORDER.map((role) => (
          <Grid key={role} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card elevation={0} sx={{ height: "100%", border: 1, borderColor: "divider", borderRadius: 3 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{ROLE_LABELS[role]}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{ROLE_SCOPE[role]}</Typography>
                <Typography variant="h5" sx={{ mt: 1, fontWeight: 800 }}>
                  {users.filter((user) => user.role === role).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Scope</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Box sx={{ py: 8, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                      <PeopleAltOutlined sx={{ fontSize: 48, color: "text.secondary" }} />
                      <Typography sx={{ fontWeight: 800 }}>No users found</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Add a user to start managing restaurant staff.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const editable = canEditUser(user);
                  const deletable = canDeleteUser(user);

                  return (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Typography sx={{ fontWeight: 750 }}>{user.fullName}</Typography>
                        <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={ROLE_LABELS[user.role] ?? user.role}
                          color={ROLE_COLORS[user.role] ?? "default"}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{scopeFor(user)}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {ROLE_SCOPE[user.role] ?? "Scoped"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={user.isActive ? "Active" : "Inactive"} color={user.isActive ? "success" : "default"} />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end", alignItems: "center" }}>
                          {editable && (
                            <Switch
                              size="small"
                              checked={user.isActive}
                              onChange={() => void handleStatusChange(user)}
                              slotProps={{
                                input: {
                                  "aria-label": `Toggle ${user.fullName} status`,
                                },
                              }}
                            />
                          )}
                          {editable && (
                            <IconButton size="small" onClick={() => openEdit(user)} aria-label={`Edit ${user.fullName}`}>
                              <EditOutlined fontSize="small" />
                            </IconButton>
                          )}
                          {deletable && (
                            <IconButton size="small" color="error" onClick={() => void handleDelete(user)} aria-label={`Delete ${user.fullName}`}>
                              <DeleteOutlined fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>{editingUser ? "Edit User" : "Add User"}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          {loadingLookups && <Alert severity="info" sx={{ mb: 2 }}>Loading restaurant and branch data...</Alert>}

          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Full name" value={form.fullName} onChange={(e) => setForm((c) => ({ ...c, fullName: e.target.value }))} required fullWidth autoFocus />
            <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} required fullWidth />

            {!editingUser && (
              <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))} required fullWidth />
            )}

            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select value={form.role} label="Role" onChange={(e) => changeRole(e.target.value as UserRole)}>
                {(editingUser ? allowedRoles : allowedRoles).map((role) => (
                  <MenuItem key={role} value={role}>
                    {ROLE_LABELS[role]} — {ROLE_SCOPE[role]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {needsRestaurant && (
              isSuperAdmin ? (
                <FormControl fullWidth>
                  <InputLabel>Restaurant</InputLabel>
                  <Select value={form.restaurantId} label="Restaurant" onChange={(e) => { const rawValue = String(e.target.value); setForm((c) => ({ ...c, restaurantId: rawValue === "" ? "" : Number(rawValue), branchId: "" })); }}>
                    <MenuItem value="">Select restaurant</MenuItem>
                    {restaurants.map((restaurant) => (
                      <MenuItem key={restaurant.id} value={restaurant.id}>{restaurant.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <TextField label="Restaurant" value={currentUser?.restaurantId ? `Restaurant #${currentUser.restaurantId}` : "Not assigned"} fullWidth disabled />
              )
            )}

            {needsBranch && (
              <FormControl fullWidth>
                <InputLabel>Branch</InputLabel>
                <Select
                  value={form.branchId}
                  label="Branch"
                  disabled={isBranchManager || availableBranches.length === 0}
                  onChange={(e) => { const rawValue = String(e.target.value); setForm((c) => ({ ...c, branchId: rawValue === "" ? "" : Number(rawValue) })); }}
                >
                  <MenuItem value="">Select branch</MenuItem>
                  {availableBranches.map((branch) => (
                    <MenuItem key={branch.id} value={branch.id}>{branch.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", pt: 1 }}>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>Active account</Typography>
                <Typography variant="body2" color="text.secondary">
                  Allow this user to sign in and use the system.
                </Typography>
              </Box>
              <Switch checked={form.isActive} onChange={(e) => setForm((c) => ({ ...c, isActive: e.target.checked }))} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={() => void handleSave()} disabled={saving || loadingLookups}>
            {saving ? "Saving..." : editingUser ? "Save Changes" : "Create User"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
