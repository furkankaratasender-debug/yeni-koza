export const S = {
  bg:         "#1e2433",
  sidebar:    "#252b3b",
  card:       "#2a3142",
  border:     "#3a4155",
  text:       "#e2e8f0",
  textMuted:  "#8b95a9",
  textDim:    "#6b7588",
  accent:     "#4d7cfe",
  input:      "#323a4f",
  inputBorder:"#3f4a62",
};

export const inputStyle = {
  padding: "10px 12px",
  border: `1.5px solid ${S.inputBorder}`,
  borderRadius: 7,
  fontSize: 16,
  background: S.input,
  color: S.text,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

export const btnPrimary = {
  background: S.accent,
  color: "white",
  border: "none",
  padding: "10px 22px",
  borderRadius: 7,
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};

export const btnSecondary = {
  background: "transparent",
  color: S.textMuted,
  border: `1.5px solid ${S.border}`,
  padding: "10px 18px",
  borderRadius: 7,
  fontSize: 13,
  cursor: "pointer",
};
