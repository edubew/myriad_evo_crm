import React from 'react';
import "./Badge.scss";

function Badge({label, color, size='md'}) {
  return (
    <span
      className={`badge badge--${size}`}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        borderColor: `${color}40`
      }}
    >
      {label}
    </span>
  )
}

export default Badge
