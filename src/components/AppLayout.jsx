import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './AppLayout.module.css';

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <div className={styles.layout}>
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.logo}>
          <div className={styles.logoText}>
            <div className={styles.logoIcon}>🛡️</div>
            <span>Gestão de EPIs</span>
          </div>

          <button
            type="button"
            className={styles.sidebarToggle}
            onClick={handleToggleSidebar}
          >
            {isCollapsed ? '›' : '‹'}
          </button>
        </div>
        
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => 
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
              >
                <span className={styles.navIcon}>📊</span>
                <span className={styles.navText}>Dashboard</span>
              </NavLink>
            </li>
            <li className={styles.navItem}>
              <NavLink 
                to="/epis"
                className={({ isActive }) => 
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
              >
                <span className={styles.navIcon}>🦺</span>
                <span className={styles.navText}>EPIs</span>
              </NavLink>
            </li>
            <li className={styles.navItem}>
              <NavLink 
                to="/estoque"
                className={({ isActive }) => 
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
              >
                <span className={styles.navIcon}>📦</span>
                <span className={styles.navText}>Estoque</span>
              </NavLink>
            </li>
            <li className={styles.navItem}>
              <NavLink 
                to="/funcionarios"
                className={({ isActive }) => 
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
              >
                <span className={styles.navIcon}>👥</span>
                <span className={styles.navText}>Funcionários</span>
              </NavLink>
            </li>
            <li className={styles.navItem}>
              <NavLink 
                to="/epis-uso"
                className={({ isActive }) => 
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
              >
                <span className={styles.navIcon}>📋</span>
                <span className={styles.navText}>EPIs em uso</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>

      <div className={`${styles.main} ${isCollapsed ? styles.mainCollapsed : ''}`}>
        <header className={styles.header}>
          <div className={styles.headerUser}>
            Bem-vindo, <span className={styles.userName}>{user?.nome}</span> – {user?.empresa}
          </div>
          <div className={styles.headerActions}>
            <button className={styles.logoutBtn} onClick={logout}>
              Sair
            </button>
          </div>
        </header>
        
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
