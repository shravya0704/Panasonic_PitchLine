interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}

export default function AdminButton({
  children,
  onClick,
  type = "primary",
  disabled = false,
}: Props) {
  const colors = {
    primary: "#005BAC",
    secondary: "#E9EEF5",
    danger: "#D32F2F",
  };

  const text = {
    primary: "#fff",
    secondary: "#222",
    danger: "#fff",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "9px 18px",
        borderRadius: 8,
        border: "none",
        fontWeight: 600,
        fontSize: 14,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "0.2s",
        minWidth: 80,
        background: colors[type],
        color: text[type],
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}