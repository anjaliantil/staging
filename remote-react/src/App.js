import React from 'react';

const App = () => {
  return (
    <div style={{ padding: '20px', border: '2px solid #61dafb', borderRadius: '8px' }}>
      <h2>React Remote Micro-frontend</h2>
      <p>This is a React application loaded from the remote.</p>
      <div>
        <h3>Features:</h3>
        <ul>
          <li>Built with React 18</li>
          <li>Exposed as Module Federation</li>
          <li>Can be loaded by Angular host</li>
        </ul>
      </div>
    </div>
  );
};

export default App;