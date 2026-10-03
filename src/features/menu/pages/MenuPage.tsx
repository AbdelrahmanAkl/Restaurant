import { useEffect, useMemo, useState } from "react";
import {
  AddOutlined,
  DeleteOutlined,
  EditOutlined,
  ImageOutlined,
  LocalDiningOutlined,
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
  MenuItem as SelectMenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import { authService } from "../../../services/authService";
import { menuService } from "../../../services/menuService";
import { restaurantService } from "../../../services/restaurantService";

import type { Restaurant } from "../../../types/restaurant";
import type {
  Category,
  CreateCategoryRequest,
  CreateMenuItemRequest,
  MenuItem,
  UpdateCategoryRequest,
  UpdateMenuItemRequest,
} from "../../../types/menu";

type UserRole =
  | "SuperAdmin"
  | "Admin"
  | "RestaurantManager"
  | "BranchManager"
  | "Waiter"
  | "Kitchen"
  | "Cashier";

interface CategoryForm {
  name: string;
  description: string;
  isActive: boolean;
}

interface MenuItemForm {
  categoryId: number | "";
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  isAvailable: boolean;
}

const emptyCategoryForm: CategoryForm = {
  name: "",
  description: "",
  isActive: true,
};

const emptyMenuItemForm: MenuItemForm = {
  categoryId: "",
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  isAvailable: true,
};

function getErrorMessage(error: any, fallback: string) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.title ||
    fallback
  );
}

