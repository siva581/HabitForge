import { useState } from "react";

const avatarStyles = [
  { name: "avataaars", params: "scale=80&backgroundColor=random" },
  { name: "adventurer", params: "scale=80&backgroundColor=random" },
  { name: "avataaars-neutral", params: "scale=80&backgroundColor=random" }
];

const fallbackStyle = {
  borderRadius: "50%",
  backgroundColor: "rgba(124, 58, 237, 0.4)",
  border: "2px solid rgba(124, 58, 237, 0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  color: "#7c3aed"
};

function getInitials(seed) {
  return seed
    .split("-")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "👤";
}

export function Avatar({ seed = "forge", size = 48, className = "" }) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [styleIndex, setStyleIndex] = useState(0);

  const currentStyle = avatarStyles[styleIndex];
  const avatarUrl = `https://api.dicebear.com/9.x/${currentStyle.name}/svg?seed=${encodeURIComponent(seed)}&${currentStyle.params}&flip=false`;

  function handleError() {
    if (styleIndex < avatarStyles.length - 1) {
      setStyleIndex((current) => current + 1);
    } else {
      setHasError(true);
    }
  }

  if (hasError) {
    const initials = getInitials(seed);

    return (
      <div
        className={`avatar avatar-fallback ${className}`}
        style={{
          ...fallbackStyle,
          width: size,
          height: size,
          fontSize: size * 0.4,
        }}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      key={styleIndex}
      src={avatarUrl}
      alt="User avatar"
      width={size}
      height={size}
      className={`avatar ${className}`}
      onError={handleError}
      onLoad={() => setIsLoading(false)}
      style={{
        borderRadius: "50%",
        objectFit: "cover",
        display: "inline-block",
        opacity: isLoading ? 0.6 : 1,
        transition: "opacity 0.3s ease",
        border: "2px solid rgba(124, 58, 237, 0.2)"
      }}
    />
  );
}
