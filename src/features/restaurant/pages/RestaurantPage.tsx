import { useEffect, useState } from "react";
import {
  AddOutlined,
  DeleteOutlined,
  EditOutlined,
  EmailOutlined,
  LocalPhoneOutlined,
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

import { authService } from "../../../services/authService";
import { restaurantService } from "../../../services/restaurantService";

import type {
  CreateRestaurantRequest,
  Restaurant,
  UpdateRestaurantRequest,
} from "../../../types/restaurant";

interface RestaurantForm {
  name: string;
  description: string;
  phone: string;
  email: string;
  isActive: boolean;
}

const emptyForm: RestaurantForm = {
  name: "",
  description: "",
  phone: "",
  email: "",
  isActive: true,
};

export default function RestaurantPage() {
  const user = authService.getUser();

  const [restaurants, setRestaurants] =
    useState<Restaurant[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [editingRestaurant, setEditingRestaurant] =
    useState<Restaurant | null>(null);

  const [form, setForm] =
    useState<RestaurantForm>(emptyForm);

  const isAdmin =
    user?.role === "Admin";

  const isManager =
    user?.role === "Manager";

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await restaurantService.getRestaurants();

      setRestaurants(data);
    } catch (err: any) {
      console.error(
        "Restaurants loading failed:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.title ||
          err?.message ||
          "Unable to load restaurants."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRestaurants();
  }, []);

  const openCreate = () => {
    setEditingRestaurant(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setDialogOpen(true);
  };

  const openEdit = (
    restaurant: Restaurant
  ) => {
    setEditingRestaurant(restaurant);

    setForm({
      name: restaurant.name,
      description:
        restaurant.description ?? "",
      phone:
        restaurant.phone ?? "",
      email:
        restaurant.email ?? "",
      isActive:
        restaurant.isActive,
    });

    setError("");
    setSuccess("");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) {
      return;
    }

    setDialogOpen(false);
    setEditingRestaurant(null);
    setForm(emptyForm);
    setError("");
  };

  const handleSave = async () => {
    const name =
      form.name.trim();

    if (!name) {
      setError(
        "Restaurant name is required."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingRestaurant) {
        const request: UpdateRestaurantRequest =
          {
            name,
            description:
              form.description.trim() ||
              null,
            phone:
              form.phone.trim() ||
              null,
            email:
              form.email.trim()
                .toLowerCase() ||
              null,
            isActive:
              form.isActive,
          };

        await restaurantService.updateRestaurant(
          editingRestaurant.id,
          request
        );

        setSuccess(
          "Restaurant updated successfully."
        );
      } else {
        if (!isAdmin) {
          setError(
            "Only administrators can create restaurants."
          );
          return;
        }

        const request: CreateRestaurantRequest =
          {
            name,
            description:
              form.description.trim() ||
              null,
            phone:
              form.phone.trim() ||
              null,
            email:
              form.email.trim()
                .toLowerCase() ||
              null,
            isActive:
              form.isActive,
          };

        await restaurantService.createRestaurant(
          request
        );

        setSuccess(
          "Restaurant created successfully."
        );
      }

      setDialogOpen(false);
      setEditingRestaurant(null);
      setForm(emptyForm);

      await loadRestaurants();
    } catch (err: any) {
      console.error(
        "Restaurant save failed:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.title ||
          err?.message ||
          "Unable to save restaurant."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    restaurant: Restaurant
  ) => {
    if (!isAdmin) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete restaurant "${restaurant.name}"? This cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await restaurantService.deleteRestaurant(
        restaurant.id
      );

      setSuccess(
        "Restaurant deleted successfully."
      );

      await loadRestaurants();
    } catch (err: any) {
      console.error(
        "Restaurant delete failed:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.title ||
          err?.message ||
          "Unable to delete restaurant."
      );
    }
  };

  const formatCreatedAt = (
    value: string
  ) => {
    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
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
            sx={{
              fontWeight: 800,
            }}
          >
            Restaurants
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage restaurants and
            their basic information.
          </Typography>
        </Box>

        {isAdmin && (
          <Button
            variant="contained"
            startIcon={
              <AddOutlined />
            }
            onClick={
              openCreate
            }
          >
            Add Restaurant
          </Button>
        )}
      </Stack>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() =>
            setError("")
          }
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() =>
            setSuccess("")
          }
        >
          {success}
        </Alert>
      )}

      {restaurants.length ===
      0 ? (
        <Card
          elevation={0}
          sx={{
            border: 1,
            borderColor:
              "divider",
            borderRadius: 3,
          }}
        >
          <CardContent
            sx={{
              py: 8,
              textAlign:
                "center",
            }}
          >
            <StorefrontOutlined
              sx={{
                fontSize: 54,
                color:
                  "text.secondary",
                mb: 1,
              }}
            />

            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
              }}
            >
              No restaurants found
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              {isAdmin
                ? "Create your first restaurant to get started."
                : "Your account is not currently linked to a restaurant."}
            </Typography>

            {isAdmin && (
              <Button
                variant="contained"
                startIcon={
                  <AddOutlined />
                }
                onClick={
                  openCreate
                }
                sx={{ mt: 2 }}
              >
                Add Restaurant
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Grid
          container
          spacing={2.5}
        >
          {restaurants.map(
            (restaurant) => (
              <Grid
                key={
                  restaurant.id
                }
                size={{
                  xs: 12,
                  md: 6,
                  lg: 4,
                }}
              >
                <Card
                  elevation={0}
                  sx={{
                    height:
                      "100%",
                    border: 1,
                    borderColor:
                      "divider",
                    borderRadius: 3,
                  }}
                >
                  <CardContent
                    sx={{
                      p: 2.5,
                    }}
                  >
                    <Stack
                      direction="row"
                      sx={{
                        alignItems:
                          "flex-start",
                        justifyContent:
                          "space-between",
                      }}
                    >
                      <Box
                        sx={{
                          width: 46,
                          height: 46,
                          borderRadius: 2,
                          display:
                            "grid",
                          placeItems:
                            "center",
                          backgroundColor:
                            "rgba(99,91,255,0.10)",
                          color:
                            "primary.main",
                        }}
                      >
                        <StorefrontOutlined />
                      </Box>

                      <Stack
                        direction="row"
                        spacing={0.5}
                      >
                        {(isAdmin ||
                          isManager) && (
                          <IconButton
                            size="small"
                            onClick={() =>
                              openEdit(
                                restaurant
                              )
                            }
                            aria-label={
                              `Edit ${restaurant.name}`
                            }
                          >
                            <EditOutlined fontSize="small" />
                          </IconButton>
                        )}

                        {isAdmin && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              void handleDelete(
                                restaurant
                              )
                            }
                            aria-label={
                              `Delete ${restaurant.name}`
                            }
                          >
                            <DeleteOutlined fontSize="small" />
                          </IconButton>
                        )}
                      </Stack>
                    </Stack>

                    <Typography
                      variant="h6"
                      sx={{
                        mt: 2,
                        fontWeight:
                          800,
                      }}
                    >
                      {
                        restaurant.name
                      }
                    </Typography>

                    <Chip
                      size="small"
                      label={
                        restaurant.isActive
                          ? "Active"
                          : "Inactive"
                      }
                      color={
                        restaurant.isActive
                          ? "success"
                          : "default"
                      }
                      sx={{
                        mt: 1,
                      }}
                    />

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 2,
                        minHeight: 42,
                      }}
                    >
                      {restaurant.description ||
                        "No description available."}
                    </Typography>

                    <Stack
                      spacing={1}
                      sx={{
                        mt: 2,
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          alignItems:
                            "center",
                        }}
                      >
                        <LocalPhoneOutlined
                          fontSize="small"
                          color="action"
                        />

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {restaurant.phone ||
                            "No phone"}
                        </Typography>
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          alignItems:
                            "center",
                        }}
                      >
                        <EmailOutlined
                          fontSize="small"
                          color="action"
                        />

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {restaurant.email ||
                            "No email"}
                        </Typography>
                      </Stack>
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
                      <Stack
                        direction="row"
                        sx={{
                          justifyContent:
                            "space-between",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Branches
                          </Typography>

                          <Typography
                            sx={{
                              fontWeight:
                                800,
                            }}
                          >
                            {
                              restaurant.branchCount
                            }
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            textAlign:
                              "right",
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Created
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              mt: 0.25,
                              fontWeight:
                                600,
                            }}
                          >
                            {formatCreatedAt(
                              restaurant.createdAt
                            )}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          )}
        </Grid>
      )}

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
          }}
        >
          {editingRestaurant
            ? "Edit Restaurant"
            : "Add Restaurant"}
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
            >
              {error}
            </Alert>
          )}

          <Stack
            spacing={2}
            sx={{
              mt: 1,
            }}
          >
            <TextField
              label="Restaurant name"
              value={form.name}
              onChange={(event) =>
                setForm(
                  (current) => ({
                    ...current,
                    name:
                      event.target
                        .value,
                  })
                )
              }
              required
              fullWidth
              autoFocus
            />

            <TextField
              label="Description"
              value={
                form.description
              }
              onChange={(event) =>
                setForm(
                  (current) => ({
                    ...current,
                    description:
                      event.target
                        .value,
                  })
                )
              }
              fullWidth
              multiline
              minRows={3}
            />

            <TextField
              label="Phone"
              value={form.phone}
              onChange={(event) =>
                setForm(
                  (current) => ({
                    ...current,
                    phone:
                      event.target
                        .value,
                  })
                )
              }
              fullWidth
            />

            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm(
                  (current) => ({
                    ...current,
                    email:
                      event.target
                        .value,
                  })
                )
              }
              fullWidth
            />

            <Stack
              direction="row"
              sx={{
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontWeight:
                      700,
                  }}
                >
                  Active restaurant
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Inactive restaurants
                  cannot receive
                  new branches.
                </Typography>
              </Box>

              <Switch
                checked={
                  form.isActive
                }
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,
                      isActive:
                        event.target
                          .checked,
                    })
                  )
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
            onClick={
              closeDialog
            }
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={() =>
              void handleSave()
            }
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
              : editingRestaurant
                ? "Save Changes"
                : "Create Restaurant"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}