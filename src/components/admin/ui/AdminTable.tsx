interface Props {
  children: React.ReactNode;
}

export default function AdminTable({
  children,
}: Props) {
  return (
    <div
      style={{
        borderRadius: 12,
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 4px 18px rgba(0,0,0,.08)",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          tableLayout: "fixed",
        }}
      >
        {children}
      </table>
    </div>
  );
}