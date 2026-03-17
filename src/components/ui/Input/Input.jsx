import React from "react";
import "./Input.scss";

function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  name,
  autoComplete,
}) {
  return (
    <div className={`input-field ${error ? "input-field--error" : ""}`}>
      {label && <label className="input-field__label">{label}</label>}
      <input
        className="input-field__input"
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
      />
      {error && <span className="input-field__error">{error}</span>}
    </div>
  );
}

export default Input;