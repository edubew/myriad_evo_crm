import "./Avatar.scss";

function Avatar({ src, name, size = "md", color = "#8B2A2A" }) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div
      className={`avatar avatar--${size}`}
      style={
        !src
          ? {
              background: `${color}20`,
              color: color,
            }
          : {}
      }
    >
      {src ? (
        <img
          src={src}
          alt={name || "User"}
          className="avatar__img"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
      ) : null}
      <span
        className="avatar__initials"
        style={{ display: src ? "none" : "flex" }}
      >
        {initials}
      </span>
    </div>
  );
}

export default Avatar;
