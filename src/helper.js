import { useState } from "react";

export const toggleClass = (el,className) => {
  let elem = document.querySelector(el);
  elem.classList.toggle(className);
};

export const removeClass = (el,className) => {
  let elem = document.querySelector(el);
  elem.classList.remove(className);
};


export const api_base_url = import.meta.env.PROD 
  ? (import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:3001`)
  : "http://localhost:3001"