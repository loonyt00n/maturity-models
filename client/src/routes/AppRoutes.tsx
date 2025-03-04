import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../models';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Dashboard Pages
import DashboardPage from '../pages/dashboard/DashboardPage';

// Catalog Pages
import CatalogPage from '../pages/catalog/CatalogPage';
import MaturityModelsPage from '../pages/catalog/MaturityModelsPage';
import ServicesPage from '../pages/catalog/ServicesPage';
import ActivitiesPage from '../pages/catalog/ActivitiesPage';
import JourneysPage from '../pages/catalog/JourneysPage';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import UserManagementPage from '../pages/admin/UserManagementPage';

// Campaign Pages
import CampaignsPage from '../pages/campaigns/CampaignsPage';
import CampaignDetailsPage from '../pages/campaigns/CampaignDetailsPage';

// Detail Pages
import MaturityModelDetailsPage from '../pages/details/MaturityModelDetailsPage';
import ServiceDetailsPage from '../pages/details/ServiceDetailsPage';
import ActivityDetailsPage from '../pages/details/ActivityDetailsPage';
import JourneyDetailsPage from '../pages/details/JourneyDetailsPage';

// Evaluations Pages
import ServiceEvaluationsPage from '../pages/evaluations/ServiceEvaluationsPage';
import EvaluationDetailsPage from '../pages/evaluations/EvaluationDetailsPage';

// Protected route component
interface ProtectedRouteProps {
  element: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  element, 
  allowedRoles 
}) => {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/dashboard" />;
  }

  return <>{element}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/" element={<AuthLayout />}>
        <Route index element={<Navigate to="/login" />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      {/* Main App Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute element={<MainLayout />} />
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        
        {/* Catalog Routes */}
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="maturity-models" element={<MaturityModelsPage />} />
        <Route path="maturity-models/:id" element={<MaturityModelDetailsPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="services/:id" element={<ServiceDetailsPage />} />
        <Route path="activities" element={<ActivitiesPage />} />
        <Route path="activities/:id" element={<ActivityDetailsPage />} />
        <Route path="journeys" element={<JourneysPage />} />
        <Route path="journeys/:id" element={<JourneyDetailsPage />} />
        
        {/* Campaign Routes */}
        <Route path="campaigns" element={<CampaignsPage />} />
        <Route path="campaigns/:id" element={<CampaignDetailsPage />} />

        {/* Evaluations Routes */}
        <Route path="evaluations" element={<ServiceEvaluationsPage />} />
        <Route path="evaluations/:id" element={<EvaluationDetailsPage />} />
        
        {/* Admin Routes */}
        <Route 
          path="admin" 
          element={
            <ProtectedRoute 
              element={<AdminDashboardPage />} 
              allowedRoles={[UserRole.ADMIN]} 
            />
          } 
        />
        <Route 
          path="admin/users" 
          element={
            <ProtectedRoute 
              element={<UserManagementPage />} 
              allowedRoles={[UserRole.ADMIN]} 
            />
          } 
        />
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

export default AppRoutes;
