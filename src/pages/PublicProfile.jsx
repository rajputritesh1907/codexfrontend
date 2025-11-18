import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api_base_url } from '../helper';

const PublicProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMutual, setIsMutual] = useState(false);

  useEffect(()=>{
    if (!id) return;
    fetch(api_base_url + '/api/getProfile', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ userId: id }) })
      .then(r=>r.json()).then(d=>{ if (d.success) setProfile(d.profile); });
    fetch(api_base_url + '/api/getProjects', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ userId: id }) })
      .then(r=>r.json()).then(d=>{ if (d.success) setProjects((d.projects||[]).filter(p=>p.isPublic)); });
    // follow status
    const me = localStorage.getItem('userId');
    if (me) {
      fetch(api_base_url + '/api/follow/status', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ userId: me, otherId: id }) })
        .then(r=>r.json()).then(d=>{ if (d.success) { setIsFollowing(d.following); setIsMutual(d.mutual); } });
    }
  }, [id]);

  const toggleFollow = async () => {
    const me = localStorage.getItem('userId');
    if (!me) return;
    const url = api_base_url + (isFollowing ? '/api/unfollow' : '/api/follow');
    const res = await fetch(url, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ userId: me, otherId: id }) });
    const d = await res.json();
    if (d.success) setIsFollowing(!isFollowing);
  };

  const startChat = async () => {
    const me = localStorage.getItem('userId');
    if (!me) return;
    const res = await fetch(api_base_url + '/chat/start', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ userId: me, friendId: id }) });
    const d = await res.json();
    if (d.success) {
      // if chat.oneOff and oneOffUsed, show message
      if (d.chat.oneOff && d.chat.oneOffUsed) {
        alert('One-off message already used');
      } else {
        // navigate to messages page
        window.location.href = '/messages';
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{profile?.username || 'User'}</h2>
          <p className="text-sm text-dark-300">{profile?.tagline}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btnBlue" onClick={toggleFollow}>{isFollowing ? 'Unfollow' : 'Follow'}</button>
          <button className="btnBlue" onClick={startChat}>{isMutual ? 'Send Message' : 'Send One Message'}</button>
        </div>
      </div>

      <section className="mt-6">
        <h3 className="text-lg font-medium">Portfolio</h3>
        <div className="mt-2">
          {profile?.projectsAndContributions?.personalProjects?.map((p,i)=> (
            <div key={i} className="p-3 border rounded my-2">{p.name} - <a href={p.link} target="_blank" rel="noreferrer">Open</a></div>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h3 className="text-lg font-medium">Public Projects</h3>
        <div className="mt-2">
          {projects.map(pr => (
            <div key={pr._id} className="p-3 border rounded my-2">
              <div className="font-semibold">{pr.title}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PublicProfile;
