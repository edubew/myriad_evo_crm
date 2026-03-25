import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import "./Sidebar.scss";

const navigation = [
  { label: "Dashboard", icon: "⊞", path: "/dashboard" },
  { label: "Calendar", icon: "◷", path: "/calendar" },
  { label: "Projects", icon: "◈", path: "/projects" },
  {
    label: "Company",
    icon: "⬡",
    path: "/company",
    children: [
      { label: "Team", path: "/team" },
      { label: "Goals", path: "/goals" },
      { label: "Documents", path: "/documents" },
    ],
  },
  { label: "Clients", icon: "◎", path: "/clients" },
  {
    label: "Sales",
    icon: "◉",
    path: "/sales",
    children: [
      { label: "Leads", path: "/sales/leads" },
      { label: "Pipeline", path: "/sales/pipeline" },
    ],
  },
  {
    label: "Finance",
    icon: "◇",
    path: "/finance",
    children: [
      { label: "Revenue", path: "/finance/revenue" },
      { label: "Invoices", path: "/finance/invoices" },
    ],
  },
];

const DEV_USER = { first_name: "Inayat", last_name: "Khan", role: "Admin" };

function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const location = useLocation();
  const activeUser = user || DEV_USER;

  const initials = `${activeUser.first_name?.[0] || ""}${activeUser.last_name?.[0] || ""}`;
  const fullName = `${activeUser.first_name} ${activeUser.last_name}`;

  const [isTablet, setIsTablet] = useState(
    window.innerWidth <= 1024 && window.innerWidth > 640,
  );
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsTablet(window.innerWidth <= 1024 && window.innerWidth > 640);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth <= 640) {
      onClose();
    }
  }, [location.pathname]);

  const isCollapsed = isTablet && !hovered;

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside
        className={[
          "sidebar",
          isOpen ? "sidebar--open" : "",
          isCollapsed ? "sidebar--collapsed" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onMouseEnter={() => isTablet && setHovered(true)}
        onMouseLeave={() => isTablet && setHovered(false)}
      >
        <div className="sidebar__logo">
          <span className="sidebar__logo-mark">M</span>
          <span className="sidebar__logo-text">Myriad Evo</span>
          <button
            className="sidebar__close-btn"
            onClick={onClose}
            title="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="sidebar__nav">
          {navigation.map((item) => (
            <div key={item.path} className="sidebar__group">
              <NavLink
                to={item.path}
                end={item.path === "/dashboard"}
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
                }
                title={isCollapsed ? item.label : ""}
              >
                <span className="sidebar__icon">{item.icon}</span>
                <span className="sidebar__label">{item.label}</span>
              </NavLink>

              {item.children && !isCollapsed && (
                <div className="sidebar__children">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      className={({ isActive }) =>
                        `sidebar__child-link ${
                          isActive ? "sidebar__child-link--active" : ""
                        }`
                      }
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__avatar" title={isCollapsed ? fullName : ""}>
            {initials}
          </div>
          <div className="sidebar__user-info">
            <span className="sidebar__user-name">{fullName}</span>
            <span className="sidebar__user-role">{activeUser.role}</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
