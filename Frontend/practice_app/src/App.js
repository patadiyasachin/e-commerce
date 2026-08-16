import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Product from './pages/Product';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminProducts from "./admin/AdminProducts";
import AddProduct from "./admin/AddProduct";
import AllUsers from "./admin/AllUsers";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Product />
            </ProtectedRoute>
          }
        />
        <Route path="/product/:id" element={
          <ProtectedRoute>
            <ProductDetail />
          </ProtectedRoute>
        } />

        <Route path="/cart" element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        } />

        {/* admin */}

        <Route
          path="/admin"
          element={<AdminLayout />}
        >

          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="products"
            element={<AdminProducts />}
          />

          <Route
            path="products/add"
            element={<AddProduct />}
          />

          <Route
            path="products/edit/:id"
            element={<AddProduct />}
          />

          <Route
            path="users"
            element={<AllUsers />}
          />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}