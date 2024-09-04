import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { ChatContext } from '../context/ChatContext';
import { displayDateOrTime, truncateString } from './Functions';

const Chats = ({searchTerm, showChats}) => {
  const [chats, setChats] = useState([]);
  const {currentUser} = useContext(AuthContext)
  const { dispatch, data } = useContext(ChatContext);

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
    const updateIsSeenStatus = async () => {
      if (data.chatId && data.user && data.user.uid) {
        try {
          // Get the current chat document
          const chatDoc = await getDoc(doc(db, "userChats", currentUser.uid));
          const currentChatData = chatDoc.data();

          // Ensure the `lastMessage` object exists and contains the text field
          const lastMessage = currentChatData[data.chatId]?.lastMessage || {};

          // Update only the `isSeen` field, keeping the existing `text` field
          await updateDoc(doc(db, "userChats", currentUser.uid), {
            [data.chatId + ".lastMessage"]: {
              ...lastMessage,
              isSeen: true,
            },
          });
        } catch (error) {
          console.error("Error updating the document:", error);
        }
      }
    };

    updateIsSeenStatus();
  });
  
  const handleSelect = async(u) => {
    dispatch({ type: "CHANGE_USER", payload: u });
  }; 

  // Filter chats based on the search term
  const filteredChats = Object.entries(chats).filter(([id, chat]) =>
    chat.userInfo.displayName.toLowerCase().startsWith(searchTerm.toLowerCase())
  );

  return (
    <>
      {showChats &&
        <div className='chats'>
          {filteredChats.length === 0 && <div className='nochats'>Add a user to view chats</div>}
          {filteredChats.sort((a,b) => b[1].date-a[1].date).map((chat) => (
            <div 
              className={`userChat ${chat[1].lastMessage?.isSeen === false ? 'unseen' : ''}`}
              key={chat[0]}
              onClick={() => handleSelect(chat[1].userInfo)}
            >
              <img src={chat[1].userInfo.photoURL} alt="" />
              <div className="userChatInfo">
                <div className='userChatInfo_title'>  
                  <span className='name'>{chat[1].userInfo.displayName}</span>
                  <span className='time'>{displayDateOrTime(chat[1].date?.seconds)}</span>
                </div>
                <p>
                  {
                    chat[1].lastMessage && 
                      chat[1].lastMessage.senderId && (
                        chat[1].lastMessage.senderId === currentUser.uid ? 
                          (chat[1].lastMessage?.text ?
                            (truncateString(`You: ${chat[1].lastMessage?.text}`, 30)) :
                            (`You: 📁 Photo`)
                          ) : 
                          (chat[1].lastMessage?.text ?
                            (truncateString(`${chat[1].lastMessage?.text}`, 35)) :
                            (`📁 Photo`)
                          )
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      }
    </>
  )
}

export default Chats 