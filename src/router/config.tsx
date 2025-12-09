
import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import Dashboard from "../pages/dashboard/page";
import Requerimientos from "../pages/requerimientos/page";
import OrdenesCompra from "../pages/ordenes-compra/page";
import Reportes from "../pages/reportes/page";
import Productos from "../pages/productos/page";
import Inventario from "../pages/inventario/page";
import Configuracion from "../pages/configuracion/page";
import Almacenes from "../pages/almacenes/page";
import Transacciones from "../pages/transacciones/page";
import Kardex from "../pages/kardex/page";
import CatalogoProductos from "../pages/catalogo-productos/page";
import LineaProducto from "../pages/linea-producto/page";
import Login from "../pages/login/page";
import ProtectedRoute from "../components/ProtectedRoute";

const routes: RouteObject[] = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <ProtectedRoute><Home /></ProtectedRoute>,
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
  },
  {
    path: "/productos",
    element: <ProtectedRoute><Productos /></ProtectedRoute>,
  },
  {
    path: "/inventario",
    element: <ProtectedRoute><Inventario /></ProtectedRoute>,
  },
  {
    path: "/requerimientos",
    element: <ProtectedRoute><Requerimientos /></ProtectedRoute>,
  },
  {
    path: "/ordenes-compra",
    element: <ProtectedRoute><OrdenesCompra /></ProtectedRoute>,
  },
  {
    path: "/reportes",
    element: <ProtectedRoute><Reportes /></ProtectedRoute>,
  },
  {
    path: "/configuracion",
    element: <ProtectedRoute><Configuracion /></ProtectedRoute>,
  },
  {
    path: "/almacenes",
    element: <ProtectedRoute><Almacenes /></ProtectedRoute>,
  },
  {
    path: "/transacciones",
    element: <ProtectedRoute><Transacciones /></ProtectedRoute>,
  },
  {
    path: "/kardex",
    element: <ProtectedRoute><Kardex /></ProtectedRoute>,
  },
  {
    path: "/inventarios",
    element: <ProtectedRoute><Inventario /></ProtectedRoute>,
  },
  {
    path: "/catalogo-productos",
    element: <ProtectedRoute><CatalogoProductos /></ProtectedRoute>,
  },
  {
    path: "/linea-producto",
    element: <ProtectedRoute><LineaProducto /></ProtectedRoute>,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;