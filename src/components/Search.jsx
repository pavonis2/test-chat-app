/* import React, { useContext, useState } from 'react'
import { collection, getDoc, getDocs, query, where, doc, setDoc, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import {db} from "../firebase"
import {AuthContext} from "../context/AuthContext"
import { AiOutlineSearch } from 'react-icons/ai';

const Search = () => {
  const [username, setUsername] = useState("")
  const [user, setUser] = useState(null)
  const [err, setErr] = useState(false)

  const {currentUser} = useContext(AuthContext)

  const handleSearch = async () => {
    const q = query(
      collection(db, "users"),
      where("displayName", "==", username.toLocaleLowerCase())
    );
    try {
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        // No user found
        setErr(true);
        setUser(null); // Clear any previously found user
        setTimeout(() => setErr(false), 3000);
      } else {
        // User found
        querySnapshot.forEach((doc) => {
          setUser(doc.data());
        });
        setErr(false); // Reset error state
      }
    } catch (error) {
      // Error occurred during query execution
      setErr(true);
      setUser(null); // Clear any previously found user
      console.error("Error searching for user:", error);
    }
  };

  const handleKey = (e) => {
    e.code === "Enter" && handleSearch();
  }

  const handleSelect = async () => {
    //check whether the group(chats in firestore) exists, if not create
    const combinedId =
      currentUser.uid > user.uid
        ? currentUser.uid + user.uid
        : user.uid + currentUser.uid;

        try {
          const res = await getDoc(doc(db, "chats", combinedId));

          if (!res.exists()) {
            //create a chat in chats collection
            await setDoc(doc(db, "chats", combinedId), { messages: [] }); 

            //create user chats
            await updateDoc(doc(db, "userChats", currentUser.uid), {
              [combinedId + ".userInfo"]: {
                uid: user.uid,
                displayName: user.displayName,
                photoURL: user.photoURL,
                isOnline: user.isOnline,
                email: user.email,
              },
              [combinedId + ".date"]: Timestamp.now(),
            });  
            
            const docRef = doc(db, "users", currentUser.uid);
            const docSnap = await getDoc(docRef);
            // return docSnap.data();

            await updateDoc(doc(db, "userChats", user.uid), {
              [combinedId + ".userInfo"]: {
                uid: currentUser.uid,
                displayName: currentUser.displayName,
                photoURL: currentUser.photoURL,
                isOnline: docSnap.data().isOnline,
                email: currentUser.email,
              },
              [combinedId + ".date"]: Timestamp.now(),
            });
          }
        } catch (error) {}
        
        setUser(null);
        setUsername("")
  }


  return (
    <div className='search'>
      <div className="searchForm">
        <AiOutlineSearch color='white'/>
        <input 
          type="text" 
          placeholder='Search a username...' 
          onKeyDown={handleKey} 
          onChange={e=>setUsername(e.target.value)}
          value={username}
          autoFocus
        />
      </div>
      {err && <span className="error-msg">User not found!</span>}
      {user && 
        <div className="userChat" onClick={handleSelect}>
          <img src={user.photoURL} alt="" />
          <div className="userChatInfo">
            <span>{user.displayName}</span>
          </div>
        </div>
      }
    </div>
  )
}

export default Search */

import React, { useContext, useState } from 'react'
import { collection, getDoc, getDocs, query, where, doc, setDoc, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import {db} from "../firebase"
import {AuthContext} from "../context/AuthContext"
import { AiOutlineClose, AiOutlinePlus, AiOutlineSearch, AiOutlineUserAdd } from 'react-icons/ai';

const Search = () => {
  const [username, setUsername] = useState("")
  const [user, setUser] = useState(null)
  const [err, setErr] = useState(false)
  const [addUser, setAddUser] = useState(false)

  const {currentUser} = useContext(AuthContext)

  const handleSearch = async () => {
    const q = query(
      collection(db, "users"),
      where("displayName", "==", username.toLocaleLowerCase())
    );
    try {
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        // No user found
        setErr(true);
        setUser(null); // Clear any previously found user
        setTimeout(() => setErr(false), 3000);
      } else {
        // User found
        querySnapshot.forEach((doc) => {
          setUser(doc.data());
        });
        setErr(false); // Reset error state
      }
    } catch (error) {
      // Error occurred during query execution
      setErr(true);
      setUser(null); // Clear any previously found user
      console.error("Error searching for user:", error);
    }
  };

  const handleKey = (e) => {
    e.code === "Enter" && (handleSearch() && setAddUser(!addUser));
  }

  const handleSelect = async () => {
    //check whether the group(chats in firestore) exists, if not create
    const combinedId =
      currentUser.uid > user.uid
        ? currentUser.uid + user.uid
        : user.uid + currentUser.uid;

        try {
          const res = await getDoc(doc(db, "chats", combinedId));

          if (!res.exists()) {
            //create a chat in chats collection
            await setDoc(doc(db, "chats", combinedId), { messages: [] }); 

            //create user chats
            await updateDoc(doc(db, "userChats", currentUser.uid), {
              [combinedId + ".userInfo"]: {
                uid: user.uid,
                displayName: user.displayName,
                photoURL: user.photoURL,
                isOnline: user.isOnline,
                email: user.email,
              },
              [combinedId + ".date"]: Timestamp.now(),
            });  
            
            const docRef = doc(db, "users", currentUser.uid);
            const docSnap = await getDoc(docRef);
            // return docSnap.data();

            await updateDoc(doc(db, "userChats", user.uid), {
              [combinedId + ".userInfo"]: {
                uid: currentUser.uid,
                displayName: currentUser.displayName,
                photoURL: currentUser.photoURL,
                isOnline: docSnap.data().isOnline,
                email: currentUser.email,
              },
              [combinedId + ".date"]: Timestamp.now(),
            });
          }
        } catch (error) {}
        
        setUser(null);
        setUsername("")
  }


  return (
    <div className='search'>
      {addUser && <div className="searchForm">
        {addUser ? 
          <AiOutlineClose 
            className='button'
            onClick={() => {setAddUser(!addUser)}}
          /> : 
          <AiOutlineSearch 
            color='white'
          />
        }
        <input 
          type="text" 
          placeholder='Search a username...' 
          onKeyDown={handleKey} 
          onChange={e=>setUsername(e.target.value)}
          value={username}
          autoFocus
        />
      </div>}
      {!addUser && 
        <AiOutlineUserAdd 
          className='button' 
          onClick={() => {setAddUser(!addUser)}}
          style={{marginTop:'21px', marginLeft:'10px', marginBottom:'7px'}}
        />
      }
      {err && <span className="error-msg">User not found!</span>}
      {user && 
        <div className="userChat" onClick={handleSelect}>
          <img src={user.photoURL} alt="" />
          <div className="userChatInfo">
            <span>{user.displayName}</span>
          </div>
        </div>
      }
    </div>
  )
}

export default Search