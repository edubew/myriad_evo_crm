import { useEffect, useState } from "react";
import "./Header.scss";

function Header({ onMenuToggle }) {
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
        <h2 className="header__title">Dashboard</h2>
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
        <div className="header__avatar">WE</div>
      </div>
    </header>
  );
}

export default Header;
