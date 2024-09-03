import { signOut } from 'firebase/auth'
import React, { useContext, useState } from 'react'
import { auth, db } from '../firebase'
import { AuthContext } from '../context/AuthContext'
import { FiLogOut } from 'react-icons/fi';
import { doc, updateDoc } from 'firebase/firestore';
import { ChatContext } from '../context/ChatContext';

const Navbar = () => {
  const {currentUser} = useContext(AuthContext)
  const [showModal, setShowModal] = useState(false);
  const { dispatch } = useContext(ChatContext); // Access dispatch from ChatContext

  const signout = async (auth) => {
    await updateDoc(doc(db, "users", currentUser?.uid), {
      isOnline: false,
    })
    // Reset the chat data
    dispatch({ type: "RESET_CHAT" });
    signOut(auth);
  }
  
  const toggleModal = () => {
    setShowModal(!showModal);
  };

  return (
    <div className='navbar'>
      <div className='user' onClick={toggleModal}>
        <img src={currentUser.photoURL} alt="" />
        <span>{currentUser.displayName}</span>
      </div>
      <div className='logout' onClick={() => signout(auth)}>
        <FiLogOut size={20}/>
        <span>Logout</span>
      </div>
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className='userName'><span>User:</span>  {currentUser.displayName}</div>
            <img src={currentUser.photoURL} alt=""/>
            <div className='email'>Email: {currentUser.email}</div>
            <div className="close" onClick={toggleModal}>close</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Navbar