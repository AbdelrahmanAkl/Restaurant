import { useEffect, useState } from "react";
import {
  AddOutlined,
  DeleteOutlined,
  EditOutlined,
  LocationOnOutlined,
  PhoneOutlined,
  QrCode2Outlined,
  StorefrontOutlined,
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
  Grid,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { authService } from "../../../services/authService";
import { branchService } from "../../../services/branchService";
import type {
  Branch,
  CreateBranchRequest,
} from "../../../types/branch";

interface BranchForm {
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
}

const emptyForm: BranchForm = {
  name: "",
  address: "",
  phone: "",
  isActive: true,
};

export default function BranchesPage() {
  const navigate = useNavigate();
  const user = authService.getUser();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] =
    useState<Branch | null>(null);

  const [form, setForm] =
    useState<BranchForm>(emptyForm);

  const loadBranches = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await branchService.getBranches();

      setBranches(data);
    } catch (err: any) {
      console.error("Branches loading failed:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load branches."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const openCreate = () => {
    setEditingBranch(null);
    setForm(emptyForm);
    setFormError("");
    setDialogOpen(true);
  };

  const openEdit = (branch: Branch) => {
    setEditingBranch(branch);

    setForm({
      name: branch.name,
      address: branch.address ?? "",
      phone: branch.phone ?? "",
      isActive: branch.isActive,
    });

    setFormError("");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (!saving) {
      setDialogOpen(false);
    }
  };

  const handleSave = async () => {
    const name = form.name.trim();

    if (!name) {
      setFormError("Branch name is required.");
      return;
    }

    if (!editingBranch && !user?.restaurantId) {
      setFormError(
        "Your account is not linked to a restaurant."
      );
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      if (editingBranch) {
        await branchService.updateBranch(
          editingBranch.id,
          {
            name,
            address: form.address.trim() || null,
            phone: form.phone.trim() || null,
            isActive: form.isActive,
          }
        );
      } else {
        const request: CreateBranchRequest = {
          restaurantId: user!.restaurantId!,
          name,
          address: form.address.trim() || null,
          phone: form.phone.trim() || null,
          isActive: form.isActive,
        };

        await branchService.createBranch(request);
      }

      setDialogOpen(false);

      await loadBranches();
    } catch (err: any) {
      console.error("Branch save failed:", err);

      setFormError(
        err?.response?.data?.message ||
          "Unable to save the branch."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (branch: Branch) => {
    const confirmed = window.confirm(
      `Delete branch "${branch.name}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await branchService.deleteBranch(branch.id);

      await loadBranches();
    } catch (err: any) {
      console.error("Branch delete failed:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to delete the branch."
      );
    }
  };

  const handleAddTable = (branch: Branch) => {
    navigate("/tables", {
      state: {
        branchId: branch.id,
        branchName: branch.name,
      },
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{
          mb: 3,
          justifyContent: "space-between",
          alignItems: {
            xs: "stretch",
            md: "center",
          },
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800 }}
          >
            Branches
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage your restaurant branches and their status.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={openCreate}
        >
          Add Branch
        </Button>
      </Stack>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {branches.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 3,
          }}
        >
          <CardContent
            sx={{
              py: 8,
              textAlign: "center",
            }}
          >
            <StorefrontOutlined
              sx={{
                fontSize: 52,
                color: "text.secondary",
                mb: 1,
              }}
            />

            <Typography
              variant="h6"
              sx={{ fontWeight: 800 }}
            >
              No branches yet
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              Create your first branch to start managing locations.
            </Typography>

            <Button
              variant="contained"
              startIcon={<AddOutlined />}
              onClick={openCreate}
            >
              Add Branch
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {branches.map((branch) => (
            <Grid
              key={branch.id}
              size={{
                xs: 12,
                md: 6,
                lg: 4,
              }}
            >
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{
                      alignItems: "flex-start",
                      justifyContent: "space-between",
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
                          "rgba(99,91,255,0.10)",
                        color: "primary.main",
                      }}
                    >
                      <StorefrontOutlined />
                    </Box>

                    <Stack
                      direction="row"
                      spacing={0.5}
                    >
                      <IconButton
                        size="small"
                        onClick={() =>
                          openEdit(branch)
                        }
                        aria-label={
                          `Edit ${branch.name}`
                        }
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        color="error"
                        onClick={() =>
                          handleDelete(branch)
                        }
                        aria-label={
                          `Delete ${branch.name}`
                        }
                      >
                        <DeleteOutlined fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>

                  <Typography
                    variant="h6"
                    sx={{
                      mt: 2,
                      fontWeight: 800,
                    }}
                  >
                    {branch.name}
                  </Typography>

                  <Chip
                    label={
                      branch.isActive
                        ? "Active"
                        : "Inactive"
                    }
                    color={
                      branch.isActive
                        ? "success"
                        : "default"
                    }
                    size="small"
                    sx={{ mt: 1 }}
                  />

                  <Stack
                    spacing={1}
                    sx={{ mt: 2 }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        alignItems: "center",
                      }}
                    >
                      <LocationOnOutlined
                        fontSize="small"
                        color="action"
                      />

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {branch.address ||
                          "No address"}
                      </Typography>
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        alignItems: "center",
                      }}
                    >
                      <PhoneOutlined
                        fontSize="small"
                        color="action"
                      />

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {branch.phone ||
                          "No phone"}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Box
                    sx={{
                      mt: 2,
                      pt: 2,
                      borderTop: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Stack
                      direction="row"
                      sx={{
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Tables
                        </Typography>

                        <Typography
                          sx={{ fontWeight: 800 }}
                        >
                          {branch.tableCount}
                        </Typography>
                      </Box>

                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={
                          <QrCode2Outlined />
                        }
                        onClick={() =>
                          handleAddTable(branch)
                        }
                        disabled={!branch.isActive}
                      >
                        Add Table
                      </Button>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{ fontWeight: 800 }}
        >
          {editingBranch
            ? "Edit Branch"
            : "Add Branch"}
        </DialogTitle>

        <DialogContent>
          {formError && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
            >
              {formError}
            </Alert>
          )}

          <Stack
            spacing={2}
            sx={{ mt: 1 }}
          >
            <TextField
              label="Branch name"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              required
              fullWidth
              autoFocus
            />

            <TextField
              label="Address"
              value={form.address}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  address: event.target.value,
                }))
              }
              fullWidth
            />

            <TextField
              label="Phone"
              value={form.phone}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  phone: event.target.value,
                }))
              }
              fullWidth
            />

            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  sx={{ fontWeight: 700 }}
                >
                  Active branch
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Allow this branch to receive operations.
                </Typography>
              </Box>

              <Switch
                checked={form.isActive}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    isActive:
                      event.target.checked,
                  }))
                }
              />
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          <Button
            onClick={closeDialog}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress size={18} />
              ) : undefined
            }
          >
            {saving
              ? "Saving..."
              : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}