function currency(value: number) {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function MenuPage() {
  const currentUser = authService.getUser();
  const currentRole = currentUser?.role as UserRole | undefined;

  const isSuperAdmin = currentRole === "SuperAdmin";
  const canManageMenu =
    currentRole === "SuperAdmin" ||
    currentRole === "Admin" ||
    currentRole === "RestaurantManager";


  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] =
    useState<number | "">(
      currentUser?.restaurantId ?? ""
    );

  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<number | "all">("all");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);
  const [categoryForm, setCategoryForm] =
    useState<CategoryForm>(emptyCategoryForm);

  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemForm, setItemForm] =
    useState<MenuItemForm>(emptyMenuItemForm);

  const hasRestaurantContext =
    isSuperAdmin
      ? selectedRestaurantId !== ""
      : Boolean(currentUser?.restaurantId);

  const activeRestaurantName = useMemo(() => {
    if (!isSuperAdmin) {
      return currentUser?.restaurantId
        ? `Restaurant #${currentUser.restaurantId}`
        : "No restaurant assigned";
    }

    return (
      restaurants.find(
        (restaurant) =>
          restaurant.id === selectedRestaurantId
      )?.name || "Select a restaurant"
    );
  }, [currentUser?.restaurantId, isSuperAdmin, restaurants, selectedRestaurantId]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategoryId === "all" ||
        item.categoryId === selectedCategoryId;

      if (!matchesCategory) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return (
        item.name.toLowerCase().includes(normalizedSearch) ||
        (item.description ?? "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        item.categoryName
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [menuItems, search, selectedCategoryId]);

  const unavailableCount = menuItems.filter(
    (item) => !item.isAvailable
  ).length;

  const loadMenu = async (restaurantId?: number) => {
    try {
      setLoading(true);
      setError("");

      const [categoryData, itemData] = await Promise.all([
        menuService.getCategories(restaurantId),
        menuService.getMenuItems(restaurantId),
      ]);

      setCategories(categoryData);
      setMenuItems(itemData);

      if (
        selectedCategoryId !== "all" &&
        !categoryData.some((category) =>
          category.id === selectedCategoryId
        )
      ) {
        setSelectedCategoryId("all");
      }
    } catch (err: any) {
      console.error("Menu loading failed:", err);
      setError(
        getErrorMessage(err, "Unable to load the menu.")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      if (!isSuperAdmin) {
        await loadMenu(currentUser?.restaurantId ?? undefined);
        return;
      }

      try {
        setLoadingRestaurants(true);
        setError("");

        const data = await restaurantService.getRestaurants();
        setRestaurants(data);

        const firstRestaurant = data.find(
          (restaurant) => restaurant.isActive
        ) ?? data[0];

        const initialId =
          currentUser?.restaurantId ??
          firstRestaurant?.id ??
          "";

        setSelectedRestaurantId(initialId);

        if (initialId) {
          await loadMenu(initialId);
        } else {
          setCategories([]);
          setMenuItems([]);
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Restaurant lookup failed:", err);
        setError(
          getErrorMessage(
            err,
            "Unable to load restaurants."
          )
        );
        setLoading(false);
      } finally {
        setLoadingRestaurants(false);
      }
    };

    void initialize();
  }, []);

  const refresh = () => {
    if (!hasRestaurantContext) {
      setError("Select a restaurant before loading the menu.");
      return;
    }

    void loadMenu(
      isSuperAdmin
        ? Number(selectedRestaurantId)
        : currentUser?.restaurantId ?? undefined
    );
  };

  const openCreateCategory = () => {
    if (!canManageMenu) return;
    if (!hasRestaurantContext) {
      setError("Select a restaurant before creating a category.");
      return;
    }

    setEditingCategory(null);
    setCategoryForm(emptyCategoryForm);
    setFormError("");
    setCategoryDialogOpen(true);
  };

  const openEditCategory = (category: Category) => {
    if (!canManageMenu) return;

    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description ?? "",
      isActive: category.isActive,
    });
    setFormError("");
    setCategoryDialogOpen(true);
  };

  const closeCategoryDialog = () => {
    if (!saving) {
      setCategoryDialogOpen(false);
    }
  };

  const handleCategorySave = async () => {
    const name = categoryForm.name.trim();

    if (!name) {
      setFormError("Category name is required.");
      return;
    }

    if (!hasRestaurantContext) {
      setFormError("A restaurant must be selected.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      if (editingCategory) {
        const request: UpdateCategoryRequest = {
          name,
          description:
            categoryForm.description.trim() || null,
          isActive: categoryForm.isActive,
        };

        await menuService.updateCategory(
          editingCategory.id,
          request
        );
      } else {
        const request: CreateCategoryRequest = {
          name,
          description:
            categoryForm.description.trim() || null,
          isActive: categoryForm.isActive,
        };

        await menuService.createCategory(
          request,
          isSuperAdmin
            ? Number(selectedRestaurantId)
            : undefined
        );
      }

      setCategoryDialogOpen(false);
      await loadMenu(
        isSuperAdmin
          ? Number(selectedRestaurantId)
          : currentUser?.restaurantId ?? undefined
      );
    } catch (err: any) {
      console.error("Category save failed:", err);
      setFormError(
        getErrorMessage(
          err,
          "Unable to save the category."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!canManageMenu) return;

    const confirmed = window.confirm(
      `Delete category "${category.name}"? Categories with menu items cannot be deleted.`
    );

    if (!confirmed) return;

    try {
      setError("");
      await menuService.deleteCategory(category.id);
      await loadMenu(
        isSuperAdmin
          ? Number(selectedRestaurantId)
          : currentUser?.restaurantId ?? undefined
      );
    } catch (err: any) {
      console.error("Category delete failed:", err);
      setError(
        getErrorMessage(
          err,
          "Unable to delete the category."
        )
      );
    }
  };

  const openCreateItem = () => {
    if (!canManageMenu) return;

    if (categories.length === 0) {
      setError("Create a category before adding menu items.");
      return;
    }

    setEditingItem(null);
    setItemForm({
      ...emptyMenuItemForm,
      categoryId: categories[0]?.id ?? "",
    });
    setFormError("");
    setItemDialogOpen(true);
  };

  const openEditItem = (item: MenuItem) => {
    if (!canManageMenu) return;

    setEditingItem(item);
    setItemForm({
      categoryId: item.categoryId,
      name: item.name,
      description: item.description ?? "",
      price: String(item.price),
      imageUrl: item.imageUrl ?? "",
      isAvailable: item.isAvailable,
    });
    setFormError("");
    setItemDialogOpen(true);
  };

  const closeItemDialog = () => {
    if (!saving) {
      setItemDialogOpen(false);
    }
  };

  const handleItemSave = async () => {
    const name = itemForm.name.trim();
    const price = Number(itemForm.price);

    if (!itemForm.categoryId) {
      setFormError("Category is required.");
      return;
    }

    if (!name) {
      setFormError("Menu item name is required.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setFormError("Price must be greater than zero.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      if (editingItem) {
        const request: UpdateMenuItemRequest = {
          categoryId: Number(itemForm.categoryId),
          name,
          description:
            itemForm.description.trim() || null,
          price,
          imageUrl:
            itemForm.imageUrl.trim() || null,
          isAvailable: itemForm.isAvailable,
        };

        await menuService.updateMenuItem(
          editingItem.id,
          request
        );
      } else {
        const request: CreateMenuItemRequest = {
          categoryId: Number(itemForm.categoryId),
          name,
          description:
            itemForm.description.trim() || null,
          price,
          imageUrl:
            itemForm.imageUrl.trim() || null,
          isAvailable: itemForm.isAvailable,
        };

        await menuService.createMenuItem(request);
      }

      setItemDialogOpen(false);
      await loadMenu(
        isSuperAdmin
          ? Number(selectedRestaurantId)
          : currentUser?.restaurantId ?? undefined
      );
    } catch (err: any) {
      console.error("Menu item save failed:", err);
      setFormError(
        getErrorMessage(
          err,
          "Unable to save the menu item."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (item: MenuItem) => {
    if (!canManageMenu) return;

    const confirmed = window.confirm(
      `Delete menu item "${item.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      await menuService.deleteMenuItem(item.id);
      await loadMenu(
        isSuperAdmin
          ? Number(selectedRestaurantId)
          : currentUser?.restaurantId ?? undefined
      );
    } catch (err: any) {
      console.error("Menu item delete failed:", err);
      setError(
        getErrorMessage(
          err,
          "Unable to delete the menu item."
        )
      );
    }
  };

  const selectRestaurant = (value: number | "") => {
    setSelectedRestaurantId(value);
    setSelectedCategoryId("all");
    setSearch("");

    if (value !== "") {
      void loadMenu(Number(value));
    } else {
      setCategories([]);
      setMenuItems([]);
    }
  };

  if (loading || loadingRestaurants) {
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
        direction={{ xs: "column", lg: "row" }}
        spacing={2}
        sx={{
          mb: 3,
          alignItems: {
            xs: "stretch",
            lg: "center",
          },
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800 }}
          >
            Menu
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Restaurant-level menu shared by all branches.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
        >
          {isSuperAdmin && (
            <FormControl
              size="small"
              sx={{ minWidth: 220 }}
            >
              <InputLabel>Restaurant</InputLabel>
              <Select
                value={selectedRestaurantId}
                label="Restaurant"
                onChange={(event) => {
                  const rawValue = String(event.target.value);
                  selectRestaurant(
                    rawValue === ""
                      ? ""
                      : Number(rawValue)
                  );
                }}
              >
                <SelectMenuItem value="">
                  Select restaurant
                </SelectMenuItem>
                {restaurants.map((restaurant) => (
                  <SelectMenuItem
                    key={restaurant.id}
                    value={restaurant.id}
                  >
                    {restaurant.name}
                  </SelectMenuItem>
                ))}
              </Select>
            </FormControl>
          )}

        

          {canManageMenu && (
            <Button
              variant="outlined"
              startIcon={<AddOutlined />}
              onClick={openCreateCategory}
            >
              Add Category
            </Button>
          )}

          {canManageMenu && (
            <Button
              variant="contained"
              startIcon={<AddOutlined />}
              onClick={openCreateItem}
              disabled={categories.length === 0}
            >
              Add Item
            </Button>
          )}
        </Stack>
      </Stack>

      <Card
        elevation={0}
        sx={{
          mb: 2.5,
          border: 1,
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        <CardContent>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{
              alignItems: {
                xs: "stretch",
                md: "center",
              },
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
              >
                Current restaurant
              </Typography>
              <Typography
                sx={{ fontWeight: 800 }}
              >
                {activeRestaurantName}
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{ flexWrap: "wrap" }}
            >
              <Chip
                label={`${categories.length} categories`}
                variant="outlined"
              />
              <Chip
                label={`${menuItems.length} items`}
                variant="outlined"
              />
              <Chip
                label={`${unavailableCount} unavailable`}
                color={
                  unavailableCount > 0
                    ? "warning"
                    : "success"
                }
                variant="outlined"
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={2.5}
        sx={{ alignItems: "flex-start" }}
      >
        <Card
          elevation={0}
          sx={{
            width: { xs: "100%", lg: 270 },
            flexShrink: 0,
            border: 1,
            borderColor: "divider",
            borderRadius: 3,
          }}
        >
          <CardContent>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, mb: 1.5 }}
            >
              Categories
            </Typography>

            <Button
              fullWidth
              variant={
                selectedCategoryId === "all"
                  ? "contained"
                  : "text"
              }
              onClick={() =>
                setSelectedCategoryId("all")
              }
              sx={{
                justifyContent: "flex-start",
                mb: 0.5,
              }}
            >
              All items ({menuItems.length})
            </Button>

            <Stack spacing={0.5}>
              {categories.map((category) => {
                const count = menuItems.filter(
                  (item) =>
                    item.categoryId === category.id
                ).length;

                return (
                  <Stack
                    key={category.id}
                    direction="row"
                    spacing={0.25}
                    sx={{ alignItems: "center" }}
                  >
                    <Button
                      fullWidth
                      variant={
                        selectedCategoryId === category.id
                          ? "contained"
                          : "text"
                      }
                      onClick={() =>
                        setSelectedCategoryId(category.id)
                      }
                      sx={{
                        flex: 1,
                        justifyContent: "space-between",
                        textAlign: "left",
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {category.name}
                      </Box>
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{ ml: 1 }}
                      >
                        {count}
                      </Typography>
                    </Button>

                    {canManageMenu && (
                      <IconButton
                        size="small"
                        onClick={() =>
                          openEditCategory(category)
                        }
                        aria-label={`Edit ${category.name}`}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                    )}

                    {canManageMenu && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() =>
                          void handleDeleteCategory(category)
                        }
                        aria-label={`Delete ${category.name}`}
                      >
                        <DeleteOutlined fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                );
              })}
            </Stack>

            {categories.length === 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2 }}
              >
                No categories created yet.
              </Typography>
            )}
          </CardContent>
        </Card>

        <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ mb: 2 }}
          >
            <TextField
              size="small"
              fullWidth
              placeholder="Search menu items..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </Stack>

          {filteredItems.length === 0 ? (
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
                <LocalDiningOutlined
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
                  No menu items found
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {search
                    ? "Try a different search term."
                    : "Add a menu item to start building the menu."}
                </Typography>

                {canManageMenu &&
                  !search &&
                  categories.length > 0 && (
                    <Button
                      variant="contained"
                      startIcon={<AddOutlined />}
                      onClick={openCreateItem}
                    >
                      Add Item
                    </Button>
                  )}
              </CardContent>
            </Card>
          ) : (
            <Grid
              container
              spacing={2}
            >
              {filteredItems.map((item) => (
                <Grid
                  key={item.id}
                  size={{
                    xs: 12,
                    sm: 6,
                    xl: 4,
                  }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        height: 150,
                        bgcolor: "action.hover",
                        display: "grid",
                        placeItems: "center",
                        overflow: "hidden",
                      }}
                    >
                      {item.imageUrl ? (
                        <Box
                          component="img"
                          src={item.imageUrl}
                          alt={item.name}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={(event) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <ImageOutlined
                          sx={{
                            fontSize: 54,
                            color: "text.disabled",
                          }}
                        />
                      )}
                    </Box>

                    <CardContent sx={{ p: 2.25 }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="caption"
                            color="primary.main"
                            sx={{ fontWeight: 700 }}
                          >
                            {item.categoryName}
                          </Typography>

                          <Typography
                            variant="h6"
                            sx={{
                              mt: 0.25,
                              fontWeight: 800,
                            }}
                          >
                            {item.name}
                          </Typography>
                        </Box>

                        <Chip
                          label={
                            item.isAvailable
                              ? "Available"
                              : "Unavailable"
                          }
                          size="small"
                          color={
                            item.isAvailable
                              ? "success"
                              : "default"
                          }
                          variant="outlined"
                        />
                      </Stack>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 1,
                          minHeight: 42,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.description ||
                          "No description provided."}
                      </Typography>

                      <Stack
                        direction="row"
                        sx={{
                          mt: 2,
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          variant="h6"
                          color="primary.main"
                          sx={{ fontWeight: 800 }}
                        >
                          {currency(item.price)}
                        </Typography>

                        {canManageMenu && (
                          <Stack
                            direction="row"
                            spacing={0.5}
                          >
                            <IconButton
                              size="small"
                              onClick={() =>
                                openEditItem(item)
                              }
                              aria-label={`Edit ${item.name}`}
                            >
                              <EditOutlined fontSize="small" />
                            </IconButton>

                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                void handleDeleteItem(item)
                              }
                              aria-label={`Delete ${item.name}`}
                            >
                              <DeleteOutlined fontSize="small" />
                            </IconButton>
                          </Stack>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Stack>

      <Dialog
        open={categoryDialogOpen}
        onClose={closeCategoryDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingCategory
            ? "Edit Category"
            : "Add Category"}
        </DialogTitle>

        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}

          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Category name"
              value={categoryForm.name}
              onChange={(event) =>
                setCategoryForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              required
              fullWidth
              autoFocus
            />

            <TextField
              label="Description"
              value={categoryForm.description}
              onChange={(event) =>
                setCategoryForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              fullWidth
              multiline
              minRows={3}
            />

            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 700 }}>
                  Active category
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Keep this category visible in menu management.
                </Typography>
              </Box>

              <Switch
                checked={categoryForm.isActive}
                onChange={(event) =>
                  setCategoryForm((current) => ({
                    ...current,
                    isActive: event.target.checked,
                  }))
                }
              />
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={closeCategoryDialog}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleCategorySave()}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : editingCategory
                ? "Save Changes"
                : "Create Category"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={itemDialogOpen}
        onClose={closeItemDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingItem
            ? "Edit Menu Item"
            : "Add Menu Item"}
        </DialogTitle>

        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}

          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={itemForm.categoryId}
                label="Category"
                onChange={(event) => {
                  const rawValue = String(event.target.value);
                  setItemForm((current) => ({
                    ...current,
                    categoryId:
                      rawValue === ""
                        ? ""
                        : Number(rawValue),
                  }));
                }}
              >
                <SelectMenuItem value="">
                  Select category
                </SelectMenuItem>
                {categories.map((category) => (
                  <SelectMenuItem
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </SelectMenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Item name"
              value={itemForm.name}
              onChange={(event) =>
                setItemForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              required
              fullWidth
              autoFocus
            />

            <TextField
              label="Description"
              value={itemForm.description}
              onChange={(event) =>
                setItemForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              fullWidth
              multiline
              minRows={3}
            />

            <TextField
              label="Price"
              type="number"
              value={itemForm.price}
              onChange={(event) =>
                setItemForm((current) => ({
                  ...current,
                  price: event.target.value,
                }))
              }
              required
              fullWidth
              slotProps={{
                htmlInput: { min: 0.01, step: 0.01 },
              }}
            />

            <TextField
              label="Image URL"
              value={itemForm.imageUrl}
              onChange={(event) =>
                setItemForm((current) => ({
                  ...current,
                  imageUrl: event.target.value,
                }))
              }
              fullWidth
              placeholder="https://..."
            />

            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 700 }}>
                  Available for ordering
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Mark the item unavailable without deleting it.
                </Typography>
              </Box>

              <Switch
                checked={itemForm.isAvailable}
                onChange={(event) =>
                  setItemForm((current) => ({
                    ...current,
                    isAvailable: event.target.checked,
                  }))
                }
              />
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={closeItemDialog}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleItemSave()}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : editingItem
                ? "Save Changes"
                : "Create Item"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
