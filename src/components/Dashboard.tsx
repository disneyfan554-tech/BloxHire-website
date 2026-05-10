import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, updateDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export default function Dashboard({ user }: { user: any }) {
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const qJobs = query(collection(db, 'jobPosts'), where('authorId', '==', user.uid));
    const unsubscribeJobs = onSnapshot(qJobs, (snapshot) => {
      setMyJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'jobPosts');
    });

    const qApps = query(collection(db, 'applications'), where('applicantName', '==', user.displayName));
    const unsubscribeApps = onSnapshot(qApps, (snapshot) => {
      setMyApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'applications');
    });

    return () => { unsubscribeJobs(); unsubscribeApps(); };
  }, [user]);

  const updateJobTitle = async (id: string, title: string) => {
    await updateDoc(doc(db, 'jobPosts', id), { title });
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-[#16181D] border border-slate-700 rounded-2xl">
        <h3 className="text-lg font-bold mb-4">Jobs I've Posted</h3>
        <div className="space-y-4">
          {myJobs.map(job => (
            <div key={job.id} className="flex justify-between items-center p-4 bg-slate-900 rounded-xl">
              <input value={job.title} onChange={(e) => updateJobTitle(job.id, e.target.value)} className="font-bold bg-transparent border-b border-transparent hover:border-slate-500 focus:border-blue-500 transition-all"/>
              <span className="px-2 py-1 bg-slate-800 rounded text-xs">{job.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-[#16181D] border border-slate-700 rounded-2xl">
        <h3 className="text-lg font-bold mb-4">Applications I've Sent</h3>
        <div className="space-y-3">
          {myApplications.map(app => (
            <div key={app.id} className="p-3 bg-slate-900 rounded-xl flex justify-between items-center">
              <div>
                <p className="font-bold">{app.jobId}</p>
                <p className="text-slate-400 text-sm mt-1">{app.proposal}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${app.status === 'pending' ? 'bg-yellow-900 text-yellow-200' : 'bg-emerald-900 text-emerald-200'}`}>{app.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
