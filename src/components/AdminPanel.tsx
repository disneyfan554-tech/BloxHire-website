import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, deleteDoc, doc, updateDoc, addDoc, serverTimestamp, getDocs, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export default function AdminPanel({ user, setView, setPreSelectedChatId }: { user: any, setView: any, setPreSelectedChatId: any }) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  const messageApplicant = async (app: any) => {
    if (!user || !app.applicantId) return;
    try {
        const q = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid));
        const querySnapshot = await getDocs(q);
        const existingChat = querySnapshot.docs.find(doc => doc.data().participants.includes(app.applicantId));
        
        let chatId = '';
        if (existingChat) {
            chatId = existingChat.id;
        } else {
             const job = jobs.find(j => j.id === app.jobId);
             const jobTitle = job ? job.title : 'Unknown Job';

             const newChat = await addDoc(collection(db, 'chats'), {
                participants: [user.uid, app.applicantId],
                jobId: app.jobId,
                jobTitle: jobTitle,
                updatedAt: serverTimestamp()
            });
            chatId = newChat.id;

            await addDoc(collection(db, `chats/${chatId}/messages`), {
                senderId: app.applicantId,
                text: "Hi! I'm interested in the UI job, here is my portfolio link.",
                createdAt: serverTimestamp()
            });
        }

        setPreSelectedChatId(chatId);
        setView('messages');
    } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, 'chats');
    }
  };

  useEffect(() => {
    const qJobs = query(collection(db, 'jobPosts'));
    const unsubscribeJobs = onSnapshot(qJobs, (snapshot) => {
      setJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'jobPosts');
    });

    const qApps = query(collection(db, 'applications'));
    const unsubscribeApps = onSnapshot(qApps, (snapshot) => {
      setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'applications');
    });

    return () => { unsubscribeJobs(); unsubscribeApps(); };
  }, []);

  const deleteJob = async (id: string) => {
    await deleteDoc(doc(db, 'jobPosts', id));
  };

  const updateJobStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'jobPosts', id), { status });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 bg-[#16181D] border border-slate-700 rounded-2xl">
          <h3 className="text-sm font-bold text-slate-500 uppercase">Total Jobs</h3>
          <p className="text-3xl font-mono text-blue-400">{jobs.length}</p>
        </div>
        <div className="p-6 bg-[#16181D] border border-slate-700 rounded-2xl">
          <h3 className="text-sm font-bold text-slate-500 uppercase">Total Applications</h3>
          <p className="text-3xl font-mono text-emerald-400">{applications.length}</p>
        </div>
      </div>

      <div className="p-6 bg-[#16181D] border border-slate-700 rounded-2xl">
        <h3 className="text-lg font-bold mb-4">Active Jobs</h3>
        <div className="space-y-4">
          {jobs.map(job => (
            <div key={job.id} className="flex justify-between items-center p-4 bg-slate-900 rounded-xl">
              <div>
                <h4 className="font-bold">{job.title}</h4>
                <p className="text-sm text-slate-400">{job.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateJobStatus(job.id, job.status === 'open' ? 'closed' : 'open')} className="px-3 py-1 bg-slate-700 rounded-lg text-xs">{job.status === 'open' ? 'Close' : 'Open'}</button>
                <button onClick={() => deleteJob(job.id)} className="px-3 py-1 bg-red-600 rounded-lg text-xs">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-[#16181D] border border-slate-700 rounded-2xl">
        <h3 className="text-lg font-bold mb-4">Application Log</h3>
        <div className="space-y-3">
          {applications.map(app => (
            <div key={app.id} className="p-3 bg-slate-900 rounded-xl">
              <p className="font-bold">{app.applicantName} <span className='text-slate-500 text-sm'>applied to</span> {app.jobId}</p>
              <p className="text-slate-400 text-sm mt-1">{app.proposal}</p>
              {app.portfolioLink && (
                  <a href={app.portfolioLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm mt-1 block hover:underline">View Portfolio</a>
              )}
              <button onClick={() => messageApplicant(app)} className="mt-2 px-3 py-1 bg-blue-600 rounded-lg text-xs">Message Applicant</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
