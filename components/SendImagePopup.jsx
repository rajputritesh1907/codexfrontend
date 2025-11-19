import React, { useState, useRef } from 'react';
import { api_base_url } from '../src/helper';

export default function SendImagePopup({ open, onClose }) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file) => {
    setPreview(URL.createObjectURL(file));
    uploadImage(file);
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${api_base_url}/api/upload-image`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    if (res.ok) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div
        style={{
          background: '#fff', padding: 32, borderRadius: 8, minWidth: 300, textAlign: 'center'
        }}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        {/* <h3>Send Image</h3> */}
        <div
          style={{
            border: dragActive ? '2px dashed #007bff' : '2px dashed #ccc',
            padding: 32, marginBottom: 16, cursor: 'pointer'
          }}
          onClick={() => inputRef.current.click()}
        >
          {preview ? <img src={preview} alt="preview" style={{ maxWidth: '100%', maxHeight: 150 }} /> : 'Drag & drop image here or click to select'}
        </div>
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={inputRef}
          onChange={e => {
            if (e.target.files[0]) handleFile(e.target.files[0]);
          }}
        />
        <button onClick={onClose} style={{ marginTop: 8 }}>Cancel</button>
      </div>
    </div>
  );
}
