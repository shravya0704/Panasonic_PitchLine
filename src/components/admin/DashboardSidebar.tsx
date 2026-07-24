interface DashboardSidebarProps {
  selected: string;
  onSelect: (page: string) => void;
  onLogout: () => void;
}

export default function DashboardSidebar({
  selected,
  onSelect,
  onLogout,
}: DashboardSidebarProps) {
  const items = [
    "Products",
    "Series",
    "Leads",
    "Settings",
  ];

  return (
    <div
      style={{
        width: 240,
        background: "#005BAC",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <h2
          style={{
            padding: 20,
            margin: 0,
            borderBottom: "1px solid rgba(255,255,255,.2)",
          }}
        >
          Panasonic
        </h2>

        {items.map((item) => (
          <div
            key={item}
            onClick={() => onSelect(item)}
            style={{
              padding: 18,
              cursor: "pointer",
              background:
                selected === item
                  ? "rgba(255,255,255,.15)"
                  : "transparent",
            }}
          >
            {item}
          </div>
        ))}
      </div>

      <button
        onClick={onLogout}
        style={{
          margin: 20,
          padding: 12,
          border: "none",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}