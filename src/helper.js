import { useState } from "react";

export const toggleClass = (el,className) => {
  let elem = document.querySelector(el);
  elem.classList.toggle(className);
};

export const removeClass = (el,className) => {
  let elem = document.querySelector(el);
  elem.classList.remove(className);
};

// Prefer the new VITE_BACKEND_URL, fall back to VITE_API_URL and sensible defaults
export const API_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || null;

export const api_base_url = (import.meta.env.PROD
  ? (API_URL || import.meta.env.BACKEND_URL)
  :(API_URL || `${window.location.protocol}//${window.location.hostname}:3001`)
);