import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { darkTheme } from '@/theme/themeConfig';
import MainLayout from '@/components/Layout/MainLayout';
import LoginPage from '@/pages/Login/LoginPage';
import RegisterPage from '@/pages/Register/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPassword/ForgotPasswordPage';
import WorkspacePage from '@/pages/Workspace/WorkspacePage';
import HistoryPage from '@/pages/History/HistoryPage';
import HistoryDetailPage from '@/pages/History/HistoryDetailPage';
import SettingsPage from '@/pages/Settings/SettingsPage';

function App() {
  return (
    <ConfigProvider theme={darkTheme} locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route element={<MainLayout />}>
            <Route path="/workspace" element={<WorkspacePage />} />
            <Route path="/workspace/:id" element={<WorkspacePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/history/:id" element={<HistoryDetailPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
