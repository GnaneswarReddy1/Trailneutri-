import React, { useState, useEffect } from "react";

const Dashboard = ({ userInfo, onLogout, onUpdateUser }) => {
  const [showAccount, setShowAccount] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // DEBUG: Check what user data you're receiving
  useEffect(() => {
    console.log("🔍 Dashboard received userInfo:", userInfo);
    console.log("🔍 Available user properties:", Object.keys(userInfo || {}));
    
    // Simulate loading completion
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [userInfo]);

  useEffect(() => {
    // Inject responsive styles for mobile hamburger and menu
    const css = `
      /* mobile menu hidden by default on larger screens */
      .mobile-menu { display: none; }
      @media (max-width: 640px) {
        .nav-actions-desktop { display: none !important; }
        .mobile-hamburger { display: inline-block !important; }
        .mobile-menu { position: absolute; right: 0; top: 42px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.5rem; box-shadow: 0 6px 20px rgba(0,0,0,0.1); width: 160px; z-index: 200; }
        .mobile-menu.open { display: block !important; }
      }
    `;

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleAccountClick = () => {
    setShowAccount(!showAccount);
  };

  // Convert height from cm back to feet and inches for display
  const convertHeightToFeetInches = (heightInCm) => {
    if (!heightInCm || heightInCm === "Not specified") return "Not specified";
    
    const totalInches = Math.round(heightInCm / 2.54);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    
    return `${feet}'${inches}"`;
  };

  // Safe user data access - FIXED VERSION
  const getUserUsername = () => {
    if (!userInfo) return "User";
    
    // Check all possible username fields
    const username = userInfo.username || userInfo.Username || userInfo.userName;
    
    if (username && username !== userInfo.email) {
      return username;
    }
    
    // Extract username from email (everything before @)
    if (userInfo.email) {
      return userInfo.email.split('@')[0];
    }
    
    return "User";
  };
  
  const getUserEmail = () => {
    return userInfo?.email || "Not specified";
  };

  const getUserPhone = () => {
    return userInfo?.phone || "Not specified";
  };

  const getUserGender = () => {
    return userInfo?.gender || "Not specified";
  };

  const getUserHeight = () => {
    return userInfo?.height || "Not specified";
  };

  const getUserWeight = () => {
    return userInfo?.weight || "Not specified";
  };

  // Show loading state
  if (isLoading) {
    return (
      <div style={dashboardStyle}>
        <div style={contentStyle}>
          <div style={loadingStyle}>
            <div style={spinnerStyle}></div>
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if no user data
  if (!userInfo) {
    return (
      <div style={dashboardStyle}>
        <div style={contentStyle}>
          <div style={errorStyle}>
            <h2>No User Data Available</h2>
            <p>Please log in again to access your dashboard.</p>
            <button onClick={onLogout} style={logoutButtonStyle}>
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={dashboardStyle}>
      {/* Navigation Header */}
      <nav style={navbarStyle}>
        <div style={navBrandStyle}>
          <span style={navIcon}>🏥</span>
          <h1 style={navTitle}>TrailNeutri+</h1>
        </div>
        {/* Right side container for actions (keeps buttons anchored right) */}
        <div style={rightContainerStyle}>
          {/* Desktop actions (hidden on small screens) */}
          <div className="nav-actions-desktop" style={navActionsStyle}>
            <button
              style={navButtonStyle}
              onClick={handleAccountClick}
            >
              👤 Account
            </button>
            <button style={logoutButtonStyle} onClick={onLogout}>
              🚪 Logout
            </button>
          </div>

          {/* Mobile hamburger (visible on small screens) */}
          <div style={{ position: 'relative' }}>
            <button
              className="mobile-hamburger"
              aria-label={showMobileMenu ? 'Close menu' : 'Open menu'}
              aria-expanded={showMobileMenu}
              onClick={() => setShowMobileMenu(prev => !prev)}
              style={{
                ...navButtonStyle,
                padding: '0.4rem 0.6rem',
                fontSize: '1.25rem',
                display: 'none'
              }}
            >
              ☰
            </button>

            <div className={"mobile-menu" + (showMobileMenu ? ' open' : '')} role="menu">
              <button style={{ ...navButtonStyle, display: 'block', width: '100%', marginBottom: '0.5rem' }} onClick={() => { setShowMobileMenu(false); handleAccountClick(); }}>👤 Account</button>
              <button style={{ ...logoutButtonStyle, display: 'block', width: '100%' }} onClick={() => { setShowMobileMenu(false); onLogout(); }}>🚪 Logout</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={contentStyle}>
        {/* Welcome Section */}
        <div style={welcomeSectionStyle}>
          <div style={welcomeContentStyle}>
            <h1 style={welcomeTitleStyle}>
              Welcome, <span style={highlightStyle}>{getUserUsername()}</span>
            </h1>
            <p style={welcomeSubtitleStyle}>
              Your health journey starts here. Manage your profile and access healthcare services.
            </p>
          </div>
          <div style={welcomeGraphicStyle}>
            <span style={graphicIcon}>💊</span>
          </div>
        </div>

        {/* Account Information Panel */}
        {showAccount && (
          <div style={accountPanelStyle}>
            <div style={panelHeaderStyle}>
              <h2 style={panelTitleStyle}>Patient Information</h2>
              <button 
                style={closeButtonStyle}
                onClick={() => setShowAccount(false)}
              >
                ✕
              </button>
            </div>
            
            <div style={infoGridStyle}>
              <div style={infoCardStyle}>
                <div style={infoIconStyle}>👤</div>
                <div>
                  <h3 style={infoLabelStyle}>Username</h3>
                  <p style={infoValueStyle}>{getUserUsername()}</p>
                </div>
              </div>

              <div style={infoCardStyle}>
                <div style={infoIconStyle}>📧</div>
                <div>
                  <h3 style={infoLabelStyle}>Email</h3>
                  <p style={infoValueStyle}>{getUserEmail()}</p>
                </div>
              </div>

              <div style={infoCardStyle}>
                <div style={infoIconStyle}>📞</div>
                <div>
                  <h3 style={infoLabelStyle}>Phone</h3>
                  <p style={infoValueStyle}>{getUserPhone()}</p>
                </div>
              </div>
              
              <div style={infoCardStyle}>
                <div style={infoIconStyle}>⚧️</div>
                <div>
                  <h3 style={infoLabelStyle}>Gender</h3>
                  <p style={infoValueStyle}>{getUserGender()}</p>
                </div>
              </div>
              
              <div style={infoCardStyle}>
                <div style={infoIconStyle}>📏</div>
                <div>
                  <h3 style={infoLabelStyle}>Height</h3>
                  <p style={infoValueStyle}>
                    {convertHeightToFeetInches(getUserHeight())}
                    {getUserHeight() && getUserHeight() !== "Not specified" && (
                      <span style={secondaryValueStyle}> ({getUserHeight()} cm)</span>
                    )}
                  </p>
                </div>
              </div>
              
              <div style={infoCardStyle}>
                <div style={infoIconStyle}>⚖️</div>
                <div>
                  <h3 style={infoLabelStyle}>Weight</h3>
                  <p style={infoValueStyle}>
                    {getUserWeight()} 
                    {getUserWeight() && getUserWeight() !== "Not specified" && (
                      <span style={secondaryValueStyle}> kg</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div style={actionsGridStyle}>
          <div style={actionCardStyle}>
            <div style={actionIconStyle}>📅</div>
            <h3 style={actionTitleStyle}>Appointments</h3>
            <p style={actionTextStyle}>Schedule your next visit</p>
          </div>
          
          <div style={actionCardStyle}>
            <div style={actionIconStyle}>💊</div>
            <h3 style={actionTitleStyle}>Medications</h3>
            <p style={actionTextStyle}>Manage your prescriptions</p>
          </div>
          
          <div style={actionCardStyle}>
            <div style={actionIconStyle}>📊</div>
            <h3 style={actionTitleStyle}>Health Data</h3>
            <p style={actionTextStyle}>View your health metrics</p>
          </div>
          
          <div style={actionCardStyle}>
            <div style={actionIconStyle}>👨‍⚕️</div>
            <h3 style={actionTitleStyle}>Doctors</h3>
            <p style={actionTextStyle}>Find healthcare providers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles
const dashboardStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
};

const navbarStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem 2rem',
  background: 'white',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  position: 'sticky',
  top: 0,
  zIndex: 100,
};

const navBrandStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const navIcon = {
  fontSize: '2rem',
};

const navTitle = {
  fontSize: '1.5rem',
  fontWeight: '700',
  background: 'linear-gradient(135deg, #00695c, #004d40)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  margin: 0,
};

const navActionsStyle = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'center',
};

const rightContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};

const navButtonStyle = {
  padding: '0.5rem 1rem',
  background: 'linear-gradient(135deg, #00695c, #004d40)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: '500',
  transition: 'all 0.3s ease',
};

const logoutButtonStyle = {
  padding: '0.5rem 1rem',
  background: '#e53e3e',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: '500',
  transition: 'all 0.3s ease',
};

const contentStyle = {
  padding: '2rem',
  maxWidth: '1200px',
  margin: '0 auto',
};

const welcomeSectionStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: 'white',
  padding: '2rem',
  borderRadius: '15px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  marginBottom: '2rem',
  overflow: 'visible',
};

const welcomeContentStyle = {
  flex: 1,
  overflow: 'visible',
};

const welcomeTitleStyle = {
  fontSize: '2.5rem',
  fontWeight: '700',
  color: '#2d3748',
  margin: '0 0 0.5rem 0',
  lineHeight: '1.3',
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
};

const highlightStyle = {
  background: 'linear-gradient(135deg, #00695c, #004d40)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  display: 'inline',
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
};

const welcomeSubtitleStyle = {
  fontSize: '1.1rem',
  color: '#718096',
  margin: 0,
  lineHeight: '1.5',
};

const welcomeGraphicStyle = {
  padding: '1rem',
};

const graphicIcon = {
  fontSize: '4rem',
  opacity: '0.8',
};

const accountPanelStyle = {
  background: 'white',
  borderRadius: '15px',
  padding: '2rem',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  marginBottom: '2rem',
  animation: 'fadeIn 0.3s ease-out',
};

const panelHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1.5rem',
  paddingBottom: '1rem',
  borderBottom: '2px solid #f7fafc',
};

const panelTitleStyle = {
  fontSize: '1.5rem',
  fontWeight: '600',
  color: '#2d3748',
  margin: 0,
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '1.5rem',
  cursor: 'pointer',
  color: '#718096',
  padding: '0.25rem',
  borderRadius: '4px',
  transition: 'all 0.3s ease',
};

const infoGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '1.5rem',
};

const infoCardStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '1.5rem',
  background: '#f7fafc',
  borderRadius: '10px',
  border: '1px solid #e2e8f0',
};

const infoIconStyle = {
  fontSize: '2rem',
  opacity: '0.7',
};

const infoLabelStyle = {
  fontSize: '0.9rem',
  fontWeight: '600',
  color: '#4a5568',
  margin: '0 0 0.25rem 0',
};

const infoValueStyle = {
  fontSize: '1.1rem',
  fontWeight: '500',
  color: '#2d3748',
  margin: 0,
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
};

const secondaryValueStyle = {
  fontSize: '0.9rem',
  color: '#718096',
  fontStyle: 'italic',
};

const actionsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '1.5rem',
};

const actionCardStyle = {
  background: 'white',
  padding: '2rem',
  borderRadius: '15px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  textAlign: 'center',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
};

const actionIconStyle = {
  fontSize: '3rem',
  marginBottom: '1rem',
  opacity: '0.8',
};

const actionTitleStyle = {
  fontSize: '1.2rem',
  fontWeight: '600',
  color: '#2d3748',
  margin: '0 0 0.5rem 0',
};

const actionTextStyle = {
  fontSize: '0.9rem',
  color: '#718096',
  margin: 0,
};

// Loading and Error Styles
const loadingStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4rem',
  background: 'white',
  borderRadius: '15px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
};

const spinnerStyle = {
  width: '40px',
  height: '40px',
  border: '4px solid #f3f3f3',
  borderTop: '4px solid #00695c',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  marginBottom: '1rem',
};

const errorStyle = {
  textAlign: 'center',
  padding: '4rem',
  background: 'white',
  borderRadius: '15px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
};

export default Dashboard;