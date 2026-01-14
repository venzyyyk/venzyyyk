import { useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LeadsPage from './pages/LeadsPage';
import DealsPage from './pages/DealsPage';
import TasksPage from './pages/TasksPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

const AppLayout = ({ user, children }) => {
  const location = useLocation();
  const titleMap = {
    '/dashboard': 'Дашборд',
    '/leads': 'Ліди',
    '/deals': 'Угоди',
    '/tasks': 'Задачі',
    '/analytics': 'Аналітика',
    '/settings': 'Налаштування'
  };
  const title = titleMap[location.pathname] || 'MiniCRM';

  return (
    <div className="app-shell">
      <Sidebar />
      <div>
        <Topbar title={title} user={user} />
        <main className="page">{children}</main>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ token, children }) => {
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });

  const auth = useMemo(
    () => ({
      token,
      user,
      login: (nextToken, nextUser) => {
        localStorage.setItem('token', nextToken);
        localStorage.setItem('user', JSON.stringify(nextUser));
        setToken(nextToken);
        setUser(nextUser);
      },
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      }
    }),
    [token, user]
  );

  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginPage auth={auth} />}
      />
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute token={token}>
            <AppLayout user={user}>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leads"
        element={
          <ProtectedRoute token={token}>
            <AppLayout user={user}>
              <LeadsPage user={user} />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/deals"
        element={
          <ProtectedRoute token={token}>
            <AppLayout user={user}>
              <DealsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute token={token}>
            <AppLayout user={user}>
              <TasksPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute token={token}>
            <AppLayout user={user}>
              <AnalyticsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute token={token}>
            <AppLayout user={user}>
              <SettingsPage auth={auth} />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
