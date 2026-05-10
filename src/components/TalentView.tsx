import { useState } from 'react';
import { BadgeCheck } from 'lucide-react';

export default function TalentView() {
  const [searchTerm, setSearchTerm] = useState('');
  const talents = [
    { name: 'Jennifer King', bio: 'Master Builder with a passion for creating immersive Roblox worlds.', skills: ['Blender', 'Terrain'], gallery: [1, 2, 3] },
    { name: 'ExoByte', bio: 'Lead Scripter focused on smooth core gameplay and complex systems.', skills: ['DataStores', 'Raycasting'], gallery: [1, 2, 3] },
    { name: 'PixelPerfect', bio: 'UI Designer creating intuitive and aesthetic game interfaces.', skills: ['UI/UX', 'Figma', 'VectorGraphics'], gallery: [1, 2, 3] },
  ];

  return (
    <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-500 uppercase tracking-widest">Find Talent</h2>
          <input 
              type="text" 
              placeholder="Search talent..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm"
          />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {talents.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))).map((talent, i) => (
          <div key={i} className="p-6 bg-[#16181D] border border-slate-700 rounded-3xl flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800" />
              <div>
                <h3 className="text-xl font-bold flex items-center gap-1">
                    {talent.name}
                    {talent.name === 'Jennifer King' && <BadgeCheck className="w-5 h-5 text-blue-500" />}
                </h3>
                <p className="text-sm text-slate-400">Verified Talent</p>
              </div>
            </div>
            <p className="text-sm text-slate-300">{talent.bio}</p>
            <div className="flex gap-2">
              {talent.skills.map(skill => (
                <span key={skill} className="px-3 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full">{skill}</span>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-auto">
              {[1, 2, 3].map(i => (
                <div key={i} className="aspect-square bg-slate-800 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
