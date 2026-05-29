export function Badge({ children }) {
  return (
    <span style={{
      background: "#3a4155",
      color: "#94a3b8",
      fontSize: 11,
      fontWeight: 700,
      padding: "3px 10px",
      borderRadius: 12,
      border: "1px solid #4a5568",
    }}>
      {children}
    </span>
  );
}
