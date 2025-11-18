import React, { useState } from 'react'
import deleteImg from "../images/delete.png"
import codeImg from "../images/code.png" 
import { useNavigate } from 'react-router-dom';
import { api_base_url } from '../helper';
import { FiTrash2, FiCode, FiCalendar, FiPlay } from 'react-icons/fi';

const GridCard = ({item}) => {
  const [isDeleteModelShow, setIsDeleteModelShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const getLanguageInfo = (language) => {
    const languages = {
      'web': { name: 'Web Development', icon: '🌐', color: 'from-blue-500 to-cyan-500' },
      'python': { name: 'Python', icon: '🐍', color: 'from-green-500 to-emerald-500' },
      'java': { name: 'Java', icon: '☕', color: 'from-orange-500 to-red-500' },
      'cpp': { name: 'C++', icon: '⚡', color: 'from-purple-500 to-pink-500' },
      'c': { name: 'C', icon: '🔧', color: 'from-gray-500 to-slate-500' },
      'nodejs': { name: 'Node.js', icon: '🟢', color: 'from-green-400 to-green-600' },
      'typescript': { name: 'TypeScript', icon: '🔷', color: 'from-blue-600 to-indigo-600' }
    };
    return languages[language] || languages['web'];
  };

  const languageInfo = getLanguageInfo(item.language);

  const deleteProj = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(api_base_url + "/deleteProject", {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        progId: id,
        userId: localStorage.getItem("userId")
      })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsDeleteModelShow(false);
        window.location.reload();
      } else {
        alert(data.message);
        setIsDeleteModelShow(false);
      }
    } catch (error) {
      alert("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="modern-card group cursor-pointer transition-all duration-300 hover:scale-105">
        {/* Card Header */}
        <div onClick={() => navigate(`/editior/${item._id}`)} className="space-y-4">
          {/* Language Badge */}
          <div className="flex items-center justify-between">
            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r ${languageInfo.color} text-white text-xs font-medium`}>
              <span>{languageInfo.icon}</span>
              <span>{languageInfo.name}</span>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <FiPlay className="text-primary-400 text-lg" />
            </div>
          </div>

          {/* Project Icon and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <FiCode className="text-white text-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className='text-lg font-semibold text-white truncate'>{item.title}</h3>
              <p className='text-dark-300 text-sm'>Click to open project</p>
            </div>
          </div>

          {/* Creation Date */}
          <div className="flex items-center space-x-2 text-dark-300 text-sm">
            <FiCalendar className="text-dark-400" />
            <span>Created {new Date(item.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}</span>
          </div>
       </div>

        {/* Delete Button */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsDeleteModelShow(true);
            }}
            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors duration-200"
            title="Delete Project"
          >
            <FiTrash2 className="text-lg" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModelShow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDeleteModelShow(false)}></div>
          <div className="modal-content p-6 max-w-md w-full mx-4">
            <div className="text-center space-y-4">
              {/* Warning Icon */}
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                <FiTrash2 className="text-red-500 text-2xl" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Delete Project</h3>
                <p className="text-dark-300">
                  Are you sure you want to delete <span className="text-white font-medium">"{item.title}"</span>? 
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button 
                  onClick={() => setIsDeleteModelShow(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-white transition-colors duration-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => deleteProj(item._id)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="loading-spinner w-5 h-5"></div>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default GridCard