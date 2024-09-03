import React, { useContext, useState, useRef } from 'react';
import { collection, getDoc, getDocs, query, where, doc, setDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../context/AuthContext";
import { AiOutlineSearch, AiOutlineUserAdd } from 'react-icons/ai';
import { IoMdArrowRoundBack } from 'react-icons/io';
import debounce from 'lodash.debounce';
import Chats from '../components/Chats';
import { BeatLoader } from 'react-spinners';

const Search = () => {
  const [username, setUsername] = useState("");
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showChats, setShowChats] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(true);

  const inputRef = useRef(null); // Reference to the input field

  const { currentUser } = useContext(AuthContext);
  const latestSearchText = useRef("");  // Ref to store the latest search text

  const handleSearch = debounce(async () => {
    const searchText = latestSearchText.current.trim();

    if (searchText === "") {
      setUsers([]);
      setLoading(false);
      return;
    }

    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("displayName", ">=", searchText.toLowerCase()),
        where("displayName", "<=", searchText.toLowerCase() + '\uf8ff')
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setUsers([]);
        setLoading(false)
      } else {
        const matchedUsers = [];
        querySnapshot.forEach((doc) => {
          matchedUsers.push(doc.data());
        });
        setUsers(matchedUsers);
        setLoading(false)
      }
    } catch (error) {
      console.error("Error searching for users:", error);
      setLoading(false)
    }
  }, 500); // Debounce with a delay of 500ms

  const handleInputChange = (e) => {
    const searchText = e.target.value;
    setUsername(searchText);
    setSearchTerm(searchText);

    // Update the ref with the latest search text
    latestSearchText.current = searchText;

    if (searchText.trim() === "") {
      setUsers([]);
      return;
    }

    handleSearch();  // Trigger the debounced search function
    setLoading(true)
  };

  const handleSearchIconClick = () => {
    setIsSearchMode(false); // Switch to back arrow icon
    inputRef.current.focus(); // Focus the input field
  };

  const handleBackIconClick = () => {
    setIsSearchMode(true); // Switch back to search icon
    inputRef.current.blur(); // Remove focus from input field
    setUsername(""); // Optionally clear the input when going back to search icon
  };

  const handleSelect = async (user) => {
    const combinedId =
      currentUser.uid > user.uid
        ? currentUser.uid + user.uid
        : user.uid + currentUser.uid;

    try {
      const res = await getDoc(doc(db, "chats", combinedId));

      if (!res.exists()) {
        await setDoc(doc(db, "chats", combinedId), { messages: [] });

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
    } catch (error) {
      console.error("Error selecting user:", error);
    }

    setUsers([]);
    setUsername("");
    setShowChats(true);
    setSearchTerm("");
  };

  return (
    <div className='search'>
      <div className='searchForm2'>
        {isSearchMode ? (
          <AiOutlineSearch className='button' onClick={handleSearchIconClick} />
        ) : (
          <IoMdArrowRoundBack className='button' onClick={handleBackIconClick} />
        )}
        <input
          ref={inputRef} // Attach the ref to the input element
          type="text"
          placeholder='Add user...'
          onChange={handleInputChange}
          value={username}
          onFocus={() => setIsSearchMode(false)} // Switch to back arrow when focused
          onBlur={() => setIsSearchMode(true)}
        />
      </div>
      <div className='chatsTitle'>CHATS</div>
      <Chats 
        searchTerm={searchTerm}
        showChats={showChats}
        setShowChats={setShowChats}
      />
      {searchTerm.length !== 0 && <div className='usersTitle'>USERS</div>}
      {loading ?
        (<div className='loader'><BeatLoader size={8} color={'white'} loading={loading} /></div>):
        (searchTerm.length !== 0 && users.length === 0) && 
          <div className='noUsers'>No users found</div>
      }
      {users.length > 0 && (
        <div className="userList">
          {users.map((user) => (
            user.uid !== currentUser.uid && (
              <div key={user.uid} className="userChat newUser">
                <div className='userProfile'>
                  <img src={user.photoURL} alt="" />
                  <div className="userChatInfo">
                    <span>{user.displayName}</span>
                  </div>
                </div>
                <AiOutlineUserAdd className='button' onClick={() => handleSelect(user)} />
              </div>
          )))}
        </div>
      )}
    </div>
  );
};

export default Search;