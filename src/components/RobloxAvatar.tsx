import { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';

interface RobloxAvatarProps {
  username: string;
}

export default function RobloxAvatar({ username }: RobloxAvatarProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchAvatar() {
      setLoading(true);
      setError(false);
      try {
        // Step 1: Find User ID
        const searchResponse = await fetch(`https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(username)}`);
        const searchData = await searchResponse.json();
        
        // Find exact username match
        const user = searchData.data.find((u: any) => u.name.toLowerCase() === username.toLowerCase());
        
        if (!user) {
          throw new Error('User not found');
        }

        // Step 2: Get Avatar Headshot
        const thumbnailResponse = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${user.id}&size=150x150&format=Png&isCircular=true`);
        const thumbnailData = await thumbnailResponse.json();

        if (thumbnailData.data && thumbnailData.data[0]) {
          setImageUrl(thumbnailData.data[0].imageUrl);
        } else {
          throw new Error("Thumbnail not found");
        }
      } catch (err) {
        console.error('Error fetching Roblox avatar:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (username) {
      fetchAvatar();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center">
        <Loader className="w-6 h-6 text-slate-500 animate-spin" />
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-xs text-slate-500">
            ?
        </div>
    );
  }

  return (
    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-700 bg-slate-900">
      <img src={imageUrl} alt={username} className="w-full h-full object-cover" />
    </div>
  );
}
