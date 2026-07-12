"use client";
import RegisterPage from "../../components/register/Register";
import { useAuth } from "../providers";

export default function Register() {
  const { showModal } = useAuth();
  return <RegisterPage onError={showModal} />;
}
