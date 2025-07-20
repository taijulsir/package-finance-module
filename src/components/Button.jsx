import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

export default function Button({ children, className = '', ...props }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/about')}
      className={`my-lib-button text-red-500 cursor-pointer ${className}`} {...props}>
      {children}
      Updated
    </button>

  );
}
