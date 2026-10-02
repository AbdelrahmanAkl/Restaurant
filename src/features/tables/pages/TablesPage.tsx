import { useEffect, useState } from "react";
import {
  AddOutlined,
  DeleteOutlined,
  EditOutlined,
  QrCode2Outlined,
  TableRestaurantOutlined,
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
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useLocation } from "react-router-dom";

import { branchService } from "../../../services/branchService";
import { tableService } from "../../../services/tableService";

import type { Branch } from "../../../types/branch";
import type {
  CreateTableRequest,
  Table,
  UpdateTableRequest,
} from "../../../types/table";

interface TableForm {
  branchId: number | "";
  tableNumber: string;
  qrCode: string;
  isActive: boolean;
}

const emptyForm: TableForm = {
  branchId: "",
  tableNumber: "",
  qrCode: "",
  isActive: true,
};

export default function TablesPage() {
  const location = useLocation();

  const [tables, setTables] = useState<Table[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTable, setEditingTable] =
    useState<Table | null>(null);

  const [form, setForm] =
    useState<TableForm>(emptyForm);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [tableData, branchData] =
        await Promise.all([
          tableService.getTables(),
          branchService.getBranches(),
        ]);

      setTables(tableData);
      setBranches(branchData);
    } catch (err: any) {
      console.error("Tables loading failed:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load tables."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const state = location.state as
      | {
          branchId?: number;
          branchName?: string;
        }
      | null;

    if (
      state?.branchId &&
      branches.length > 0
    ) {
      setEditingTable(null);

      setForm({
        branchId: state.branchId,
        tableNumber: "",
        qrCode: "",
        isActive: true,
      });

      setFormError("");
      setDialogOpen(true);

      window.history.replaceState(
        {},
        document.title
      );
    }
  }, [location.state, branches]);

  const openCreate = () => {
    setEditingTable(null);
    setForm({
      ...emptyForm,
      branchId:
        branches.length === 1
          ? branches[0].id
          : "",
    });
    setFormError("");
    setDialogOpen(true);
  };

  const openEdit = (table: Table) => {
    setEditingTable(table);

    setForm({
      branchId: table.branchId,
      tableNumber: table.tableNumber,
      qrCode: table.qrCode ?? "",
      isActive: table.isActive,
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
    const tableNumber =
      form.tableNumber.trim();

    if (!form.branchId) {
      setFormError("Please select a branch.");
      return;
    }

    if (!tableNumber) {
      setFormError(
        "Table number is required."
      );
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      if (editingTable) {
        const request: UpdateTableRequest = {
          tableNumber,
          qrCode:
            form.qrCode.trim() || null,
          isActive: form.isActive,
        };

        await tableService.updateTable(
          editingTable.id,
          request
        );
      } else {
        const request: CreateTableRequest = {
          branchId: Number(form.branchId),
          tableNumber,
          qrCode:
            form.qrCode.trim() || null,
          isActive: form.isActive,
        };

        await tableService.createTable(request);
      }

      setDialogOpen(false);

      await loadData();
    } catch (err: any) {
      console.error("Table save failed:", err);

      setFormError(
        err?.response?.data?.message ||
          "Unable to save the table."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    table: Table
  ) => {
    const confirmed = window.confirm(
      `Delete table "${table.tableNumber}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await tableService.deleteTable(
        table.id
      );

      await loadData();
    } catch (err: any) {
      console.error("Table delete failed:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to delete the table."
      );
    }
  };

  const getBranchName = (
    branchId: number
  ) => {
    const branch = branches.find(
      (item) => item.id === branchId
    );

    return (
      branch?.name ||
      "Unknown Branch"
    );
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
        direction={{
          xs: "column",
          md: "row",
        }}
        spacing={2}
        sx={{
          mb: 3,
          justifyContent:
            "space-between",
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
            Tables & QR
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage restaurant tables and their QR codes.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={openCreate}
          disabled={branches.length === 0}
        >
          Add Table
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
            <TableRestaurantOutlined
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
              No branches available
            </Typography>

            <Typography
              color="text.secondary"
            >
              Create a branch before adding tables.
            </Typography>
          </CardContent>
        </Card>
      ) : tables.length === 0 ? (
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
            <TableRestaurantOutlined
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
              No tables yet
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              Add your first restaurant table.
            </Typography>

            <Button
              variant="contained"
              startIcon={<AddOutlined />}
              onClick={openCreate}
            >
              Add Table
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {tables.map((table) => (
            <Grid
              key={table.id}
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
                    sx={{
                      alignItems: "flex-start",
                      justifyContent:
                        "space-between",
                    }}
                  >
                    <Box
                      sx={{
                        width: 46,
                        height: 46,
                        borderRadius: 2,
                        display: "grid",
                        placeItems: "center",
                        backgroundColor:
                          "rgba(99,91,255,0.10)",
                        color:
                          "primary.main",
                      }}
                    >
                      <TableRestaurantOutlined />
                    </Box>

                    <Stack
                      direction="row"
                      spacing={0.5}
                    >
                      <IconButton
                        size="small"
                        onClick={() =>
                          openEdit(table)
                        }
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        color="error"
                        onClick={() =>
                          handleDelete(table)
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
                    Table {table.tableNumber}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {table.branchName ||
                      getBranchName(
                        table.branchId
                      )}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mt: 1.5 }}
                  >
                    <Chip
                      size="small"
                      label={
                        table.isActive
                          ? "Active"
                          : "Inactive"
                      }
                      color={
                        table.isActive
                          ? "success"
                          : "default"
                      }
                    />

                    {table.qrCode && (
                      <Chip
                        size="small"
                        icon={
                          <QrCode2Outlined />
                        }
                        label="QR Ready"
                        variant="outlined"
                      />
                    )}
                  </Stack>

                  <Box
                    sx={{
                      mt: 2,
                      pt: 2,
                      borderTop: 1,
                      borderColor:
                        "divider",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      QR Code
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.5,
                        wordBreak:
                          "break-all",
                      }}
                    >
                      {table.qrCode ||
                        "No QR code assigned"}
                    </Typography>
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
          {editingTable
            ? "Edit Table"
            : "Add Table"}
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
              select
              label="Branch"
              value={form.branchId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  branchId:
                    event.target.value
                      ? Number(
                          event.target.value
                        )
                      : "",
                }))
              }
              fullWidth
              disabled={
                !!editingTable
              }
            >
              {branches.map(
                (branch) => (
                  <MenuItem
                    key={branch.id}
                    value={branch.id}
                    disabled={
                      !branch.isActive
                    }
                  >
                    {branch.name}
                  </MenuItem>
                )
              )}
            </TextField>

            <TextField
              label="Table number"
              placeholder="T01"
              value={form.tableNumber}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  tableNumber:
                    event.target.value,
                }))
              }
              required
              fullWidth
              autoFocus
            />

            <TextField
              label="QR Code"
              placeholder="https://..."
              value={form.qrCode}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  qrCode:
                    event.target.value,
                }))
              }
              fullWidth
            />

            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                justifyContent:
                  "space-between",
              }}
            >
              <Box>
                <Typography
                  sx={{ fontWeight: 700 }}
                >
                  Active table
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Allow customers to use this table.
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
                <CircularProgress
                  size={18}
                />
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