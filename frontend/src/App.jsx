// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import AppLayout from './components/AppLayout';
import ChatsPage from './pages/chats/ChatsPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import BasePage from './pages/database/DatabasePage.jsx';
import MailingPage from './pages/mailing/MailingPage';
import LoginPage from './pages/login/Login';
import ProfilePage from './pages/profile/ProfilePage';

import AuthProvider, { useAuth } from './context/AuthContext';
import Protected from './components/Protected';

/**
 * Показывает дочерний контент только гостям.
 * Если пользователь авторизован — перенаправляет на /chats.
 */
function PublicOnly({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/chats" replace />;
  return children;
}

/**
 * Плавное появление/исчезновение контента страницы.
 * Без собственного скролла и без абсолютного позиционирования.
 */
function PageTransition({ children }) {
  return (
    <motion.div
      className="relative h-full w-full overflow-x-hidden"
      style={{ transformOrigin: 'center center', contain: 'layout paint size' }}
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Набор маршрутов приложения с анимацией переходов.
 */
function AppRoutes() {
  const location = useLocation();

  return (
    // Фиксируем вьюпорт и убираем внешний скролл
    <div className="fixed inset-0 w-full min-h-[100dvh] overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          {/* /login без анимации */}
          <Route
            path="/login"
            element={
              <PublicOnly>
                <LoginPage />
              </PublicOnly>
            }
          />

          {/* Приватные роуты под общим лэйаутом */}
          <Route
            path="/"
            element={
              <Protected>
                <AppLayout />
              </Protected>
            }
          >
            <Route index element={<Navigate to="/chats" replace />} />

            <Route
              path="chats"
              element={
                <PageTransition>
                  <ChatsPage />
                </PageTransition>
              }
            />

            <Route
              path="analytics"
              element={
                <PageTransition>
                  <AnalyticsPage />
                </PageTransition>
              }
            />

            <Route
              path="database"
              element={
                <PageTransition>
                  <BasePage />
                </PageTransition>
              }
            />

            <Route
              path="mailing"
              element={
                <PageTransition>
                  <MailingPage />
                </PageTransition>
              }
            />

            <Route
              path="profile"
              element={
                <PageTransition>
                  <ProfilePage />
                </PageTransition>
              }
            />
          </Route>

          {/* Фоллбек */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

/**
 * Корень приложения: провайдер авторизации + роутер.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
