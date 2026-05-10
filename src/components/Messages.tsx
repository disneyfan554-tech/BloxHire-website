import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export default function Messages({ user, preSelectedChatId }: { user: any, preSelectedChatId: string | null }) {
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (preSelectedChatId && chats.length > 0 && !selectedChat) {
        const chat = chats.find(c => c.id === preSelectedChatId);
        if (chat) setSelectedChat(chat);
    }
  }, [chats, preSelectedChatId, selectedChat]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid));
    return onSnapshot(q, (snapshot) => {
      setChats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'chats'));
  }, [user]);

  useEffect(() => {
    if (!selectedChat) return;
    const q = query(collection(db, `chats/${selectedChat.id}/messages`), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'messages'));
  }, [selectedChat]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    await addDoc(collection(db, `chats/${selectedChat.id}/messages`), {
      senderId: user.uid,
      text: newMessage,
      createdAt: serverTimestamp()
    });
    setNewMessage('');
  };

  return (
    <div className="grid grid-cols-3 gap-6 h-[500px]">
      <div className="col-span-1 bg-[#16181D] border border-slate-700 rounded-2xl overflow-y-auto">
        <h3 className="p-4 font-bold border-b border-slate-700">Chats</h3>
        {chats.map(chat => (
          <button key={chat.id} onClick={() => setSelectedChat(chat)} className="w-full p-4 hover:bg-slate-900 text-left border-b border-slate-800">
            {chat.jobTitle || chat.jobId}
          </button>
        ))}
      </div>
      <div className="col-span-2 bg-[#16181D] border border-slate-700 rounded-2xl flex flex-col">
        {selectedChat ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`${msg.senderId === user.uid ? 'text-right' : 'text-left'}`}>
                  <p className={`inline-block p-3 rounded-xl ${msg.senderId === user.uid ? 'bg-blue-600' : 'bg-slate-700'}`}>{msg.text}</p>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-700 flex gap-2">
              <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-3" placeholder="Message..." />
              <button onClick={sendMessage} className="px-6 bg-blue-600 rounded-xl font-bold">Send</button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">Select a chat</div>
        )}
      </div>
    </div>
  );
}
