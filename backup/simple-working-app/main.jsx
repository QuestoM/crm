import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  const [count, setCount] = useState(0);

  return (
    React.createElement('div', { className: 'container' },
      React.createElement('h1', null, 'Simple Working App'),
      React.createElement('p', null, 'This is a minimal React app that must work'),
      React.createElement('p', null, 'Current count: ' + count),
      React.createElement('button', {
        onClick: () = + 1)
      }, 'Increment count'),
      React.createElement('p', null, 'If you see this and the button works, React is working!')
    )
  );
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(React.createElement(App));
