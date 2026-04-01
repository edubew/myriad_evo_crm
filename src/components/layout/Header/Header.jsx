import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import Avatar from "../../ui/Avatar/Avatar";
import "./Header.scss";

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/calendar": "Calendar",
  "/projects": "Projects",
  "/clients": "Clients",
  "/sales/pipeline": "Sales Pipeline",
  "/sales/leads": "Leads",
  "/team": "Team",
  "/documents": "Documents",
  "/goals": "Goals",
  "/finance/revenue": "Revenue",
  "/finance/invoices": "Invoices",
};

function Header({ onMenuToggle }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "system";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else if (theme === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const cycleTheme = () => {
    setTheme((prev) => {
      if (prev === "system") return "dark";
      if (prev === "dark") return "light";
      return "system";
    });
  };

  const themeIcon = {
    system: "◑",
    dark: "●",
    light: "○",
  }[theme];

  const themeLabel = {
    system: "System",
    dark: "Dark",
    light: "Light",
  }[theme];

  // handles dynamic routes like /projects/:id
  const getTitle = () => {
    const path = location.pathname;
    if (PAGE_TITLES[path]) return PAGE_TITLES[path];
    if (path.startsWith("/projects/")) return "Project";
    if (path.startsWith("/clients/")) return "Client";
    return "Myriad Evo";
  };

  // const handleLogout = async () => {
  //   await authService.logout();
  //   setUser(null);
  // };

  return (
    <header className="header">
      <div className="header__left">
        <button
          className="header__menu-btn"
          onClick={onMenuToggle}
          title="Toggle menu"
        >
          ☰
        </button>
        <h2 className="header__title">{getTitle()}</h2>
      </div>

      <div className="header__right">
        <button className="header__search">
          <span>⌕</span>
          <span className="header__search-text">Search...</span>
          <span className="header__search-kbd">⌘K</span>
        </button>

        <button
          className="header__theme-btn"
          onClick={cycleTheme}
          title={`Theme: ${themeLabel}`}
        >
          {themeIcon}
        </button>

        <button className="header__icon-btn" title="Notifications">
          🔔
        </button>

        <div className="header__divider" />
        <div className="header__avatar">
          <Avatar src={user?.avatar} name={user?.full_name} size="sm" />
        </div>

        <button className="header__logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;
