import React, { useEffect, useState } from 'react';
import { api_base_url } from '../helper';
import { FiEdit, FiSave, FiX, FiUpload } from 'react-icons/fi';

const Profile = ({ userId }) => {
  const resolvedUserId = userId || localStorage.getItem('userId');
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    profilePicture: '',
    username: '',
    tagline: '',
    location: '',
    timezone: '',
    socialLinks: {}
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (resolvedUserId) fetchProfile();
  }, [resolvedUserId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
  const res = await fetch(`${api_base_url}/api/getProfile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: resolvedUserId })
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        setForm({
          profilePicture: data.profile?.profilePicture || '',
          username: data.profile?.username || '',
          tagline: data.profile?.tagline || '',
          location: data.profile?.location || '',
          timezone: data.profile?.timezone || '',
          socialLinks: data.profile?.socialLinks || {}
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
  const payload = { userId: resolvedUserId, profile: { ...form } };
      const res = await fetch(`${api_base_url}/createOrUpdateProfile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        setEditing(false);
        setMessage('Profile saved');
      } else {
        setMessage(data.message || 'Error saving');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error saving');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!resolvedUserId) return <div className="p-4">Please login to view profile.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto text-black">
      <h2 className="text-3xl font-bold mb-6 text-center text-indigo-600">Your Profile</h2>

      {loading && <div className="text-center text-gray-500">Loading...</div>}

      {!editing ? (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center gap-6">
            <img src={profile?.profilePicture || '/vite.svg'} alt="avatar" className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500" />
            <div>
              <div className="text-2xl font-semibold text-gray-800">{profile?.username || 'No username'}</div>
              <div className="text-sm text-gray-600 italic">{profile?.tagline || 'No tagline'}</div>
              <div className="text-sm text-gray-500">Joined: {new Date(profile?.joinDate || Date.now()).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-lg text-gray-700">Social Links</h3>
            <div className="text-sm mt-2">
              {profile?.socialLinks?.github && (<div>GitHub: <a href={profile.socialLinks.github} className="text-blue-600 underline">{profile.socialLinks.github}</a></div>)}
              {profile?.socialLinks?.linkedin && (<div>LinkedIn: <a href={profile.socialLinks.linkedin} className="text-blue-600 underline">{profile.socialLinks.linkedin}</a></div>)}
              {profile?.socialLinks?.website && (<div>Website: <a href={profile.socialLinks.website} className="text-blue-600 underline">{profile.socialLinks.website}</a></div>)}
            </div>
          </div>

          <div className="mt-6 text-center">
            <button onClick={() => setEditing(true)} className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition">Edit Profile <FiEdit className="inline ml-2" /></button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="grid grid-cols-1 gap-4">
            <label className="block">
              <span className="text-gray-700">Avatar</span>
              <div className="flex items-center gap-4 mt-2">
                <img src={form.profilePicture || '/vite.svg'} alt="avatar preview" className="w-16 h-16 rounded-full object-cover border" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="p-2 border rounded" />
              </div>
            </label>
            <label className="block">
              <span className="text-gray-700">Username</span>
              <input value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="w-full p-2 border rounded mt-1" />
            </label>
            <label className="block">
              <span className="text-gray-700">Tagline</span>
              <input value={form.tagline} onChange={e => setForm({...form, tagline: e.target.value})} className="w-full p-2 border rounded mt-1" />
            </label>
            <label className="block">
              <span className="text-gray-700">Location</span>
              <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full p-2 border rounded mt-1" />
            </label>
            <label className="block">
              <span className="text-gray-700">Timezone</span>
              <input value={form.timezone} onChange={e => setForm({...form, timezone: e.target.value})} className="w-full p-2 border rounded mt-1" />
            </label>
            <label className="block">
              <span className="text-gray-700">GitHub</span>
              <input value={form.socialLinks?.github || ''} onChange={e => setForm({...form, socialLinks: {...(form.socialLinks||{}), github: e.target.value}})} className="w-full p-2 border rounded mt-1" />
            </label>
            <label className="block">
              <span className="text-gray-700">LinkedIn</span>
              <input value={form.socialLinks?.linkedin || ''} onChange={e => setForm({...form, socialLinks: {...(form.socialLinks||{}), linkedin: e.target.value}})} className="w-full p-2 border rounded mt-1" />
            </label>
            <label className="block">
              <span className="text-gray-700">Website</span>
              <input value={form.socialLinks?.website || ''} onChange={e => setForm({...form, socialLinks: {...(form.socialLinks||{}), website: e.target.value}})} className="w-full p-2 border rounded mt-1" />
            </label>

            <div className="flex gap-4 mt-4 justify-center">
              <button onClick={saveProfile} className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition">Save <FiSave className="inline ml-2" /></button>
              <button onClick={() => setEditing(false)} className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg shadow hover:bg-gray-400 transition">Cancel <FiX className="inline ml-2" /></button>
            </div>
            {message && <div className="text-center text-green-600 mt-2">{message}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
