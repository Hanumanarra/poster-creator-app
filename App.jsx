

// App.jsx
import { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';

import './index.css';
import Admin from './Admin.jsx'; // This is for poster CREATION

import PosterEditPage from './PosterEditPage.jsx';
import UserPersonalizePage from './UserPersonalizepage.jsx'; // <--- NEW: For viewing/editing a specific admin poster
// import UserPosterPage from './UserPosterPage.jsx'; // <--- You'll also need this for the userUrl

// Make sure to define NOTFOUND or import it if it's a separate component
function NOTFOUND() { return <h1>404 - Page Not Found</h1>; }

function MainPageLayout() {
  const [activeTab, setActiveTab] = useState("admin");
  const navigate = useNavigate();
  const[userPosterUrl,setUserPosterUrl]=useState('');

  const handleGoToAdmin = () => {
    navigate('/admin'); // This goes to the creation page
  };
   const getPosterIdFromAppUrl = (url) => {
    if (!url) return null;
    try {
      const urlObject = new URL(url); // Parses the full URL
      const pathSegments = urlObject.pathname.split('/').filter(segment => segment);

      // Expects URLs like http://<domain>/admin/<ID> or http://<domain>/view/<ID>
      if ((pathSegments[0] === 'admin' || pathSegments[0] === 'view') && pathSegments[1]) {
        return pathSegments[1];
      }
    } catch (e) {
      console.warn("Invalid URL entered for user view:", url, e);
      return null;
    }
    return null;
  };

  const handleGoToUser = () => {
    if (!userPosterUrl.trim()) {
      alert("Please enter a Poster URL.");
      return;
    }
    const posterId = getPosterIdFromAppUrl(userPosterUrl);
    if (posterId) {
      navigate(`/user/personalize/${posterId}`); // Navigate to the new personalization page
    } else {
      alert("Invalid Poster URL format. Please use a valid link to a poster (e.g., an admin or view link).");
    }
  };

 return (
    <main>
      <h1>Choose The Site</h1>
      <div className="uiContainer">
        <div className="tabs">
          <div
            className={activeTab === "admin" ? "tab-active" : "tab"}
            onClick={() => setActiveTab("admin")}
          >
            Admin View
          </div>
          <div
            className={activeTab === "user" ? "tab-active" : "tab"}
            onClick={() => setActiveTab("user")}
          >
            User View
          </div>
        </div>

        <div className={activeTab === "admin" ? "tab-content-active" : "tab-content"}>
          <h2>As Admin Create Poster</h2>
          <p className="description">In Here Admin Can Create Poster As They Own</p>
          <button onClick={handleGoToAdmin} className="adminBtn">
            Go To Admin Panel
          </button>
        </div>

        <div className={activeTab === "user" ? "tab-content-active" : "tab-content"}>
          <h2>As User View Poster</h2>
          <p className="description">
            Enter the URL of a poster (e.g., an admin or view link) to personalize it.
          </p>
          <div className="form-group-user-url"> {/* For styling */}
            <input
              type="url"
              placeholder="ENTER ANY POSTER URL"
              value={userPosterUrl}
              onChange={(e) => setUserPosterUrl(e.target.value)}
              className="poster-url-input" // Add a class for styling
            />
          </div>
          <button onClick={handleGoToUser} className="UserBtn">
            Personalize This Poster
          </button>
        </div>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path='/' element={<MainPageLayout />} />
      <Route path='/admin' element={<Admin />} />
      <Route path='admin/:id' element={<PosterEditPage />} />
      <Route path='/user/personalize/:id' element={<UserPersonalizePage />} /> {/* NEW ROUTE */}
      <Route path='*' element={<NOTFOUND />} />
    </Routes>
  );
}
