// import React, { useState } from 'react';
// import { MdClose, MdSearch } from 'react-icons/md';
// import { api_base_url } from '../helper';

// const ChatSearchModal = ({ isOpen, onClose, onStartChat }) => {
//   const [query, setQuery] = useState('');
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     if (query.length < 2) return;
//     setLoading(true);
//     setError('');
//     try {
//       const res = await fetch(`${api_base_url}/searchUsers?q=${encodeURIComponent(query)}`);
//       const data = await res.json();
//       if (data.success) {
//         setResults(data.users);
//       } else {
//         setError(data.message || 'No users found');
//         setResults([]);
//       }
//     } catch (err) {
//       setError('Error searching users');
//       setResults([]);
//     }
//     setLoading(false);
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//       <div className="bg-dark-800/95 backdrop-blur-xl border border-dark-600/50 rounded-2xl shadow-2xl max-w-md w-full">
//         <div className="flex items-center justify-between p-4 border-b border-dark-600/50">
//           <h2 className="text-lg font-bold flex items-center gap-2"><MdSearch /> Find a Friend</h2>
//           <button onClick={onClose} className="p-2 rounded-lg hover:bg-dark-700/50 transition-colors duration-200">
//             <MdClose className="text-xl" />
//           </button>
//         </div>
//         <form onSubmit={handleSearch} className="p-4 flex gap-2">
//           <input
//             type="text"
//             className="flex-1 px-3 py-2 rounded-lg bg-dark-700 text-white border border-dark-600 focus:outline-none"
//             placeholder="Search username..."
//             value={query}
//             onChange={e => setQuery(e.target.value)}
//             minLength={2}
//             autoFocus
//           />
//           <button type="submit" className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium">
//             Search
//           </button>
//         </form>
//         <div className="p-4">
//           {loading && <div className="text-dark-400">Searching...</div>}
//           {error && <div className="text-red-400">{error}</div>}
//           {results.length > 0 && (
//             <ul className="divide-y divide-dark-700">
//               {results.map(user => (
//                 <li key={user._id} className="py-2 flex items-center justify-between">
//                   <div>
//                     <div className="font-medium">{user.username}</div>
//                     <div className="text-dark-400 text-xs">{user.name}</div>
//                   </div>
//                   <button
//                     className="px-3 py-1 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium"
//                     onClick={() => onStartChat(user)}
//                   >
//                     Chat
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatSearchModal; 