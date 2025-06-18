"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { auth, db } from "@/lib/firebaseConfig";
import { getUserByUid } from "@/lib/firebaseHelpers";
import { selectUser, setPartner, setUser } from "@/store/authSlice";
import { addDoc, collection, doc, getDocs, query, setDoc, Timestamp, updateDoc, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "sonner";

const OnboardingPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [open, setOpen] = React.useState(false);
  const [anniversary, setAnniversary] = React.useState<Date | undefined>(new Date());
  const [partnerEmail, setPartnerEmail] = React.useState("");

  const user = useAppSelector(selectUser);

  const handleSubmit = async () => {
    const partnerDoc = await getDocs(query(collection(db, "users"), where("email", "==", partnerEmail)));
    const partnerSnapshot = partnerDoc.docs[0];

    if (!partnerSnapshot) {
      toast.error("Partner not found. Please check the email address.");
      return;
    }
    const partnerUid = partnerSnapshot.data().uid;

    let partnerData = await getUserByUid(partnerUid);
    let userData = await getUserByUid(auth.currentUser!.uid);

    dispatch(setUser(userData!));
    dispatch(setPartner(partnerData!));

    console.log(auth.currentUser!.uid, partnerUid);

    const chatRoom = await addDoc(collection(db, "chatrooms"), {
      users: [auth.currentUser!.uid, partnerUid],
      messages: [],
    });

    await setDoc(
      doc(db, "users", user?.uid!),
      {
        partnerUid: partnerUid,
        anniversaryDate: Timestamp.fromDate(anniversary!),
        chatroomUid: chatRoom.id,
        onboarded: true,
      },
      { merge: true }
    );
    await setDoc(
      doc(db, "users", partnerUid),
      {
        partnerUid: user?.uid,
        anniversaryDate: Timestamp.fromDate(anniversary!),
        chatroomUid: chatRoom.id,
        onboarded: true,
      },
      { merge: true }
    );

    partnerData = await getUserByUid(partnerUid);
    userData = await getUserByUid(auth.currentUser!.uid);

    dispatch(setUser(userData!));
    dispatch(setPartner(partnerData!));

    toast.success("Onboarding completed successfully!");
    router.push("/dashboard");
  };

  return (
    <div className="flex items-center justify-center w-full h-screen min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle>Tell us about your relationship</CardTitle>
          <CardDescription>These details will help us provide a personalized experience.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Calendar
            className="border rounded-md"
            mode="single"
            selected={anniversary}
            captionLayout="dropdown"
            onSelect={(date) => {
              setAnniversary(date);
              setOpen(false);
            }}
          />
          <Input type="email" placeholder="Enter your partner's email address" value={partnerEmail} onChange={(e) => setPartnerEmail(e.target.value)} />
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} className="w-full">
            Complete!
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OnboardingPage;
