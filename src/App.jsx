import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import "./App.css";
import Header from "./components/Header/Header";
import Nav from "./components/NavMenu/Nav";
import Cabinet from "./Pages/Cabinet/Cabinet";
import Start from "./Pages/Start/Start";
import Create from "./Pages/Create/Create";
import Company from "./Pages/Company/Company";
import CalculatorPopup from "./components/Calculator/Calculator";
import Support from "./components/Support";
import Conf from "./components/Conf/Conf";
import PremiumSubscription from "./components/PremiumSubscription/PremiumSubscription";
import Notifications from "./components/Notifications/Notifications";
import LanguageSelector from "./components/LanguageSelector/LanguageSelector";
import Success from "./Pages/Success/Success";
import Tracker from "./Pages/Tracker/Tracker";
import CustomerDashboard from "./Pages/Dashboard/CustomerDashboard";
import LogisticianDashboard from "./Pages/Dashboard/LogisticianDashboard";
import DriverDashboard from "./Pages/Dashboard/DriverDashboard";
import OrderDetails from "./Pages/OrderDetails/OrderDetails";
import Fleet from "./Pages/Fleet/Fleet";
import ProtectedRoute from "./components/ProtectedRoute";

import { useAuth } from "./context/AuthContext";

function App() {
  const { role, user, loading } = useAuth();
  
  const effectiveRole = (role || user?.role || "").toUpperCase();
  console.log("App Render: Role =", effectiveRole, "User:", user);

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    // tg.requestFullscreen();
    tg.disableVerticalSwipes();
    tg.ready();

    return () => {
      tg.close(); // Закрытие веб-приложения (при необходимости)
    };
  }, []);
  return (
    <Router>
      <Header />
      <Nav />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/start" element={<Start />} />
        <Route path="/tracker" element={<Tracker />} />
        <Route path="/menu" element={<Cabinet />} />
        <Route path="/create" element={<Create />} />
        <Route path="/company" element={<Company />} />
        <Route path="/home" element={
          effectiveRole === 'CUSTOMER' ? <CustomerDashboard /> :
          effectiveRole === 'LOGISTICIAN' ? <LogisticianDashboard /> :
          effectiveRole === 'DRIVER' ? <DriverDashboard /> :
          <Navigate to="/menu" replace />
        } />
        <Route path="/support" element={<Support />} />
        <Route path="/conf" element={<Conf />} />
        <Route path="/prem" element={<PremiumSubscription />} />
        <Route path="/success" element={<Success />} />
        <Route path="/notification" element={<Notifications />} />
        <Route path="/lang" element={<LanguageSelector />} />
        
        {/* Order Details Route */}
        <Route path="/orders/:id" element={<OrderDetails />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
          <Route path="/dashboard/customer" element={<CustomerDashboard />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['LOGISTICIAN']} />}>
          <Route path="/dashboard/logistician" element={<LogisticianDashboard />} />
          <Route path="/fleet" element={<Fleet />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['DRIVER']} />}>
          <Route path="/dashboard/driver" element={<DriverDashboard />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
