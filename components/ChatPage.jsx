import React, { useState } from 'react';
import SendImagePopup from './SendImagePopup';

export default function ChatPage() {
  const [popupOpen, setPopupOpen] = useState(false);

  return (
    <div>
      {/* ...existing chat UI... */}
      <button onClick={() => setPopupOpen(true)}>Send Image</button>
      <SendImagePopup open={popupOpen} onClose={() => setPopupOpen(false)} />
      {/* ...existing chat UI... */}
    </div>
  );
}