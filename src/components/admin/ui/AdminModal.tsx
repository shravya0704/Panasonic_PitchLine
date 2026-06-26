interface Props {
  children: React.ReactNode;
  onClose: () => void;
}

export default function AdminModal({
  children,
  onClose,
}: Props) {

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflowY: "auto",
        padding: 40,
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 900,
          maxWidth: "95%",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#fff",
          borderRadius: 12,
          padding: 30,
        }}
      >
        {children}

        <div
          style={{
            marginTop: 25,
            textAlign: "right",
          }}
        >
          <button
            onClick={onClose}
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}