import React from "react";
import "./Header.scss";

function Header() {
  return (
    <header className="header">
      <div className="header__left">
        <h2 className="header__title">Dasboard</h2>
      </div>
      <div className="header__right">
        <button className="header__search">
          <span>⌕</span>
          <span className="header__search-text">Search...</span>
          <span className="header__search-kbd">⌘K</span>
        </button>
        <button className="header__icon-btn" title="Notifications">
          🔔
        </button>
        <div className="header__divider" />
        <div className="header__avatar">IK</div>
      </div>
    </header>
  );
}

export default Header;
