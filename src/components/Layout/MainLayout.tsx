import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

/**
 * MainLayout — 全局布局：Header + Sidebar + Content
 * 深色沉浸式风格
 */
const MainLayout = () => (
  <div className="flex flex-col h-screen w-screen overflow-hidden" style={{ background: 'var(--color-bg-page)' }}>
    <Header />
    <div className="flex flex-1 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  </div>
);

export default MainLayout;
