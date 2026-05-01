// =============================================
// Navbar.tsx 
// =============================================

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthService from "../../services/auth.service";
import CartService from "../../services/cart.service";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState(AuthService.getCurrentUser());
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ── Cart count — page change হলে ──
  useEffect(() => {
    const loadCartCount = async () => {
      if (!AuthService.isAuthenticated()) {
        setCartCount(0);
        return;
      }
      try {
        const cart = await CartService.getMyCart();
        setCartCount(cart.items.length);
      } catch {
        setCartCount(0);
      }
    };
    loadCartCount();
  }, [location.pathname]);

  // ── Cart update event ──
  useEffect(() => {
    const handleCartUpdate = async () => {
      if (!AuthService.isAuthenticated()) return;
      try {
        const cart = await CartService.getMyCart();
        setCartCount(cart.items.length);
      } catch {
        setCartCount(0);
      }
    };
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  // ── Auth change ──
  useEffect(() => {
    const handleAuthChange = () => {
      setUser(AuthService.getCurrentUser());
      setCartCount(0);
    };
    window.addEventListener("authChanged", handleAuthChange);
    return () => window.removeEventListener("authChanged", handleAuthChange);
  }, []);

  // ── Dropdown outside click ──
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false); // event callback এ — ok
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isMenuOpenForPath = mobileMenuOpen;
  const isDropdownOpenForPath = dropdownOpen;


  const closeAll = () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    closeAll();
    AuthService.logout();
    navigate("/auth");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar navbar-dark bg-dark sticky-top shadow">
      <div className="container">

        {/* ── Top Row: Brand + Always-visible icons + Toggle ── */}
        <div className="d-flex align-items-center w-100 gap-2">

          {/* Brand */}
          <Link
            className="navbar-brand fw-bold d-flex align-items-center gap-2 me-auto"
            to="/"
            onClick={closeAll}
          >
            <span style={{ fontSize: "22px" }}>📚</span>
            <span className="d-none d-sm-inline">Book Emporium</span>
            <span className="d-inline d-sm-none">BookShop</span>
          </Link>

          {/* ── Always visible: Cart + Wishlist + User ── */}
          <div className="d-flex align-items-center gap-1">

            {/* Cart — always visible */}
            <Link
              className="nav-link text-white position-relative px-2"
              to={AuthService.isAuthenticated() ? "/cart" : "/auth"}
              onClick={closeAll}
              title="Cart"
            >
              <i className="bi bi-cart3 fs-5"></i>
              {cartCount > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark"
                  style={{ fontSize: "10px" }}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* Wishlist — always visible */}
            <Link
              className="nav-link text-white px-2"
              to="/wishlist"
              onClick={closeAll}
              title="Wishlist"
            >
              <i className="bi bi-heart fs-5"></i>
            </Link>

            {/* User Dropdown — always visible */}
            {user ? (
              <div className="position-relative" ref={dropdownRef}>
                <button
                  className="btn btn-outline-light btn-sm d-flex align-items-center gap-1 px-2"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  style={{ fontSize: "13px" }}
                >
                  <i className="bi bi-person-circle"></i>
                  <span className="d-none d-md-inline">{user.name}</span>
                  <i
                    className={`bi bi-chevron-${isDropdownOpenForPath ? "up" : "down"}`}
                    style={{ fontSize: "10px" }}
                  ></i>
                </button>

                {isDropdownOpenForPath && (
                  <ul
                    className="dropdown-menu dropdown-menu-end shadow show"
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 6px)",
                      minWidth: "210px",
                      zIndex: 9999,
                    }}
                  >
                    <li>
                      <span className="dropdown-item-text d-flex align-items-center gap-2">
                        <span
                          className={`badge ${
                            user.role === "Admin"
                              ? "bg-danger"
                              : user.role === "Vendor"
                              ? "bg-warning text-dark"
                              : "bg-primary"
                          }`}
                        >
                          {user.role}
                        </span>
                        <small className="text-muted text-truncate">{user.email}</small>
                      </span>
                    </li>
                    <li><hr className="dropdown-divider my-1" /></li>

                    <li>
                      <Link className="dropdown-item" to="/profile" onClick={closeAll}>
                        <i className="bi bi-person me-2"></i>My Profile
                      </Link>
                    </li>

                    {user.role === "Customer" && (
                      <>
                        <li>
                          <Link className="dropdown-item" to="/orders" onClick={closeAll}>
                            <i className="bi bi-bag me-2"></i>My Orders
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/vendor/register" onClick={closeAll}>
                            <i className="bi bi-shop me-2"></i>Become a Vendor
                          </Link>
                        </li>
                      </>
                    )}

                    {user.role === "Vendor" && (
                      <li>
                        <Link className="dropdown-item" to="/vendor/dashboard" onClick={closeAll}>
                          <i className="bi bi-shop me-2"></i>Vendor Dashboard
                        </Link>
                      </li>
                    )}

                    {user.role === "Admin" && (
                      <li>
                        <Link className="dropdown-item" to="/admin/dashboard" onClick={closeAll}>
                          <i className="bi bi-gear me-2"></i>Admin Panel
                        </Link>
                      </li>
                    )}

                    <li><hr className="dropdown-divider my-1" /></li>

                    <li>
                      <button
                        className="dropdown-item text-danger d-flex align-items-center gap-2"
                        onClick={handleLogout}
                      >
                        <i className="bi bi-box-arrow-right"></i>Logout
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            ) : (
              <Link className="btn btn-warning btn-sm fw-semibold" to="/auth" onClick={closeAll}>
                <i className="bi bi-person me-1"></i>
                <span className="d-none d-sm-inline">Sign In</span>
                <span className="d-inline d-sm-none">In</span>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="btn btn-outline-light btn-sm border-0 px-2"
              onClick={() => setMobileMenuOpen((p) => !p)}
              title="Menu"
            >
              <i className={`bi ${isMenuOpenForPath ? "bi-x-lg" : "bi-list"} fs-5`}></i>
            </button>
          </div>
        </div>

        {/* ── Search Bar (desktop always visible) ── */}
        <div className="w-100 d-none d-lg-block py-2">
          <form onSubmit={handleSearch}>
            <div className="input-group">
              <input
                type="search"
                className="form-control"
                placeholder="Search books, authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-warning" type="submit">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </form>
        </div>

        {/* ── Mobile Menu (search + links) ── */}
        {isMenuOpenForPath && (
          <div className="w-100 pb-3 d-lg-none">

            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-3">
              <div className="input-group">
                <input
                  type="search"
                  className="form-control"
                  placeholder="Search books, authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="btn btn-warning" type="submit">
                  <i className="bi bi-search"></i>
                </button>
              </div>
            </form>

            {/* Mobile Links */}
            <div className="d-flex flex-column gap-2">
              <Link
                className="btn btn-outline-light btn-sm text-start d-flex align-items-center gap-2"
                to="/"
                onClick={closeAll}
              >
                <i className="bi bi-house"></i>Home
              </Link>

              <Link
                className="btn btn-outline-light btn-sm text-start d-flex align-items-center gap-2"
                to={AuthService.isAuthenticated() ? "/cart" : "/auth"}
                onClick={closeAll}
              >
                <i className="bi bi-cart3"></i>Cart
                {cartCount > 0 && (
                  <span className="badge bg-warning text-dark ms-1">{cartCount}</span>
                )}
              </Link>

              <Link
                className="btn btn-outline-light btn-sm text-start d-flex align-items-center gap-2"
                to="/wishlist"
                onClick={closeAll}
              >
                <i className="bi bi-heart"></i>Wishlist
              </Link>

              {user?.role === "Customer" && (
                <Link
                  className="btn btn-outline-light btn-sm text-start d-flex align-items-center gap-2"
                  to="/orders"
                  onClick={closeAll}
                >
                  <i className="bi bi-bag"></i>My Orders
                </Link>
              )}

              {user?.role === "Vendor" && (
                <Link
                  className="btn btn-outline-light btn-sm text-start d-flex align-items-center gap-2"
                  to="/vendor/dashboard"
                  onClick={closeAll}
                >
                  <i className="bi bi-shop"></i>Vendor Dashboard
                </Link>
              )}

              {user?.role === "Admin" && (
                <Link
                  className="btn btn-outline-light btn-sm text-start d-flex align-items-center gap-2"
                  to="/admin/dashboard"
                  onClick={closeAll}
                >
                  <i className="bi bi-gear"></i>Admin Panel
                </Link>
              )}

              {user ? (
                <button
                  className="btn btn-outline-danger btn-sm text-start d-flex align-items-center gap-2"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right"></i>Logout
                </button>
              ) : (
                <Link
                  className="btn btn-warning btn-sm text-start d-flex align-items-center gap-2"
                  to="/auth"
                  onClick={closeAll}
                >
                  <i className="bi bi-person"></i>Sign In
                </Link>
              )}
            </div>
          </div>
        )}

      </div>
    </nav>
  );
}
