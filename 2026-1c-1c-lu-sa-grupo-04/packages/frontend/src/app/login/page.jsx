"use client";
import LoginPage from "../../components/login/Login";
import { useAuth } from "../providers";

export default function Login() {
  const { login, showModal } = useAuth();
  return <LoginPage onLoginSuccess={login} onError={showModal} />;
}