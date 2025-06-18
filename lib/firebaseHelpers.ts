import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { toast } from "sonner";
import { auth, db } from "./firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { IUser } from "@/types";

export const signUpWithEmailAndPassword = async ({
  name,
  email,
  password,
  confirmPassword,
}: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<{
  uid: string;
  email: string;
  photoURL: string;
  displayName: string;
} | null> => {
  if (password !== confirmPassword) {
    toast.error("The passwords do not match. Please re-check.");
    return null;
  }

  try {
    const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredentials.user;

    await updateProfile(user, {
      displayName: name,
    });

    await setDoc(doc(db, "users", user.uid), {
      anniversaryDate: "",
      chatroomUid: "",
      createdAt: new Date(),
      email: user.email,
      lastLogin: new Date(),
      name: name,
      onboarded: false,
      partnerUid: "",
      uid: user.uid,
    });

    return {
      displayName: name,
      photoURL: user.photoURL || "",
      email: user.email || email,
      uid: user.uid,
    };
  } catch (error: any) {
    switch (error.code) {
      case "auth/email-already-in-use":
        toast.error("Email already in use. Please use a different email.");
        break;
      case "auth/weak-password":
        toast.error("Weak password. Please choose a stronger password.");
        break;
      default:
        toast.error("An unexpected error occurred. Please try again.");
        console.error("Sign up error:", error);
        break;
    }
    return null;
  }
};

export const loginWithEmailAndPassword = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<{
  uid: string;
  email: string;
  photoURL: string;
  displayName: string;
} | null> => {
  try {
    const userCredentials = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredentials.user;

    return {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName!,
      photoURL: user.photoURL!,
    };
  } catch (error: any) {
    switch (error.code) {
      case "auth/user-not-found":
        toast.error("User not found. Please check your email and try again.");
        break;
      case "auth/wrong-password":
        toast.error("Incorrect password. Please try again.");
        break;
      case "auth/invalid-email":
        toast.error("Invalid email format. Please enter a valid email address.");
        break;
      case "auth/too-many-requests":
        toast.error("Too many login attempts. Please try again later.");
        break;
      default:
        toast.error("An unexpected error occurred. Please try again.");
        console.error("Login error:", error);
        break;
    }
    return null;
  }
};

export const getUserByUid = async (uid: string) => {
  try {
    const user = await getDoc(doc(db, "users", uid));
    if (user.exists()) {
      return user.data() as IUser;
    }
  } catch (error) {
    toast.error("Failed to fetch user data. Please try again later.");
    console.error("Error fetching user by UID:", error);
  }
};
