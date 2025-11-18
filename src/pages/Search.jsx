import React, { useEffect, useState } from 'react';
import { api_base_url } from '../helper';
import { Link, useNavigate } from 'react-router-dom';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [defaults, setDefaults] = useState({ mostSearched: [], mostFollowed: [] });
  const navigate = useNavigate();

  useEffect(() => {
    // load defaults
    fetch(api_base_url + '/search/default')
      .then(r => r.json())
      .then(d => { if (d.success) setDefaults({ mostSearched: d.mostSearched || [], mostFollowed: d.mostFollowed || [] }); })
      .catch(e => console.error(e));
  }, []);

  const doSearch = async () => {
    if (!query || query.length < 2) return;
    try {
      const res = await fetch(api_base_url + '/searchUsers?q=' + encodeURIComponent(query));
      const data = await res.json();
      if (data.success) setResults(data.users || []);
    } catch (e) { console.error(e); }
  };

  const openProfile = (userId) => {
    navigate('/user/' + userId);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">Search users</h2>
      <div className="flex gap-2 mb-4">
        <input className="flex-1 p-2 rounded-lg bg-dark-700/40" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by username" />
        <button className="btnBlue" onClick={doSearch}>Search</button>
      </div>
      {results.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {results.map(u => (
            <div key={u._id} className="p-3 glass rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold">{u.username}</div>
                <div className="text-sm text-dark-300">{u.name}</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="btnBlue" onClick={()=>openProfile(u._id)}>View</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-medium mt-4">Most searched</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
            {defaults.mostSearched.map(p => (
              <div key={p.userId} className="p-3 glass rounded-lg cursor-pointer" onClick={()=>openProfile(p.userId)}>
                <div className="font-semibold">{p.username}</div>
              </div>
            ))}
          </div>
          <h3 className="text-lg font-medium mt-6">Most followed</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
            {defaults.mostFollowed.map(p => (
              <div key={p.userId} className="p-3 glass rounded-lg cursor-pointer" onClick={()=>openProfile(p.userId)}>
                <div className="font-semibold">{p.username}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
