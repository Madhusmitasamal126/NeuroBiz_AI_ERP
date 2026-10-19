
import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const emptyForm = () => ({
  invoice_number: "",
  customer: "",
  sale_date: today(),
  product: "",
  quantity: "1",
  payment_method: "UPI",
  status: "Pending",
});

const getRows = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  if (typeof data === "string") return data;
  if (data?.detail) return data.detail;

  if (data && typeof data === "object") {
    return Object.entries(data)
      .map(([key, value]) => {
        const message = Array.isArray(value)
          ? value.join(", ")
          : typeof value === "string"
            ? value
            : JSON.stringify(value);

        return `${key}: ${message}`;
      })
      .join(" | ");
  }

  if (error?.response?.status === 404) {
    return "The API endpoint was not found. Check your Django URLs.";
  }

  if ([401, 403].includes(error?.response?.status)) {
    return "Please log in again. Your session may have expired.";
  }

  return error?.message || "Something went wrong.";
};

function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const [loadingSales, setLoadingSales] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Always fetch products from the same database used by Inventory.
  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);

    try {
      const response = await api.get("/products/");
      setProducts(getRows(response.data));
    } catch (err) {
      console.error("Failed to load inventory products:", err);
      setProducts([]);
      setError(`Could not load Inventory products: ${getErrorMessage(err)}`);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const loadSales = useCallback(async () => {
    setLoadingSales(true);

    try {
      const response = await api.get("/sales/");
      setSales(getRows(response.data));
    } catch (err) {
      console.error("Failed to load sales:", err);
      setSales([]);
      setError(`Could not load sales: ${getErrorMessage(err)}`);
    } finally {
      setLoadingSales(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadSales();
  }, [loadProducts, loadSales]);

  // Find the selected product from the Inventory API response.
  const selectedProduct = useMemo(
    () =>
      products.find(
        (product) => String(product.id) === String(form.product)
      ),
    [products, form.product]
  );

  const productPrice = Number(selectedProduct?.price || 0);
  const quantity = Number(form.quantity || 0);
  const calculatedAmount =
    selectedProduct && quantity > 0 ? productPrice * quantity : 0;

  // Products available to select in a new sale.
  const availableProducts = products.filter(
    (product) => product.is_active !== false
  );

  const totalSales = sales.reduce(
    (sum, sale) => sum + Number(sale.amount || 0),
    0
  );

  const paidAmount = sales
    .filter((sale) => sale.status === "Paid")
    .reduce((sum, sale) => sum + Number(sale.amount || 0), 0);

  const pendingAmount = sales
    .filter((sale) => sale.status === "Pending")
    .reduce((sum, sale) => sum + Number(sale.amount || 0), 0);

  const filteredSales = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return sales.filter((sale) => {
      const product = products.find(
        (item) => String(item.id) === String(sale.product)
      );

      const productName =
        sale.product_name || product?.name || "";

      const matchesSearch =
        !keyword ||
        String(sale.invoice_number || "").toLowerCase().includes(keyword) ||
        String(sale.customer || "").toLowerCase().includes(keyword) ||
        String(productName).toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "All" || sale.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [sales, products, search, statusFilter]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleProductChange = (event) => {
    setForm((previous) => ({
      ...previous,
      product: event.target.value,
      quantity: "1",
    }));

    setError("");
  };

  const resetForm = () => {
    setForm(emptyForm());
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.invoice_number.trim()) {
      setError("Enter an invoice number.");
      return;
    }

    if (!form.customer.trim()) {
      setError("Enter the customer name.");
      return;
    }

    if (!selectedProduct) {
      setError("Select a product from Inventory.");
      return;
    }

    const stock = Number(selectedProduct.stock_quantity || 0);

    if (!Number.isInteger(quantity) || quantity < 1) {
      setError("Quantity must be a positive whole number.");
      return;
    }

    if (quantity > stock) {
      setError(`Only ${stock} units are available for ${selectedProduct.name}.`);
      return;
    }

    const duplicate = sales.some(
      (sale) =>
        String(sale.invoice_number || "").trim().toLowerCase() ===
        form.invoice_number.trim().toLowerCase()
    );

    if (duplicate) {
      setError("This invoice number already exists.");
      return;
    }

    const payload = {
      invoice_number: form.invoice_number.trim(),
      customer: form.customer.trim(),
      sale_date: form.sale_date,
      product: Number(selectedProduct.id),
      quantity,
      amount: calculatedAmount.toFixed(2),
      payment_method: form.payment_method,
      status: form.status,
    };

    setSaving(true);

    try {
      await api.post("/sales/", payload);

      setSuccess("Sale added successfully.");
      resetForm();

      // Reload both APIs after saving.
      await Promise.all([loadProducts(), loadSales()]);
    } catch (err) {
      console.error("Failed to save sale:", err);
      setError(`Could not save sale: ${getErrorMessage(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (sale, status) => {
    if (status === sale.status) return;

    const oldStatus = sale.status;

    setSales((previous) =>
      previous.map((item) =>
        item.id === sale.id ? { ...item, status } : item
      )
    );

    setError("");
    setSuccess("");

    try {
      await api.patch(`/sales/${sale.id}/`, { status });
      setSuccess("Sale status updated.");
      await loadSales();
    } catch (err) {
      setSales((previous) =>
        previous.map((item) =>
          item.id === sale.id ? { ...item, status: oldStatus } : item
        )
      );

      setError(`Could not update status: ${getErrorMessage(err)}`);
    }
  };

  const handleDelete = async (sale) => {
    if (!window.confirm(`Delete invoice ${sale.invoice_number}?`)) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`/sales/${sale.id}/`);
      setSuccess("Sale deleted successfully.");
      await loadSales();
    } catch (err) {
      setError(`Could not delete sale: ${getErrorMessage(err)}`);
    }
  };

  const exportCSV = () => {
    const headers = [
      "Invoice Number",
      "Customer",
      "Product",
      "Quantity",
      "Date",
      "Amount",
      "Payment Method",
      "Status",
    ];

    const rows = filteredSales.map((sale) => {
      const product = products.find(
        (item) => String(item.id) === String(sale.product)
      );

      return [
        sale.invoice_number,
        sale.customer,
        sale.product_name || product?.name || "",
        sale.quantity ?? "",
        sale.sale_date || "",
        sale.amount ?? 0,
        sale.payment_method || "",
        sale.status || "",
      ];
    });

    if (rows.length === 0) {
      setError("There are no sales records to export.");
      return;
    }

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
    link.download = "sales-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusClass = (status) => {
    if (status === "Paid") return "bg-success";
    if (status === "Pending") return "bg-warning text-dark";
    if (status === "Cancelled") return "bg-secondary";
    return "bg-light text-dark";
  };

  return (
    <div className="d-flex">
      <Sidebar />

      <main
        className="flex-grow-1 p-3 p-md-4"
        style={{
          minWidth: 0,
          minHeight: "100vh",
          backgroundColor: "#f8fafc",
        }}
      >
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div>
            <h2 className="fw-bold mb-1">Sales Management</h2>
            <p className="text-muted mb-0">
              Create invoices using products saved in Inventory.
            </p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={exportCSV}
            >
              <i className="bi bi-download me-2" />
              Export CSV
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                loadProducts();
                loadSales();
              }}
              disabled={loadingProducts || loadingSales}
            >
              <i className="bi bi-arrow-clockwise me-1" />
              Refresh
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setShowForm((previous) => !previous);
                setError("");
                setSuccess("");

                // Fetch the latest inventory when opening the form.
                if (!showForm) loadProducts();
              }}
            >
              <i className="bi bi-plus-lg me-2" />
              {showForm ? "Close Form" : "Add Sale"}
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger alert-dismissible">
            <strong>Error: </strong>
            {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => setError("")}
              aria-label="Close"
            />
          </div>
        )}

        {success && (
          <div className="alert alert-success alert-dismissible">
            {success}
            <button
              type="button"
              className="btn-close"
              onClick={() => setSuccess("")}
              aria-label="Close"
            />
          </div>
        )}

        {/* Summary cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted mb-2">Total Sales</div>
                <h3 className="fw-bold mb-1">{formatCurrency(totalSales)}</h3>
                <small className="text-muted">
                  {sales.length} invoices
                </small>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted mb-2">Paid Amount</div>
                <h3 className="fw-bold text-success mb-1">
                  {formatCurrency(paidAmount)}
                </h3>
                <small className="text-muted">Payments received</small>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted mb-2">Pending Amount</div>
                <h3 className="fw-bold text-warning mb-1">
                  {formatCurrency(pendingAmount)}
                </h3>
                <small className="text-muted">Payments awaiting collection</small>
              </div>
            </div>
          </div>
        </div>

        {/* Add sale form */}
        {showForm && (
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white py-3">
              <h5 className="fw-bold mb-0">Create New Sale</h5>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Invoice Number *
                    </label>
                    <input
                      className="form-control"
                      name="invoice_number"
                      value={form.invoice_number}
                      onChange={handleChange}
                      placeholder="INV-2026-001"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Customer Name *
                    </label>
                    <input
                      className="form-control"
                      name="customer"
                      value={form.customer}
                      onChange={handleChange}
                      placeholder="Enter customer name"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Product from Inventory *
                    </label>
                    <select
                      className="form-select"
                      name="product"
                      value={form.product}
                      onChange={handleProductChange}
                      required
                      disabled={loadingProducts}
                    >
                      <option value="">
                        {loadingProducts
                          ? "Loading inventory products..."
                          : "Select a product"}
                      </option>

                      {availableProducts.map((product) => {
                        const stock = Number(product.stock_quantity || 0);

                        return (
                          <option
                            key={product.id}
                            value={product.id}
                            disabled={stock <= 0}
                          >
                            {product.name} | SKU: {product.sku} |{" "}
                            {formatCurrency(product.price)} | Stock: {stock}
                            {stock <= 0 ? " (Out of stock)" : ""}
                          </option>
                        );
                      })}
                    </select>

                    <div className="d-flex justify-content-between mt-1">
                      <small className="text-muted">
                        {availableProducts.length} active products found
                      </small>
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0"
                        onClick={loadProducts}
                        disabled={loadingProducts}
                      >
                        {loadingProducts ? "Refreshing..." : "Refresh products"}
                      </button>
                    </div>

                    {!loadingProducts && availableProducts.length === 0 && (
                      <small className="text-danger">
                        No active products found. Add a product in Inventory first.
                      </small>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Sale Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      name="sale_date"
                      value={form.sale_date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {selectedProduct && (
                    <div className="col-12">
                      <div className="alert alert-info mb-0">
                        <strong>Selected product:</strong>{" "}
                        {selectedProduct.name} &nbsp;|&nbsp;
                        <strong>SKU:</strong> {selectedProduct.sku} &nbsp;|&nbsp;
                        <strong>Unit price:</strong>{" "}
                        {formatCurrency(selectedProduct.price)} &nbsp;|&nbsp;
                        <strong>Available stock:</strong>{" "}
                        {selectedProduct.stock_quantity}
                      </div>
                    </div>
                  )}

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Quantity *</label>
                    <input
                      type="number"
                      className="form-control"
                      name="quantity"
                      value={form.quantity}
                      onChange={handleChange}
                      min="1"
                      max={selectedProduct?.stock_quantity ?? undefined}
                      step="1"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Total Amount
                    </label>
                    <input
                      className="form-control fw-bold"
                      value={formatCurrency(calculatedAmount)}
                      readOnly
                    />
                    <small className="text-muted">
                      Automatically calculated from Inventory price × quantity.
                    </small>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Payment Method
                    </label>
                    <select
                      className="form-select"
                      name="payment_method"
                      value={form.payment_method}
                      onChange={handleChange}
                    >
                      <option>UPI</option>
                      <option>Bank Transfer</option>
                      <option>Cash</option>
                      <option>Card</option>
                      <option>Cheque</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Status</label>
                    <select
                      className="form-select"
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option>Pending</option>
                      <option>Paid</option>
                      <option>Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="d-flex gap-2 mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      saving ||
                      loadingProducts ||
                      !selectedProduct ||
                      quantity < 1 ||
                      quantity > Number(selectedProduct?.stock_quantity || 0)
                    }
                  >
                    <i className="bi bi-check-circle me-2" />
                    {saving ? "Saving Sale..." : "Save Sale"}
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
                <label className="form-label">Search sales</label>
                <input
                  className="form-control"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search invoice, customer, or product"
                />
              </div>

              <div className="col-md-5">
                <label className="form-label">Filter by status</label>
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="All">All statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Sales records */}
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white py-3">
            <h5 className="fw-bold mb-0">Sales Records</h5>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Date</th>
                  <th>Payment</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Update Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loadingSales ? (
                  <tr>
                    <td colSpan="11" className="text-center py-5">
                      Loading sales records...
                    </td>
                  </tr>
                ) : filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="text-center text-muted py-5">
                      No sales records found. Click Add Sale to create one.
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale, index) => {
                    const product = products.find(
                      (item) => String(item.id) === String(sale.product)
                    );

                    return (
                      <tr key={sale.id}>
                        <td>{index + 1}</td>
                        <td className="fw-semibold">{sale.invoice_number}</td>
                        <td>{sale.customer}</td>
                        <td>{sale.product_name || product?.name || "-"}</td>
                        <td>{sale.quantity ?? "-"}</td>
                        <td>{sale.sale_date || "-"}</td>
                        <td>{sale.payment_method || "-"}</td>
                        <td className="fw-semibold">
                          {formatCurrency(sale.amount)}
                        </td>
                        <td>
                          <span className={`badge ${getStatusClass(sale.status)}`}>
                            {sale.status || "Unknown"}
                          </span>
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={sale.status || "Pending"}
                            onChange={(event) =>
                              handleStatusChange(sale, event.target.value)
                            }
                            aria-label={`Update ${sale.invoice_number} status`}
                          >
                            <option>Pending</option>
                            <option>Paid</option>
                            <option>Cancelled</option>
                          </select>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            title="Delete sale"
                            onClick={() => handleDelete(sale)}
                          >
                            <i className="bi bi-trash" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="card-footer bg-white text-muted">
            Showing {filteredSales.length} of {sales.length} sales
          </div>
        </div>
      </main>
    </div>
  );
}

export default Sales;
