"use client";
import React from 'react';
import './Modal.css';

export default function Modal({ message, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>{message}</p>
        <button onClick={onClose} className="btn-primary">Aceptar</button>
      </div>
    </div>
  );
}
