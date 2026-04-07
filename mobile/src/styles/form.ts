import { StyleSheet } from "react-native";

export const formStyles = StyleSheet.create({
  required: {
    color: "#e53e3e",
    fontWeight: "400",
  },
  optional: {
    color: "#999",
    fontWeight: "400",
    fontSize: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
});
