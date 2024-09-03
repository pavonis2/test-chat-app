import React, { useState, useEffect, useContext } from 'react'
import Messages from './Messages'
import Input from './Input'
import { ChatContext } from "../context/ChatContext"
import { db } from '../firebase'
import { doc, onSnapshot } from 'firebase/firestore'

const Chat = () => {
  const { data } = useContext(ChatContext);
  const [isOnline, setIsOnline] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const docRef = doc(db, "users", data.user.uid);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      const isUserOnline = docSnap.data().isOnline;
      setIsOnline(isUserOnline);
    });
    
    return () => {
      unsubscribe();
    };
  }, [data.user.uid]);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  return (
    <div className="chat">
      <div className="chatInfo">
        <div className='user'  onClick={toggleModal}>
          <img className='profile' src={data.user?.photoURL} alt=""/>
          <div className='profileInfo'>
            <span>{data.user?.displayName}</span>
            <span className='status'>
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </div>
      <Messages />
      <Input />
      {/* Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className='userName'><span>User:</span>  {data.user?.displayName}</div>
            <img src={data.user?.photoURL} alt="" />
            <div>Email: {data.user?.email}</div>
            <div className="close" onClick={toggleModal}>close</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;