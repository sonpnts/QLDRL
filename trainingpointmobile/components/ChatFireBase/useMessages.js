// useMessages.js
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from 'react';
import { db } from "../../configs/firebase";

export const useMessages = (chatId) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messages);
    });

    return () => unsubscribe();
  }, [chatId]);

  return messages;
};

export default useMessages;
