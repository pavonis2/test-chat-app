import React, { useContext, useEffect, useRef, useState } from 'react';
import Message from './Message';
import { ChatContext } from '../context/ChatContext';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { BeatLoader } from "react-spinners";

const Messages = () => {
  const [messages, setMessages] = useState([]); // Unified messages state
  const [allMessages, setAllMessages] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const { data } = useContext(ChatContext);
  const messagesContainerRef = useRef(null);

  // Fetch all messages from Firestore and set them in state
  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
      if (doc.exists()) {
        const messagesData = doc.data().messages || [];
        setAllMessages(messagesData);
        
        // Update the last visible message index
        setLastVisible(messagesData.length - 10 > 0 ? messagesData.length - 10 : null);
        setHasMore(messagesData.length > 10);
        setLoading(false);
      } else{
        setLoading(false);
      }
    });

    return () => {
      unSub();
    };
  }, [data.chatId]);

  // Fetch the initial batch of messages when the chat changes
  useEffect(() => {
    const fetchInitialMessages = async () => {
      if (!data.chatId) return;

      const chatDocRef = doc(db, "chats", data.chatId);
      const chatSnapshot = await getDoc(chatDocRef);

      if (chatSnapshot.exists()) {
        const chatData = chatSnapshot.data();
        const allMessages = chatData.messages || [];

        // Get the latest 10 messages
        const latestMessages = allMessages.slice(-10).reverse();
        setMessages(latestMessages);

        // Set the starting point for older messages pagination
        setLastVisible(allMessages.length - 10 > 0 ? allMessages.length - 10 : null);
        setHasMore(allMessages.length > 10);
        setLoading(false);

        // Scroll to the top to show the latest message
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = 0;
        }
      } else {
        setMessages([]);
        setLoading(false);
        console.log("No chat document found");
      }
    };

    // Reset state when switching chats
    setMessages([]);
    setLastVisible(null);
    setHasMore(true);
    setLoading(true);

    fetchInitialMessages();
  }, [data.chatId]);

  // Handle real-time updates for new, edited, or deleted messages
  useEffect(() => {
    if (!data.chatId) return;

    const unSub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
      if (doc.exists()) {
        const chatData = doc.data();
        const allMessages = chatData.messages || [];

        // Update messages with the latest batch of 10 messages in reverse order
        const latestMessages = allMessages.slice(-10).reverse();
        setMessages(latestMessages);

        // Update the last visible message index to maintain consistency in pagination
        setLastVisible(allMessages.length - 10 > 0 ? allMessages.length - 10 : null);
        setHasMore(allMessages.length > 10);
      }
    });

    return () => unSub();
  }, [data.chatId]);

  // Load more messages when scrolling to the bottom
  const loadOlderMessages = async () => {
    if (!data.chatId || !hasMore || lastVisible === null || loading) return;

    setLoading(true);

    const chatDocRef = doc(db, "chats", data.chatId);
    const chatSnapshot = await getDoc(chatDocRef);

    if (chatSnapshot.exists()) {
      const chatData = chatSnapshot.data();
      const allMessages = chatData.messages || [];
      setTimeout(() => {
        const olderMessages = allMessages
          .slice(Math.max(lastVisible - 10, 0), lastVisible)
          .reverse();
  
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages, ...olderMessages].reduce((unique, message) => {
            if (!unique.some((m) => m.id === message.id)) {
              unique.push(message);
            }
            return unique;
          }, []);
  
          return updatedMessages;
        });
  
        const newLastVisible = lastVisible - 10;
        setLastVisible(newLastVisible > 0 ? newLastVisible : null);
        setHasMore(newLastVisible > 0);
        setLoading(false);
      }, 2000);
    }
  };

  // Handle scrolling event to detect when reaching the bottom of the message list
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        loadOlderMessages();
      }
    }
  };

  return (
    <div className="messages" ref={messagesContainerRef} onScroll={handleScroll}>
      {messages.length > 0 ? (
        messages.map((m) => (
          <Message message={m} msgId={m.id} key={m.id} messages={messages} allMessages={allMessages} />
        ))
      ) : (
        !loading && <p>No messages to display</p>
      )}
      {loading && <BeatLoader size={8} color={'#123abc'} loading={loading} />}
    </div>
  );
};

export default Messages;