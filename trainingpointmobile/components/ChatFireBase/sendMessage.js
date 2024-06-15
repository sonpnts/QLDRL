// sendMessage.js
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../configs/firebase" ;

const sendMessage = async (chatId, senderId, content) => {
  try {
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      senderId,
      content,

      
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error(error);
  }
};

export default sendMessage;
