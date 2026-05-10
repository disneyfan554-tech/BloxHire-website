/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from './lib/firebase';
import Dashboard from './components/Dashboard';
import Messages from './components/Messages';
import AdminPanel from './components/AdminPanel';
import TalentView from './components/TalentView';

export default function App() {
  const [view, setView] = useState<'board' | 'admin' | 'talent' | 'dashboard' | 'messages'>('board');
  const [preSelectedChatId, setPreSelectedChatId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [message, setMessage] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [user, setUser] = useState<any>(null);
  const [showPostJobForm, setShowPostJobForm] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', category: 'Scripter', description: '', budget: '' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
    });
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
    } catch (e) {
        console.error(e);
    }
  };

  const handlePostJob = async () => {
    try {
        await addDoc(collection(db, 'jobPosts'), { ...newJob, status: 'open', authorId: user.uid });
        setShowPostJobForm(false);
        setNewJob({ title: '', category: 'Scripter', description: '', budget: '' });
    } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, 'jobPosts');
    }
  };

  const seedJobs = async () => {
    const jobPosts = [
        { title: 'Master Builder', description: 'Job for Jennifer King.', type: 'building', status: 'open', authorId: 'admin' },
        { title: 'UI Designer', description: 'Job for a project.', type: 'building', status: 'open', authorId: 'admin' },
        { title: 'Long-term Scripter', description: 'Job for a simulator.', type: 'scripting', status: 'open', authorId: 'admin' },
    ];
    for (const job of jobPosts) {
        await addDoc(collection(db, 'jobPosts'), job);
    }
    alert('Jobs seeded!');
  };

  useEffect(() => {
    const q = query(collection(db, 'jobPosts'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetchedJobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJobs(fetchedJobs);
      if (fetchedJobs.length === 0) {
        await seedJobs();
      }
    }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'jobPosts');
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-slate-100 p-6 font-sans">
      <header className="flex items-center justify-between p-4 mb-6 bg-[#16181D] border border-slate-800 rounded-2xl">
        <h1 className="text-xl font-bold">BloxHire</h1>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-400">
          <button onClick={() => setView('board')} className={`hover:text-blue-400 ${view === 'board' ? 'text-blue-400' : ''}`}>Job Board</button>
          <button onClick={() => setView('talent')} className={`hover:text-blue-400 ${view === 'talent' ? 'text-blue-400' : ''}`}>Find Talent</button>
          {user && <button onClick={() => setView('dashboard')} className={`hover:text-blue-400 ${view === 'dashboard' ? 'text-blue-400' : ''}`}>My Dashboard</button>}
          {user && <button onClick={() => setView('messages')} className={`hover:text-blue-400 ${view === 'messages' ? 'text-blue-400' : ''}`}>Messages</button>}
          <button onClick={() => setView('admin')} className={`hover:text-blue-400 ${view === 'admin' ? 'text-blue-400' : ''}`}>Admin Panel</button>
          {user ? (
              <div className='flex items-center gap-2'>
                  <span className='text-white'>{user.displayName}</span>
                  <button onClick={() => signOut(auth)} className='px-4 py-2 bg-red-600 rounded-xl text-white'>Logout</button>
              </div>
          ) : (
              <button onClick={handleLogin} className='px-4 py-2 bg-blue-600 rounded-xl text-white'>Login / Sign Up</button>
          )}
        </nav>
      </header>
      
      <main className="grid md:grid-cols-12 gap-4">
        <div className="md:col-span-12 bg-[#16181D] border border-slate-800 rounded-3xl p-6">
          {view === 'board' ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-500 uppercase tracking-widest">Latest Jobs</h2>
                <input 
                    type="text" 
                    placeholder="Search jobs..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm"
                />
                {user && (
                    <button onClick={() => setShowPostJobForm(true)} className="px-6 py-2 bg-green-500 rounded-lg text-white font-bold hover:bg-green-600 transition-all">Post a Job</button>
                )}
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {jobs.filter(job => job.title.toLowerCase().includes(searchTerm.toLowerCase())).map(job => (
                      <button key={job.id} onClick={() => setSelectedJob(job)} className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-left hover:border-blue-500 transition-all flex flex-col justify-between">
                          <div>
                            <h3 className="text-lg font-bold">{job.title}</h3>
                            <p className="text-slate-400 text-sm mt-1">{job.description}</p>
                          </div>
                          <div className="mt-4">
                            <span className="px-2 py-1 bg-slate-800 text-blue-400 text-xs rounded-md">
                                {job.category || job.type || 'General'}
                            </span>
                          </div>
                      </button>
                  ))}
              </div>
            </div>
          ) : view === 'talent' ? (
            <TalentView />
          ) : view === 'dashboard' ? (
            <div>
              <h2 className="text-lg font-bold text-slate-500 uppercase tracking-widest mb-4">My Dashboard</h2>
              <Dashboard user={user} />
            </div>
          ) : view === 'messages' ? (
            <div>
              <h2 className="text-lg font-bold text-slate-500 uppercase tracking-widest mb-4">Messages</h2>
              <Messages user={user} preSelectedChatId={preSelectedChatId} />
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-bold text-slate-500 uppercase tracking-widest mb-4">Admin Dashboard</h2>
              <AdminPanel user={user} setView={setView} setPreSelectedChatId={setPreSelectedChatId} />
            </div>
          )}
        </div>
      </main>

      {showPostJobForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
          <div className="bg-[#16181D] border border-slate-700 p-8 rounded-3xl max-w-lg w-full space-y-4">
              <h2 className="text-2xl font-bold">Post a New Job</h2>
              <input type="text" placeholder="Job Title" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm" />
              <select value={newJob.category} onChange={e => setNewJob({...newJob, category: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm">
                  <option>Scripter</option>
                  <option>Builder</option>
                  <option>UI</option>
              </select>
              <textarea placeholder="Description" value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm"></textarea>
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl p-4">
                  <span className="text-sm font-bold text-slate-500">R$</span>
                  <input type="number" placeholder="Budget (Robux)" value={newJob.budget} onChange={e => setNewJob({...newJob, budget: e.target.value})} className="w-full bg-transparent focus:outline-none text-sm" />
              </div>
              <div className='flex gap-4'>
                  <button onClick={() => setShowPostJobForm(false)} className="flex-1 px-6 py-3 bg-slate-800 rounded-xl font-bold">Cancel</button>
                  <button onClick={handlePostJob} className="flex-1 px-6 py-3 bg-green-500 rounded-xl font-bold text-white hover:bg-green-600 transition-all">Publish Job</button>
              </div>
          </div>
        </div>
      )}

      {selectedJob && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
          <div className="bg-[#16181D] border border-slate-700 p-8 rounded-3xl max-w-lg w-full">
            {showContactForm ? (
              <div>
                <h2 className="text-2xl font-bold mb-4">Contact {selectedJob.title}</h2>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 mb-4 text-sm" placeholder="Write your proposal here..."></textarea>
                <input type="text" value={portfolioLink} onChange={(e) => setPortfolioLink(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 mb-4 text-sm" placeholder="Roblox Portfolio Link..." />
                <div className='flex gap-4'>
                  <button onClick={() => { setShowContactForm(false); setMessage(''); setPortfolioLink('') }} className="flex-1 px-6 py-3 bg-slate-800 rounded-xl font-bold">Cancel</button>
                  <button onClick={async () => {
                    try {
                      await addDoc(collection(db, 'applications'), {
                        jobId: selectedJob.id,
                        applicantName: user?.displayName || 'Anonymous Candidate',
                        applicantId: user?.uid,
                        proposal: message,
                        portfolioLink: portfolioLink,
                        status: 'pending'
                      });
                      alert('Application sent!');
                      setSelectedJob(null);
                      setShowContactForm(false);
                      setMessage('');
                      setPortfolioLink('');
                    } catch (error) {
                      handleFirestoreError(error, OperationType.WRITE, 'applications');
                    }
                  }} className="flex-1 px-6 py-3 bg-blue-600 rounded-xl font-bold text-white hover:bg-blue-700 transition-all">Send Application</button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedJob.title}</h2>
                <p className="text-slate-400 mb-6">{selectedJob.description}</p>
                <div className='flex gap-4'>
                  <button onClick={() => { setSelectedJob(null); setShowContactForm(false); }} className="flex-1 px-6 py-3 bg-slate-800 rounded-xl font-bold">Close</button>
                  <button onClick={() => user ? setShowContactForm(true) : handleLogin()} className="flex-1 px-6 py-3 bg-blue-600 rounded-xl font-bold text-white hover:bg-blue-700 transition-all">Hire Me</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

