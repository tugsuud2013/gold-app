"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import LoginBackground from "@/components/auth/LoginBackground";
import GoldAppLogo from "@/components/public/GoldAppLogo";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

const schema = z.object({
  email: z.string().email("И-мэйл буруу байна"),
  password: z.string().min(8, "Нууц үг хамгийн багадаа 8 тэмдэгт"),
});

type FormValues = z.infer<typeof schema>;
type LoginResponse = { accessToken: string; role: "SUPER_ADMIN" | "ADMIN" | "OPERATOR" };

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setError("");
    setLoading(true);
    try {
      const res = await api.post<FormValues, LoginResponse>("/api/admin/auth/login", values);
      const token = res.accessToken;
      setAuth(
        {
          id: "me",
          email: values.email,
          name: "Admin",
          role: res.role ?? "ADMIN",
          status: "ACTIVE",
        },
        token,
      );
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Нэвтрэх үед алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <LoginBackground />

      <div className="login-page-shell">
        <div className="login-card rounded-2xl">
          <div className="login-card-header">
            <GoldAppLogo size="login" showTagline href="/" />
            <p className="login-card-subtitle">Админ системд нэвтрэх</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="login-field">
              <label className="login-label" htmlFor="login-email">
                И-мэйл / хэрэглэгчийн нэр
              </label>
              <Input
                id="login-email"
                type="email"
                autoComplete="username"
                className="login-input"
                placeholder="name@goldapp.mn"
                {...register("email")}
              />
              {errors.email && <p className="login-error">{errors.email.message}</p>}
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="login-password">
                Нууц үг
              </label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                className="login-input"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && <p className="login-error">{errors.password.message}</p>}
            </div>

            {error && <p className="login-error login-error--banner">{error}</p>}

            <Button type="submit" className="login-submit w-full" loading={loading}>
              Нэвтрэх
            </Button>
          </form>

          <Link href="/" className="login-back-link">
            ← Нүүр хуудас руу буцах
          </Link>
        </div>
      </div>
    </div>
  );
}
