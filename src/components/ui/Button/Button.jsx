import React from "react";
import "./Button.scss";

function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  type = "button",
  onClick,
}) {
  return (
    <button
      type={type}
      className={[
        "btn",
        `btn--${variant}`,
        `btn--${size}`,
        fullWidth ? "btn--full" : "",
        loading ? "btn--loading" : "",
      ]
        .filter(Boolean)
        .join("")}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? <span className="btn__spinner"></span> : children}
    </button>
  );
}

export default Button;
