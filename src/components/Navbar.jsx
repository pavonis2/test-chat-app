import { signOut } from 'firebase/auth'
import React, { useContext, useState } from 'react'
import { auth, db } from '../firebase'
import { AuthContext } from '../context/AuthContext'
import { FiLogOut } from 'react-icons/fi';
import { doc, updateDoc } from 'firebase/firestore';

const Navbar = () => {
  const {currentUser} = useContext(AuthContext)
  const [showModal, setShowModal] = useState(false);
  const signout = async (auth) => {
    await updateDoc(doc(db, "users", currentUser?.uid), {
      isOnline: false,
    })

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
        <FiLogOut 
          onClick={() => signout(auth)}
          className='button'
        />
        {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div style={{fontSize:"20px", color:"black"}}><span style={{fontWeight:"bold"}}>User:</span>  {currentUser.displayName}</div>
            <img src={currentUser.photoURL} alt=""
              style={{
                height:"100px", 
                width: "100px", 
                borderRadius: "50%",
                objectFit: "cover",
                outline: "2px solid",
              }}
            />
            <div style={{color:"gray"}}>Email: {currentUser.email}</div>
            <div className="close" onClick={toggleModal}>{/* &times; */}close</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Navbar