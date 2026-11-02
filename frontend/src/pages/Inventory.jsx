
import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const emptyProduct = {
  name: "",
  sku: "",
  category: "",
  description: "",
  price: "",
  stock_quantity: "0",
  is_active: true,
};

function getRows(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function getErrorMessage(error) {
  const data = error.response?.data;

  if (typeof data === "string") return data;
  if (data?.detail) return data.detail;

  if (data && typeof data === "object") {
    return Object.entries(data)
      .map(([key, value]) => {
        const message = Array.isArray(value)
          ? value.join(", ")
          : typeof value === "object"
            ? JSON.stringify(value)
            : String(value);

        return `${key}: ${message}`;
      })
      .join(" | ");
  }

  if (error.response?.status === 401) {
    return "Your login session has expired. Please log in again.";
  }

  if (error.response?.status === 403) {
    return "You do not have permission to manage products.";
  }

  return error.message || "Something went wrong. Please try again.";
}

function Inventory() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/products/");
      setProducts(getRows(response.data));
    } catch (err) {
      setError(
        `Could not load products. ${getErrorMessage(err)} Check that Django has the /api/products/ route.`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);

  const activeProducts = products.filter(
    (product) => product.is_active !== false
  ).length;

  const totalStockUnits = products.reduce(
    (sum, product) => sum + Number(product.stock_quantity || 0),
    0
  );

  const inventoryValue = products.reduce(
    (sum, product) =>
      sum +
      Number(product.price || 0) *
        Number(product.stock_quantity || 0),
    0
  );

  const lowStockCount = products.filter(
    (product) =>
      product.is_active !== false &&
      Number(product.stock_quantity) <= 5
  ).length;

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !keyword ||
        String(product.name || "").toLowerCase().includes(keyword) ||
        String(product.sku || "").toLowerCase().includes(keyword) ||
        String(product.category || "").toLowerCase().includes(keyword);

      const stock = Number(product.stock_quantity || 0);

      const matchesStock =
        stockFilter === "All"
          ? true
          : stockFilter === "Low Stock"
            ? stock > 0 && stock <= 5
            : stockFilter === "Out of Stock"
              ? stock === 0
              : stock > 5;

      return matchesSearch && matchesStock;
    });
  }, [products, search, stockFilter]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
  };

  const resetForm = () => {
    setFormData(emptyProduct);
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const handleAddNew = () => {
    setFormData(emptyProduct);
    setEditingId(null);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name || "",
      sku: product.sku || "",
      category: product.category || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      stock_quantity: String(product.stock_quantity ?? 0),
      is_active: product.is_active !== false,
    });

    setEditingId(product.id);
    setShowForm(true);
    setError("");
    setSuccess("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const name = formData.name.trim();
    const sku = formData.sku.trim();
    const price = Number(formData.price);
    const stock = Number(formData.stock_quantity);

    if (!name || !sku) {
      setError("Product name and SKU are required.");
      return;
    }

    if (formData.price === "" || !Number.isFinite(price) || price < 0) {
      setError("Enter a valid price greater than or equal to zero.");
      return;
    }

    if (
      formData.stock_quantity === "" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setError("Stock must be a whole number greater than or equal to zero.");
      return;
    }

    const payload = {
      name,
      sku,
      category: formData.category.trim(),
      description: formData.description.trim(),
      price: price.toFixed(2),
      stock_quantity: stock,
      is_active: Boolean(formData.is_active),
    };

    setSaving(true);

    try {
      if (editingId !== null) {
        await api.patch(`/products/${editingId}/`, payload);
        setSuccess("Product updated successfully in the database.");
      } else {
        await api.post("/products/", payload);
        setSuccess("Product added successfully to the database.");
      }

      resetForm();
      await loadProducts();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}" (${product.sku})?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`/products/${product.id}/`);

      setProducts((previous) =>
        previous.filter((item) => item.id !== product.id)
      );

      setSuccess(`Product "${product.name}" deleted successfully.`);

      if (editingId === product.id) {
        resetForm();
      }
    } catch (err) {
      setError(
        `${getErrorMessage(err)} If this product is linked to a sale, Django may prevent deletion.`
      );
    }
  };

  const handleExport = () => {
    const headers = [
      "Product Name",
      "SKU",
      "Category",
      "Description",
      "Price",
      "Stock Quantity",
      "Active",
    ];

    const rows = filteredProducts.map((product) => [
      product.name,
      product.sku,
      product.category,
      product.description,
      product.price,
      product.stock_quantity,
      product.is_active ? "Yes" : "No",
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "inventory-products.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="d-flex">
      <Sidebar />

      <main
        className="flex-grow-1 p-3 p-md-4"
        style={{ minWidth: 0, backgroundColor: "#f8fafc", minHeight: "100vh" }}
      >
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div>
            <h2 className="fw-bold mb-1">Inventory Management</h2>
            <p className="text-muted mb-0">
              Add products, manage stock, and track inventory value.
            </p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={handleExport}
            >
              <i className="bi bi-download me-2" />
              Export CSV
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddNew}
            >
              <i className="bi bi-plus-lg me-2" />
              Add Product
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show">
            <strong>Error: </strong>
            {error}
            <button
              type="button"
              className="btn-close"
              aria-label="Close error"
              onClick={() => setError("")}
            />
          </div>
        )}

        {success && (
          <div className="alert alert-success alert-dismissible fade show">
            {success}
            <button
              type="button"
              className="btn-close"
              aria-label="Close success"
              onClick={() => setSuccess("")}
            />
          </div>
        )}

        {/* Summary cards */}
        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted mb-2">Total Products</div>
                <h3 className="fw-bold mb-0">{products.length}</h3>
                <small className="text-muted">
                  {activeProducts} active products
                </small>
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted mb-2">Total Stock Units</div>
                <h3 className="fw-bold mb-0">{totalStockUnits}</h3>
                <small className="text-muted">Across all products</small>
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted mb-2">Inventory Value</div>
                <h3 className="fw-bold mb-0">
                  {formatCurrency(inventoryValue)}
                </h3>
                <small className="text-muted">Price × current stock</small>
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted mb-2">Low Stock</div>
                <h3 className="fw-bold mb-0 text-warning">
                  {lowStockCount}
                </h3>
                <small className="text-muted">
                  Active products with 1–5 units
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Add/edit product form */}
        {showForm && (
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white py-3">
              <h5 className="fw-bold mb-0">
                {editingId !== null ? "Edit Product" : "Add New Product"}
              </h5>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter product name"
                      maxLength={200}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">SKU *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      placeholder="e.g. PROD-001"
                      maxLength={50}
                      required
                    />
                    <small className="text-muted">
                      SKU must be unique for each product.
                    </small>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Category</label>
                    <input
                      type="text"
                      className="form-control"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      placeholder="e.g. Electronics"
                      maxLength={100}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      name="stock_quantity"
                      value={formData.stock_quantity}
                      onChange={handleInputChange}
                      min="0"
                      step="1"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Optional product details"
                      rows="2"
                    />
                  </div>

                  <div className="col-12">
                    <div className="form-check">
                      <input
                        id="product-active"
                        className="form-check-input"
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="product-active"
                      >
                        Product is active and available for sale
                      </label>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-2 mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    <i className="bi bi-check-circle me-2" />
                    {saving
                      ? "Saving..."
                      : editingId !== null
                        ? "Update Product"
                        : "Save Product to Database"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={resetForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Search and filter */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-7">
                <label className="form-label">Search products</label>
                <input
                  className="form-control"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by product name, SKU, or category"
                />
              </div>

              <div className="col-md-5">
                <label className="form-label">Stock filter</label>
                <select
                  className="form-select"
                  value={stockFilter}
                  onChange={(event) => setStockFilter(event.target.value)}
                >
                  <option value="All">All stock levels</option>
                  <option value="In Stock">More than 5 units</option>
                  <option value="Low Stock">Low stock (1–5 units)</option>
                  <option value="Out of Stock">Out of stock</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Products table */}
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
            <h5 className="fw-bold mb-0">Product Inventory</h5>

            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={loadProducts}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise me-1" />
              Refresh
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Inventory Value</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-5">
                      Loading products from the database...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-5">
                      <i className="bi bi-box-seam fs-2 d-block text-muted mb-2" />
                      <div className="fw-semibold">No products found</div>
                      <small className="text-muted">
                        Add a product or change your search/filter.
                      </small>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product, index) => {
                    const stock = Number(product.stock_quantity || 0);
                    const lowStock = stock > 0 && stock <= 5;

                    return (
                      <tr key={product.id}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="fw-semibold">{product.name}</div>
                          {product.description && (
                            <small className="text-muted">
                              {product.description}
                            </small>
                          )}
                        </td>
                        <td>{product.sku}</td>
                        <td>{product.category || "-"}</td>
                        <td>{formatCurrency(product.price)}</td>
                        <td>
                          <span
                            className={`badge ${
                              stock === 0
                                ? "bg-danger"
                                : lowStock
                                  ? "bg-warning text-dark"
                                  : "bg-success"
                            }`}
                          >
                            {stock}
                          </span>
                        </td>
                        <td>
                          {formatCurrency(
                            Number(product.price) * stock
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              product.is_active !== false
                                ? "bg-success"
                                : "bg-secondary"
                            }`}
                          >
                            {product.is_active !== false
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEdit(product)}
                              title="Edit product"
                            >
                              <i className="bi bi-pencil" />
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(product)}
                              title="Delete product"
                            >
                              <i className="bi bi-trash" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="card-footer bg-white text-muted">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>
      </main>
    </div>
  );
}

export default Inventory;
