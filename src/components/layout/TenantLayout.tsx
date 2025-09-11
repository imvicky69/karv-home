
import { NavLink, Outlet } from 'react-router-dom';
import { FiHome, FiFileText, FiUser } from 'react-icons/fi';

const navItems = [
  { path: '/', label: 'Home', icon: FiHome },
  { path: '/bills', label: 'Bills', icon: FiFileText },
  { path: '/profile', label: 'Profile', icon: FiUser },
];

// NEW: Sidebar component for desktop
const Sidebar = () => {
  return (
    // 'hidden' on small screens, 'flex' on medium screens and up
    <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-gray-200">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary font-secondary">KARV</h1>
      </div>
      <nav className="flex-1 px-4 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:bg-gray-100'
              }`
            }
          >
            <item.icon size={22} />
            <span className="ml-4 font-semibold">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

// UPDATED: BottomNav is now hidden on medium screens and up
const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-gray-200 shadow-lg md:hidden">
      <div className="flex justify-around items-center h-full">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full transition-colors duration-200 ${
                isActive ? 'text-primary' : 'text-text-secondary'
              }`
            }
          >
            <item.icon size={24} />
            <span className="text-xs font-medium mt-1">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

// UPDATED: The main layout now uses flexbox to position the sidebar and main content
const TenantLayout = () => {
  return (
    <div className="min-h-screen bg-background font-primary text-text-primary flex">
      {/* Sidebar is rendered but hidden on mobile */}
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-4 sm:p-6 md:p-8 pb-20 md:pb-8">
          {/* Outlet is where the page content (Home, Bills, etc.) goes */}
          <Outlet />
        </main>
      </div>

      {/* BottomNav is rendered but hidden on desktop */}
      <BottomNav />
    </div>
  );
};

export default TenantLayout;