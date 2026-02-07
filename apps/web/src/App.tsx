import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { AppShell } from './layouts/AppShell';

const Login = React.lazy(() =>
  import('./pages/Login').then((m) => ({ default: m.Login })),
);
const Dashboard = React.lazy(() =>
  import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })),
);
const Transactions = React.lazy(() =>
  import('./pages/Transactions').then((m) => ({ default: m.Transactions })),
);
const Budgets = React.lazy(() =>
  import('./pages/Budgets').then((m) => ({ default: m.Budgets })),
);
const Categories = React.lazy(() =>
  import('./pages/Categories').then((m) => ({ default: m.Categories })),
);
const Recurring = React.lazy(() =>
  import('./pages/Recurring').then((m) => ({ default: m.Recurring })),
);
const Reports = React.lazy(() =>
  import('./pages/Reports').then((m) => ({ default: m.Reports })),
);
const Settings = React.lazy(() =>
  import('./pages/Settings').then((m) => ({ default: m.Settings })),
);
const Admin = React.lazy(() =>
  import('./pages/Admin').then((m) => ({ default: m.Admin })),
);
const Audit = React.lazy(() =>
  import('./pages/Audit').then((m) => ({ default: m.Audit })),
);
const Subscription = React.lazy(() =>
  import('./pages/Subscription').then((m) => ({ default: m.Subscription })),
);

const Protected: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Navigate to="/login" replace />} />
          <Route
            path="/app/*"
            element={
              <Protected>
                <AppShell>
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="transactions" element={<Transactions />} />
                    <Route path="budgets" element={<Budgets />} />
                    <Route path="categories" element={<Categories />} />
                    <Route path="recurring" element={<Recurring />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="audit" element={<Audit />} />
                    <Route path="subscription" element={<Subscription />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="admin" element={<Admin />} />
                    <Route
                      path="*"
                      element={<Navigate to="dashboard" replace />}
                    />
                  </Routes>
                </AppShell>
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
};
