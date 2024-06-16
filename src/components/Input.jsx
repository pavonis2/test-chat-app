import React, { useContext, useState } from "react";
import { IoMdSend } from "react-icons/io";
import { AiOutlinePicture } from "react-icons/ai";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import {
  arrayUnion,
  doc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../firebase";
import { v4 as uuid } from "uuid";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { GrCheckboxSelected } from 'react-icons/gr';

const Input = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [err, setErr] = useState(false);

  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const handleSend = async () => {
    if (img) {
      
      const date = new Date().getTime();
      const storageRef = ref(storage, `${uuid() + date}`);

      await uploadBytesResumable(storageRef, img).then(() => {
        getDownloadURL(storageRef).then(async (downloadURL) => {
          try {
            await updateDoc(doc(db, "chats", data.chatId), {
              messages: arrayUnion({
                id: uuid(),
                text,
                senderId: currentUser.uid,
                date: Timestamp.now(),
                img: downloadURL,
              }),
            });
          } catch (error) {
            setErr(true);
          }
          });
        }
      );
    } else {
      await updateDoc(doc(db, "chats", data.chatId), {
        messages: arrayUnion({
          id: uuid(),
          text,
          senderId: currentUser.uid,
          date: Timestamp.now(),
          img: ""
        }),
      });
    }

    await updateDoc(doc(db, "userChats", currentUser.uid), {
      [data.chatId + ".lastMessage"]: {
        text,
      },
      [data.chatId + ".date"]: Timestamp.now(),
    });

    await updateDoc(doc(db, "userChats", data.user.uid), {
      [data.chatId + ".lastMessage"]: {
        text,
      },
      [data.chatId + ".date"]: Timestamp.now(),
    });

    setText("");
    setImg(null);
  }

  return (
    <div className='input'>
      <input type="text" placeholder='Type something...' onChange={e=>setText(e.target.value)} value={text}/>
      <div className="send">
        <input type="file" style={{display:"none"}} id='file' accept="image/*" onChange={(e) => setImg(e.target.files[0])}/>
        <label htmlFor='file'>
          {img ? (
              <GrCheckboxSelected size={24} color="green" />
            ) : (
              <AiOutlinePicture size={24} className="button"/>
            )}
        </label>
        {(text.length > 0 || img) && <IoMdSend className="button" onClick={handleSend} size={24}/>}
      </div>
    </div>
  )
}

export default Input