/* import React, { useState, useEffect, useContext } from 'react'
import Cam from '../img/cam.png'
import Add from '../img/add.png'
import More from '../img/more.png'
import Messages from './Messages'
import Input from './Input'
import { ChatContext } from "../context/ChatContext"
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'

const Chat = () => {
  const { data } = useContext(ChatContext);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const docRef = doc(db, "users", data.user.uid);
      const docSnap = await getDoc(docRef);
      const isUserOnline = docSnap.data().isOnline;
      setIsOnline(isUserOnline);
    };

    checkStatus();
  }, [data.user.uid]);

  return (
    <div className="chat">
      <div className="chatInfo">
        <div style={{display:"flex", alignItems:"center", justifyContent: "space-between", minWidth:"80px"}}>
          <img className='profile' src={data.user?.photoURL} alt="" />
          <div style={{display:"flex", flexDirection:"column", justifyContent:"space-between"}}>
            <span>{data.user?.displayName}</span>
            <span style={{color: '#aeb0af', fontSize:"12px"}}>
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
        <div className="chatIcons">
          <img src={Cam} alt="" />
          <img src={Add} alt="" />
          <img src={More} alt="" />
        </div>
      </div>
      <Messages />
      <Input />
    </div>
  );
};

export default Chat; */
import React, { useState, useEffect, useContext } from 'react'
import Cam from '../img/cam.png'
import Add from '../img/add.png'
import More from '../img/more.png'
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
    console.log(data)
    return () => {
      // Unsubscribe from the snapshot listener when component unmounts
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
          <div style={{display:"flex", flexDirection:"column", justifyContent:"space-between"}}>
            <span>{data.user?.displayName}</span>
            <span style={{color: '#aeb0af', fontSize:"12px"}}>
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
        <div className="chatIcons">
          <img src={Cam} alt="" />
          <img src={Add} alt="" />
          <img src={More} alt="" />
        </div>
      </div>
      <Messages />
      <Input />
      {/* Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div style={{fontSize:"20px"}}><span style={{fontWeight:"bold"}}>User:</span>  {data.user?.displayName}</div>
            <img src={data.user?.photoURL} alt="" 
              style={{
                height:"100px", 
                width: "100px", 
                borderRadius: "50%",
                objectFit: "cover",
                outline: "2px solid",
              }}
            />
            <div style={{color:"gray"}}>Email: {data.user?.email}</div>
            <div className="close" onClick={toggleModal}>{/* &times; */}close</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;