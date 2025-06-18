"use client";

import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { auth, db, storage } from "@/lib/firebaseConfig";
import { logOutUser, selectPartner, selectUser, setPartner, setUser } from "@/store/authSlice";
import { IMessage, IUser } from "@/types";
import { Loader2, Paperclip, SendHorizonal, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { arrayRemove, arrayUnion, doc, getDoc, onSnapshot, Timestamp, updateDoc } from "firebase/firestore";
import { ScrollArea } from "@/components/ui/scroll-area";
import clsx from "clsx";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";

const Dashboard = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const dispatch = useAppDispatch();

  const fileRef = React.useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const partner = useAppSelector(selectPartner);
  const user = useAppSelector(selectUser);

  const getMessageStreamFromFirestore = () => {
    console.log("UserUID:", user?.chatroomUid);
    const chatroomDoc = doc(db, "chatrooms", user?.chatroomUid!);
    const unsubscribe = onSnapshot(chatroomDoc, (docSnapshot) => {
      console.log(docSnapshot.data());
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        if (data.messages) {
          setMessages(data.messages as IMessage[]);
        }
      }
    });
    return unsubscribe;
  };

  const fetchUserAndPartner = async () => {
    const userDoc = await getDoc(doc(db, "users", auth.currentUser!.uid));
    const partnerUid = userDoc.data()?.partnerUid;
    const partnerDoc = await getDoc(doc(db, "users", partnerUid));

    if (userDoc.exists() && partnerDoc.exists()) {
      const userData = userDoc.data();
      const partnerData = partnerDoc.data();

      dispatch(setUser(userData! as IUser));
      dispatch(setPartner(partnerData! as IUser));
    } else {
      console.error("User or Partner document does not exist.");
    }
  };

  useEffect(() => {
    fetchUserAndPartner().then(() => {
      const unsubscribe = getMessageStreamFromFirestore();
      return () => {
        unsubscribe();
      };
    });
  }, []);

  const timestampToDate = (timestampMs: Timestamp) => {
    const date = new Date(timestampMs.seconds * 1000);
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sendMessage = async () => {
    let imageDownloadUrl = "";
    const _filename = image ? `${Date.now()}.${image.name.split(".").pop()}` : "";
    if (image) {
      const storageRef = ref(storage, `${user!.chatroomUid!}/${_filename}`);
      await uploadBytes(storageRef, image);
      imageDownloadUrl = await getDownloadURL(storageRef);
    }

    const newMessage: IMessage = {
      content: message,
      senderUid: user!.uid,
      timestamp: Timestamp.now(),
      attachmentUrl: imageDownloadUrl,
      filename: image ? _filename : "",
    };

    const chatroomDoc = doc(db, "chatrooms", user?.chatroomUid!);
    await updateDoc(chatroomDoc, { messages: arrayUnion(newMessage) });

    setMessage("");
    setImage(null);
  };

  const deleteMessage = async (messageToDelete: IMessage) => {
    const chatroomDoc = doc(db, "chatrooms", user?.chatroomUid!);
    await updateDoc(chatroomDoc, { messages: arrayRemove(messageToDelete) });
    if (messageToDelete.attachmentUrl) {
      const fileRef = ref(storage, `${user!.chatroomUid!}/${messageToDelete.filename}`);
      await deleteObject(fileRef);
    }
  };

  const calculateNumberOfDaysTogether = (startDate: Timestamp) => {
    const today = Timestamp.now();
    const timeDiff = today.nanoseconds - startDate.nanoseconds;
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

    console.log("TimeElapsed in Days:", daysDiff);

    return daysDiff >= 0 ? daysDiff : 0;
  };

  if (!partner)
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen p-2 sm:p-4">
        <div className="relative flex flex-col w-full max-w-4xl h-[90vh] sm:h-[80vh] border rounded-lg overflow-hidden">
          <ScrollArea className="absolute overflow-auto top-5 bottom-24 sm:bottom-20 px-2 sm:px-5 w-full">
            <div className="flex flex-col gap-2">
              {messages.map((message) => (
                <div key={message.timestamp.toString()} className={clsx("p-2 rounded-lg flex flex-col max-w-[85%] sm:max-w-[70%]", user!.uid === message.senderUid ? "text-right self-end rounded-br-none bg-primary" : "self-start rounded-bl-none bg-secondary")}>
                  <div className="flex items-center gap-2">
                    <Trash2Icon className={user!.uid !== message.senderUid ? "hidden cursor-pointer" : "cursor-pointer"} size={16} onClick={() => deleteMessage(message)} />
                    <span className={clsx("flex-1 text-[10px] sm:text-xs", user!.uid === message.senderUid ? "text-primary-foreground" : "text-muted-foreground")}>
                      {message.senderUid === user!.uid ? user!.name : partner.name} • {timestampToDate(message.timestamp)}
                    </span>
                  </div>
                  {message.attachmentUrl && (
                    <div className="my-2">
                      <Image height={1080} width={1920} src={message.attachmentUrl} alt="Attachment" className="object-contain rounded max-w-full" />
                    </div>
                  )}
                  <p className="break-words">{message.content}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="absolute flex flex-col sm:flex-row items-stretch gap-2 bottom-2 sm:bottom-5 left-2 right-2 sm:left-5 sm:right-5">
            <div className="relative flex-1">
              {image && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Image src={URL.createObjectURL(image)} alt="Attachment" className="absolute left-2 top-1/2 -translate-y-1/2 block cursor-pointer" height={24} width={24} />
                  </DialogTrigger>
                  <DialogContent className="max-w-[90vw] sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Image Attachment</DialogTitle>
                      <DialogDescription>Preview your attached image before sending.</DialogDescription>
                    </DialogHeader>
                    <Image width={1920} height={1080} src={URL.createObjectURL(image)} alt="Attachment" className="object-contain w-full h-full" />
                  </DialogContent>
                </Dialog>
              )}
              <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Enter your message..." className={clsx("w-full", image && "pl-10")} />
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Paperclip className="flex-1 md:flex-shrink p-2 rounded-full cursor-pointer bg-primary" />
                </DialogTrigger>
                <DialogContent className="max-w-[90vw] sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Attach an image 😉 (spicy?)</DialogTitle>
                    <DialogDescription>Upload an image to spice up your conversation!</DialogDescription>
                  </DialogHeader>
                  <div className="flex items-center justify-center w-full border rounded h-40 sm:h-60 overflow-hidden">{image ? <Image height={1080} width={1920} src={URL.createObjectURL(image)} alt="Preview" className="object-contain w-auto h-full" /> : <p className="font-bold uppercase text-primary">No image selected</p>}</div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <Input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        setImage(e.target.files ? e.target.files[0] : null);
                      }}
                      className="text-sm"
                    />
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <Button
                        onClick={() => {
                          setImage(null);
                          fileRef.current!.value = "";
                        }}
                        className="flex-1 sm:flex-none"
                      >
                        Clear
                      </Button>
                      <Button
                        onClick={() => {
                          setDialogOpen(false);
                        }}
                        className="flex-1 sm:flex-none"
                      >
                        Attach
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <SendHorizonal onClick={sendMessage} className="flex-1 md:flex-shrink p-2 rounded-full cursor-pointer bg-primary" />
            </div>
          </div>
        </div>
        <div className="fixed bottom-0  left-0 right-0  h-5 text-center bg-primary text-white rounded md:text-base w-full rounded-0 text-xs">
          You and <span className="font-bold">{partner.name}</span> have been together for <span className="font-bold">{calculateNumberOfDaysTogether(user!.anniversaryDate!)}</span> days.
        </div>
      </div>
      <div className="fixed top-0 right-0 h-6 w-full">
        <Button onClick={() => dispatch(logOutUser())} size="sm" className="h-full rounded-none w-full">
          Sign Out
        </Button>
      </div>
    </>
  );
};

export default Dashboard;
