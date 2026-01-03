// src/portal/components/PortalCard.jsx
import React from 'react';

const PortalCard = ({ title, description, image, color, onClick, disabled }) => {
  return (
    <div className="portal-card-content">
      <div
        className={`portal-card ${disabled ? 'disabled' : ''}`}
        onClick={!disabled ? onClick : undefined}
        style={{
          background: image
            ? `url(${image}) center/cover no-repeat`
            : color || '#ccc'
        }}
      >
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
};

export default PortalCard;
