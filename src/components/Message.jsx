import React, { useContext, /* useEffect, */ useRef, useState } from 'react'
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';
import { convertedDateTime } from './Functions';
import { doc, updateDoc } from "firebase/firestore";
import { db } from '../firebase';
import { AiFillDelete } from 'react-icons/ai'

const Message = ({message, msgId, messages}) => {
  const [err, setErr] = useState(false)
  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const ref = useRef();

  /* useEffect(() => {
    ref.current?.scrollIntoView({behavior:"smooth"})
  }, [message]) */

  const handleRemoveMessage = async (messageId) => {
    try {
      await updateDoc(doc(db, "chats", data.chatId), {
        messages: messages.filter((m) => m.id !== messageId)
      });
      
    } catch (error) {
      setErr(true);
      console.log(error);
    }
  };

  return (
    <div 
      ref={ref}
      className={`message ${message.senderId === currentUser.uid && "owner"}`}
    >
      <div className="messageInfo">
        <img 
          src={message.senderId === currentUser.uid 
            ? currentUser.photoURL
            : data.user.photoURL} 
          alt="" 
        />
        <span>{convertedDateTime(message.date.seconds).time}</span>
      </div>
      <div className="messageContent">
        {message.text && <p>{message.text}</p>}
        {message.img && <img src={message.img} alt="" />}
        <div className='delTime'>
          {convertedDateTime(message.date.seconds).date}
          <AiFillDelete 
            style={{display : message.senderId === currentUser.uid ? "inline" : "none"}}
            onClick={() => handleRemoveMessage(msgId)}
            className='delChat'
          />
        </div>
      </div>
    </div>
  )
}

export default Message