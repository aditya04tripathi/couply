"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { signUpWithEmailAndPassword, loginWithEmailAndPassword, getUserByUid } from "@/lib/firebaseHelpers";
import { selectLoading, setLoading, setUser } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import React from "react";

const RegisterPageClient = () => {
  const router = useRouter();

  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [autoLogin, setAutoLogin] = React.useState(false);

  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectLoading);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(setLoading(true));

    try {
      await signUpWithEmailAndPassword({
        name: form.name,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      if (autoLogin) {
        const loggedInUser = await loginWithEmailAndPassword({
          email: form.email,
          password: form.password,
        });
        if (!loggedInUser) return;

        const loggedInUserData = await getUserByUid(loggedInUser.uid);

        if (!loggedInUserData?.onboarded) {
          router.push("/onboarding");
          return;
        }

        dispatch(setUser(loggedInUserData));
        router.push("/dashboard");
      }
    } catch (error) {
      console.error(error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h1>Welcome to Couply</h1>
        <span className="text-sm text-muted-foreground">Stop worrying about relationship hassles, and love your partner more.</span>
      </div>
      <Input type="text" placeholder="Enter your name" name="name" value={form.name} onChange={handleChange} />
      <Input type="email" placeholder="Enter your email address" name="email" value={form.email} onChange={handleChange} />
      <Input type="password" placeholder="Enter your password" name="password" value={form.password} onChange={handleChange} />
      <Input type="password" placeholder="Confirm your password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} />

      <Label htmlFor="autoLogin" className="flex items-center gap-2">
        <Checkbox
          id="autoLogin"
          checked={autoLogin}
          onCheckedChange={(checked) => {
            setAutoLogin(Boolean(checked));
          }}
        />
        Log me in after sign up.
      </Label>

      <div className="flex gap-2 mt-2">
        <Button type="submit" className="flex-1">
          {loading ? <Loader2 className="animate-spin" /> : "Sign up"}
        </Button>
        <Button onClick={() => router.push("/login")} type="button" className="flex-1" variant={"secondary"}>
          Existing user? Sign in.
        </Button>
      </div>
    </form>
  );
};

export default RegisterPageClient;
