import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase';
import { Timestamp, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { ChatContext } from '../context/ChatContext';
import { convertedDateTime, truncateString } from './Functions';

const Chats = () => {

  const [chats, setChats] = useState([]);
  const [prevChatId, setPrevChatId] = useState(null);
  const [inside, setInside] = useState(true);

  const {currentUser} = useContext(AuthContext)
  const { dispatch } = useContext(ChatContext);
  const { data } = useContext(ChatContext);

  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
        setChats(doc.data());
      });

      return () => {
        unsub();
      };
    };

    currentUser.uid && getChats();
  }, [currentUser.uid]);

  useEffect(() => {
    //updateChatDate();
    setPrevChatId(data.chatId);
    if(data.chatId !== "null") {
      onSnapshot(doc(db, "chats", data.chatId), (doc) => {
        // setInside(!doc.data().data.chatId.isIn)
        console.log(data.chatId, doc.data()/* [currentUser.uid] */);
      });
    }
    if(prevChatId !== null) {
      onSnapshot(doc(db, "chats", prevChatId), (doc) => {
        // setInside(!doc.data().prevChatId.isIn);
        // console.log(prevChatId , doc.data()[prevChatId]);
      });
    }
  }, [data.chatId]);
  
  const updateChatDate = async () => {
    await updateDoc(doc(db, "chats", data.chatId), {
      // [currentUser.uid + ".isIn"]: Timestamp.now(),
      [currentUser.uid] : inside,
    }).catch(error => {
      console.error("Error updating document:", error);
    });
    if(prevChatId !== null) {
      await updateDoc(doc(db, "chats", prevChatId), {
        // [currentUser.uid + ".isIn"]: Timestamp.now(),
      [currentUser.uid]: inside,
      }).catch(error => {
        console.error("Error updating document:", error);
      });
    }
  };
  
  const handleSelect = (u) => {
    dispatch({ type: "CHANGE_USER", payload: u });
  };

  return (
    <div className='chats'>
      {Object.entries(chats).sort((a,b) => b[1].date-a[1].date).map((chat) => (
        <div 
          className="userChat"  
          key={chat[0]}
          onClick={() => handleSelect(chat[1].userInfo)}
        >
          <img src={chat[1].userInfo.photoURL} alt="" />
          <div className="userChatInfo">
            <span className='name'>{chat[1].userInfo.displayName}</span>
            <span className='time'>({convertedDateTime(chat[1].date?.seconds).time})</span>
            <p>{chat[1].lastMessage?.text && truncateString(chat[1].lastMessage?.text, 30)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Chats