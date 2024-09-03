import React, { useContext, useEffect, useRef, useState } from 'react';
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';
import { displayDateOrTime } from './Functions';
import { arrayRemove, doc, updateDoc } from "firebase/firestore";
import { db } from '../firebase';
import { RiArrowDropDownLine } from "react-icons/ri";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";

const Message = ({ message, msgId, messages }) => {
  const [err, setErr] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // State to track whether the message is being edited
  const [isEditing, setIsEditing] = useState(false);

  // State to store the new message text during editing
  const [newMessageText, setNewMessageText] = useState(message.text);

  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  // Reference to the dropdown
  const dropdownRef = useRef();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown if "Escape" is pressed
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Function to switch to edit mode
  const handleEditMessage = () => {
    setIsEditing(true);
    setIsDropdownOpen(false); // Close dropdown after clicking "Edit"
  };

  // Function to save the edited message
  const handleSaveMessage = async () => {
    try {
      if (newMessageText) {
        // Update the specific message's text in the messages array
        const updatedMessages = messages.map((m) => 
          m.id === msgId ? { ...m, text: newMessageText, edited: true } : m
        );

        // Update the messages in the Firestore document
        await updateDoc(doc(db, "chats", data.chatId), {
          messages: updatedMessages
        });

        if (messages[messages.length - 1].id === msgId) {
          await updateDoc(doc(db, "userChats", currentUser.uid), {
            [data.chatId + ".lastMessage"]: {
              isSeen: true,
              senderId: currentUser.uid,
              text: newMessageText,
            },
          });
          await updateDoc(doc(db, "userChats", data.user.uid), {
            [data.chatId + ".lastMessage"]: {
              isSeen: false,
              senderId: currentUser.uid,
              text: newMessageText,
            },
          });
        }

        // Exit edit mode after saving
        setIsEditing(false);
      }
    } catch (error) {
      setErr(true);
      console.log(error);

      // Clear the error after 3 seconds
      setTimeout(() => setErr(false), 3000);
    }
  };

  const handleRemoveMessage = async () => {
    console.log('Delete clicked');
    // Handle delete action
    try {
      const chatRef = doc(db, "chats", data.chatId);
      const messageToDelete = messages.find((m) => m.id === msgId);

      if (messageToDelete) {
        await updateDoc(chatRef, {
          messages: arrayRemove(messageToDelete),
        });

        if (messages[messages.length - 1].id === msgId) {
          await updateDoc(doc(db, "userChats", currentUser.uid), {
            [data.chatId + ".lastMessage"]: {
              isSeen: true,
              senderId: currentUser.uid,
              text: "🚫This message was deleted",
            },
          });
          await updateDoc(doc(db, "userChats", data.user.uid), {
            [data.chatId + ".lastMessage"]: {
              isSeen: false,
              senderId: currentUser.uid,
              text: "🚫This message was deleted",
            },
          });
        }
      } else {
        console.log("Message not found");
      }
    } catch (error) {
      setErr(true);
      console.log(error);

      // Clear the error after 3 seconds
      setTimeout(() => setErr(false), 3000);
    }

    setIsDropdownOpen(false);
  };

  return (
    <div className={`message ${message.senderId === currentUser.uid && "owner"}`}>
      <div className="messageInfo">
        <img
          src={message.senderId === currentUser.uid
            ? currentUser.photoURL
            : data.user.photoURL}
          alt=""
        />
        <span>{displayDateOrTime(message.date.seconds)}</span>
      </div>
      <div className="messageContent">
        {message.text && (
          isEditing ? (
            // If in edit mode, render an input field and save button
            <div className='editMode'>
              <input
                type="text"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                autoFocus
              />
              <IoIosCheckmarkCircleOutline onClick={handleSaveMessage} size={34} className='icon' />
            </div>
          ) : (
            // If not in edit mode, render the message text
            <>
              <div className='text'>
                <p>{message.text}{message.edited && <span>Edited</span>}</p>
                <RiArrowDropDownLine onClick={toggleDropdown} className='icon' size={24} />
              </div>
              {err && (
                <div className="error">
                  <p>Error processing request. Please try again.</p>
                </div>
              )}
            </>
          )
        )}
        {message.img &&
          <>
            <div className='image'>
              <img src={message.img} alt="" />
              <RiArrowDropDownLine onClick={toggleDropdown} className='icon' size={24} />
            </div>
            {err && (
              <div className="error">
                <p>Error processing request. Please try again.</p>
              </div>
            )}
          </>
        }
        {isDropdownOpen && (
          <div className="dropdownMenu" ref={dropdownRef}>
            {message.text && (
              <div className="dropdownItem" onClick={handleEditMessage}>Edit</div>
            )}
            <div className="dropdownItem" onClick={handleRemoveMessage}>Delete</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;