import { useState } from 'react' 
import './App.css' 
 
function App() { 
  const [count, setCount] = useState(0) 
 
  return ( 
    <> 
      <div className="app-container"> 
        <h1>CRM System</h1> 
        <div className="card"> 
          <button onClick={() => setCount((count) => count + 1)}> 
            Count is {count} 
          </button> 
          <p>Press the button to test React state</p> 
        </div> 
        <p className="read-the-docs"> 
          Your CRM application is now working properly! 
        </p> 
      </div> 
    </> 
  ) 
} 
 
export default App 
