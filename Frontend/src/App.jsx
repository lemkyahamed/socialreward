import React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { LayoutDashboard, Compass, Send, DollarSign, PlusSquare, Target, CheckSquare, Users, ShieldAlert, Activity } from "lucide-react"

// Layouts
import { PublicLayout } from "./layouts/PublicLayout"
import { DashboardLayout } from "./layouts/DashboardLayout"

// Public Pages
import { Home } from "./pages/public/Home"
import { Campaigns } from "./pages/public/Campaigns"
import { CampaignDetail } from "./pages/public/CampaignDetail"
import { Auth } from "./pages/public/Auth"
import { About } from "./pages/public/About"
import { FAQ } from "./pages/public/FAQ"

// Creator Pages
import { CreatorDashboard } from "./pages/creator/CreatorDashboard"
import { AvailableCampaigns } from "./pages/creator/AvailableCampaigns"
import { JoinedCampaigns } from "./pages/creator/JoinedCampaigns"
import { SubmissionPage } from "./pages/creator/SubmissionPage"
import { EarningsPage } from "./pages/creator/EarningsPage"

// Brand Pages
import { BrandDashboard } from "./pages/brand/BrandDashboard"
import { CreateCampaign } from "./pages/brand/CreateCampaign"
import { ManageCampaign } from "./pages/brand/ManageCampaign"
import { SubmissionReview } from "./pages/brand/SubmissionReview"
import { PayoutSummary } from "./pages/brand/PayoutSummary"

// Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard"
import { ManageUsers } from "./pages/admin/ManageUsers"
import { ManageCampaigns } from "./pages/admin/ManageCampaigns"
import { SuspiciousSubmissions } from "./pages/admin/SuspiciousSubmissions"
import { SystemJobLogs } from "./pages/admin/SystemJobLogs"

// Nav Items Configuration
const creatorNavItems = [
  { label: "Dashboard", href: "/creator", icon: LayoutDashboard },
  { label: "Find Campaigns", href: "/creator/campaigns", icon: Compass },
  { label: "Joined Campaigns", href: "/creator/campaigns/joined", icon: CheckSquare },
  { label: "Earnings", href: "/creator/earnings", icon: DollarSign },
]

const brandNavItems = [
  { label: "Dashboard", href: "/brand", icon: LayoutDashboard },
  { label: "Create Campaign", href: "/brand/campaigns/create", icon: PlusSquare },
  { label: "My Campaigns", href: "/brand/campaigns", icon: Target },
  { label: "Submissions", href: "/brand/submissions", icon: Send },
  { label: "Payouts", href: "/brand/payouts", icon: DollarSign },
]

const adminNavItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Campaigns", href: "/admin/campaigns", icon: Target },
  { label: "Moderation", href: "/admin/moderation", icon: ShieldAlert },
  { label: "System Logs", href: "/admin/logs", icon: Activity },
]

// Add useAuth and useLocation imports to protect routes
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { useLocation } from "react-router-dom"

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
};

// Route Configuration Map wrapper to inject user details
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public View */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/campaigns/:id" element={<CampaignDetail />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
      </Route>

      {/* Creator App */}
      <Route element={
        <ProtectedRoute allowedRoles={["creator"]}>
          <DashboardLayout 
            navItems={creatorNavItems} 
            userRole="creator" 
            userName={user?.profile?.displayName || user?.email || "Creator"} 
          />
        </ProtectedRoute>
      }>
        <Route path="/creator" element={<CreatorDashboard />} />
        <Route path="/creator/campaigns" element={<AvailableCampaigns />} />
        <Route path="/creator/campaigns/joined" element={<JoinedCampaigns />} />
        <Route path="/creator/campaigns/:id" element={<CampaignDetail />} />
        <Route path="/creator/campaigns/:id/submit" element={<SubmissionPage />} />
        <Route path="/creator/earnings" element={<EarningsPage />} />
      </Route>

      {/* Brand App */}
      <Route element={
        <ProtectedRoute allowedRoles={["brand"]}>
          <DashboardLayout 
            navItems={brandNavItems} 
            userRole="brand" 
            userName={user?.profile?.companyName || user?.email || "Brand"} 
          />
        </ProtectedRoute>
      }>
        <Route path="/brand" element={<BrandDashboard />} />
        <Route path="/brand/campaigns" element={<ManageCampaigns />} /> {/* Reusing the list view for brevity */}
        <Route path="/brand/campaigns/create" element={<CreateCampaign />} />
        <Route path="/brand/campaigns/:id" element={<ManageCampaign />} />
        <Route path="/brand/submissions" element={<SubmissionReview />} /> {/* Default review queue */}
        <Route path="/brand/submissions/:id" element={<SubmissionReview />} />
        <Route path="/brand/payouts" element={<PayoutSummary />} />
      </Route>

      {/* Admin App */}
      <Route element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <DashboardLayout 
            navItems={adminNavItems} 
            userRole="admin" 
            userName={user?.email || "Admin"} 
          />
        </ProtectedRoute>
      }>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/campaigns" element={<ManageCampaigns />} />
        <Route path="/admin/moderation" element={<SuspiciousSubmissions />} />
        <Route path="/admin/logs" element={<SystemJobLogs />} />
      </Route>

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
