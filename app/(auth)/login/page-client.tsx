"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getUserByUid, loginWithEmailAndPassword } from "@/lib/firebaseHelpers";
import { useAppDispatch } from "@/hooks/store";
import { selectLoading, setLoading, setPartner, setUser } from "@/store/authSlice";
import { toast } from "sonner";
import { useSelector } from "react-redux";

const LoginPageClient = () => {
  const router = useRouter();
  const [form, setForm] = React.useState({
    email: "",
    password: "",
  });

  const loading = useSelector(selectLoading);
  const dispatch = useAppDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(setLoading(true));

    const user = await loginWithEmailAndPassword({
      email: form.email,
      password: form.password,
    });

    const userData = await getUserByUid(user?.uid!);
    if (!userData) {
      toast.error("User data not found. Please try again.");
      console.error("User data not found");
      return;
    }

    if (!userData?.onboarded) {
      router.push("/onboarding");
      return;
    }

    const partner = await getUserByUid(userData.partnerUid!);

    dispatch(setUser(userData));
    dispatch(setPartner(partner!));
    dispatch(setLoading(false));

    router.push("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h1>Welcome back</h1>
        <span className="text-sm text-muted-foreground">Enter your credentials to access your account.</span>
      </div>
      <Input type="email" placeholder="Enter your email address" name="email" value={form.email} onChange={handleChange} />
      <Input type="password" placeholder="Enter your password" name="password" value={form.password} onChange={handleChange} />
      <div className="flex gap-2 mt-2">
        <Button className="flex-1">{loading ? <Loader2 className="animate-spin" /> : "Sign in"}</Button>
        <Button type="button" onClick={() => router.push("/")} className="flex-1" variant={"secondary"}>
          New user? Sign up.
        </Button>
      </div>
    </form>
  );
};

export default LoginPageClient;
