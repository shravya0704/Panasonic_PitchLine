interface Props {
  title?: string;
  children: React.ReactNode;
}

export default function AdminCard({
  title,
  children,
}: Props) {

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 24,
        boxShadow:
          "0 2px 10px rgba(0,0,0,.08)",
      }}
    >
      {title && (
        <h2
          style={{
            marginTop: 0,
          }}
        >
          {title}
        </h2>
      )}

      {children}
    </div>
  );

}