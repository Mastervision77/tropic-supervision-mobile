import { StyleSheet, Platform } from "react-native";
import { Colors, Fonts } from "../../constants/theme";

const themeColors = Colors.light;
const APP_FONT_FAMILY = Fonts.cairo || "System";

const LoginStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 80,
    resizeMode: "contain",
  },
  welcomeText: {
    color: themeColors.secondary,
    marginBottom: 8,
    textAlign: "center",
    fontFamily: APP_FONT_FAMILY,
  },
  title: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: "center",
    color: themeColors.primary,
    fontFamily: APP_FONT_FAMILY,
  },
  inputLabel: {
    fontSize: 13,
    color: themeColors.text,
    marginBottom: 8,
    textAlign: "right",
    alignSelf: "flex-end",
    fontFamily: APP_FONT_FAMILY,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 16,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#F9F9FB",
    borderRadius: 8,
    paddingHorizontal: 16,
    color: themeColors.text,
    textAlign: "right",
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    fontFamily: APP_FONT_FAMILY,
  },
  passwordInputContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    width: "100%",
    height: 50,
    backgroundColor: "#F9F9FB",
    borderRadius: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  passwordInput: {
    flex: 1,
    color: themeColors.text,
    textAlign: "right",
    fontSize: 15,
    fontFamily: APP_FONT_FAMILY,
  },
  eyeIcon: {
    width: 20,
    height: 20,
    tintColor: themeColors.primary,
  },
  forgotPassword: {
    fontSize: 13,
    color: themeColors.text,
    marginBottom: 24,
    textAlign: "right",
    alignSelf: "flex-end",
    fontFamily: APP_FONT_FAMILY,
  },
  button: {
    width: "100%",
    backgroundColor: themeColors.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontFamily: APP_FONT_FAMILY,
  },
  footer: {
    marginTop: 30,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: themeColors.text,
    textAlign: "center",
    fontFamily: APP_FONT_FAMILY,
  },
  footerLink: {
    color: themeColors.secondary,
  },
});

export default LoginStyles;