import React from 'react';

const LoadingSpinner = ({ size = 'large', message = 'Loading...' }) => {
  const sizes = {
    small: { width: '24px', height: '24px' },
    medium: { width: '48px', height: '48px' },
    large: { width: '64px', height: '64px' }
  };

  const spinnerStyle = {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #00695c',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 1rem',
    ...sizes[size]
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  };

  const containerStyle = {
    textAlign: 'center',
  };

  const messageStyle = {
    color: '#00695c',
    fontSize: '1.1rem',
    fontWeight: '500',
    margin: 0,
  };

  // Add the spin animation to the document
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div style={overlayStyle}>
      <div style={containerStyle}>
        <div style={spinnerStyle}></div>
        <p style={messageStyle}>{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;