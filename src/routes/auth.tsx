import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Beer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({ meta: [{ title: "Увійти — Real Beer" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: redirect ?? "/", replace: true });
  }, [user, navigate, redirect]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: name, phone },
          },
        });
        if (error) throw error;
        toast.success("Акаунт створено!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Вітаємо!");
      }
    } catch (e: any) {
      toast.error(e.message ?? "Помилка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-10">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-amber shadow-glow">
            <Beer className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold">
            {mode === "signin" ? "Вітаємо у " : "Реєстрація в "}
            <span className="text-gradient-gold">Real Beer</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin" ? "Увійдіть, щоб продовжити" : "Створіть акаунт за хвилину"}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <>
              <Input label="Ім'я" value={name} onChange={setName} placeholder="Ваше ім'я" />
              <Input label="Телефон" value={phone} onChange={setPhone} placeholder="+380 ..." type="tel" />
            </>
          )}
          <Input label="Email" value={email} onChange={setEmail} placeholder="you@example.com" type="email" required />
          <Input label="Пароль" value={password} onChange={setPassword} placeholder="Мінімум 6 символів" type="password" required />

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center rounded-full bg-gradient-amber py-3.5 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60"
          >
            {loading ? "Зачекайте…" : mode === "signin" ? "Увійти" : "Створити акаунт"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-6 text-center text-sm text-muted-foreground"
        >
          {mode === "signin" ? (
            <>Немає акаунту? <span className="font-semibold text-primary">Зареєструватися</span></>
          ) : (
            <>Вже є акаунт? <span className="font-semibold text-primary">Увійти</span></>
          )}
        </button>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-border/60 bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
      />
    </label>
  );
}
