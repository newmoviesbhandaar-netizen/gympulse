import { initials, colorFromName } from "../../lib/helpers";

export default function Avatar({ url, name = "?", size = 40, className = "" }) {
  const style = { width: size, height: size, fontSize: size * 0.38 };
  if (url)
    return (
      <img
        src={url}
        alt={name}
        className={`rounded-full object-cover border-2 border-bordr ${className}`}
        style={style}
      />
    );
  return (
    <div
      className={`rounded-full flex items-center justify-center font-semibold text-white border-2 border-bordr flex-shrink-0 ${className}`}
      style={{ ...style, backgroundColor: colorFromName(name) }}
    >
      {initials(name)}
    </div>
  );
}
