import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const DEV_USER = { first_name: "Inayat", last_name: "Khan", role: "admin" };

const navigation = [
  {
    label: "Dashboard",
    icon: "⊞",
    path: "/dashboard",
  },
  {
    label: "Calendar",
    icon: "◷",
    path: "/calendar",
  },
  {
    label: "Projects",
    icon: "◈",
    path: "/projects",
  },
  {
    label: "Clients",
    icon: "◎",
    path: "/clients",
  },
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
    label: "Company",
    icon: "⬡",
    path: "/company",
    children: [
      { label: "Team", path: "/team" },
      { label: "Meetings", path: "/meetings" },
      { label: "Goals", path: "/goals" },
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

function Sidebar() {
  const { user } = useAuth()
  const activeUser = user || DEV_USER
  
  const initials = `${activeUser.first_name?.[0] || ''}${activeUser.last_name?.[0] || ''}`
  const fullName = `${activeUser.first_name} ${activeUser.last_name}`

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <span className="sidebar__logo-mark">M</span>
        <span className="sidebar__logo-text">Myriad Evo</span>
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
            >
              <span className="sidebar__icon">{item.icon}</span>
              <span className="sidebar__label">{item.label}</span>
            </NavLink>

            {/* Sub menu */}
            {item.children && (
              <div className="sidebar__children">
                {item.children.map((child) => (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    className={({ isActive }) =>
                      `sidebar__child-link ${isActive ? "sidebar__child-link--active" : ""}`
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
        <div className="sidebar__avatar">{initials}</div>
        <div className="sidebar__user-info">
          <span className="sidebar__user-name">{fullName}</span>
          <span className="sidebar__user-role">{activeUser.role}</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
