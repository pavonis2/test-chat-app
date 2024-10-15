import React, { useContext, useEffect, useRef, useState } from "react";
import { IoMdSend } from "react-icons/io";
import { AiOutlinePicture } from "react-icons/ai";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { arrayUnion, doc, Timestamp, updateDoc } from "firebase/firestore";
import { db, storage } from "../firebase";
import { v4 as uuid } from "uuid";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import EmojiPicker from "emoji-picker-react";
import { GrCheckboxSelected } from "react-icons/gr";
import { VscSmiley } from "react-icons/vsc";
import imageCompression from "browser-image-compression";

const Input = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [err, setErr] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);
  const [open, setOpen] = useState(false);

  // Reference to the dropdown
  const emojiRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSend = async () => {
    try {
      let compressedImg = img;

      if (img) {
        const options = {
          maxSizeMB: 0.01, 
          maxWidthOrHeight: 1920, 
          useWebWorker: true,
        };

        compressedImg = await imageCompression(img, options);

        const date = new Date().getTime();
        const storageRef = ref(storage, `${uuid() + date}`);
        await uploadBytesResumable(storageRef, compressedImg);

        const downloadURL = await getDownloadURL(storageRef);

        await updateDoc(doc(db, "chats", data.chatId), {
          messages: arrayUnion({
            id: uuid(),
            text,
            senderId: currentUser.uid,
            date: Timestamp.now(),
            img: downloadURL,
          }),
        });
      } else {
        // No image, just send text
        await updateDoc(doc(db, "chats", data.chatId), {
          messages: arrayUnion({
            id: uuid(),
            text,
            senderId: currentUser.uid,
            date: Timestamp.now(),
            img: "",
          }),
        });
      }

      await updateDoc(doc(db, "userChats", currentUser.uid), {
        [data.chatId + ".lastMessage"]: {
          text,
          isSeen: true,
          senderId: currentUser.uid,
        },
        [data.chatId + ".date"]: Timestamp.now(),
      });

      await updateDoc(doc(db, "userChats", data.user.uid), {
        [data.chatId + ".lastMessage"]: {
          text,
          isSeen: false,
          senderId: currentUser.uid,
        },
        [data.chatId + ".date"]: Timestamp.now(),
      });

      // Reset input fields
      setText("");
      setOpen(false);
      setImg(null);
      setErr(false);
    } catch (error) {
      console.error("Error sending message:", error);
      setErr(true);
      setTimeout(() => {
        setErr(false);
      }, 3000);
    }
  };

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
  };

  return (
    <div className="input">
      {img ? (
        <input type="text" disabled />
      ) : (
        <input
          type="text"
          placeholder="Type something..."
          onChange={(e) => setText(e.target.value)}
          value={text}
        />
      )}
      <div className="send">
        <input
          type="file"
          id="file"
          accept="image/*"
          onChange={(e) => setImg(e.target.files[0])}
        />
        <label htmlFor="file">
          {img ? (
            <GrCheckboxSelected size={24} color="green" className="button" />
          ) : (
            <AiOutlinePicture size={24} className="button" />
          )}
        </label>
        <div className="emoji">
          {!img && (
            <VscSmiley size={24} className="button" onClick={() => setOpen((prev) => !prev)} />
          )}
          <div className="picker" ref={emojiRef}>
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        {(text.length > 0 || img) && (
          <IoMdSend className="button" onClick={handleSend} size={24} />
        )}
      </div>
      {err && (
        <div className="error">
          <p>Error sending message. Please try again.</p>
        </div>
      )}
    </div>
  );
};

export default Input;