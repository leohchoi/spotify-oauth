import React, { useEffect, useState } from 'react'

function App() {
  
  const [backendData, setBackendData] = useState(null)
  const [token, setToken] = useState(null);

  useEffect(() => {
    const url_params = new URLSearchParams(window.location.search);
    let code = url_params.get('code');
    if (code !== null) {
      const fetchCode = async() => {
        const body = await fetch('http://localhost:8080/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ authCode: code })
        });
        const response = await body.json();
        console.log(response)
        setToken(response.access_token);
      }
      fetchCode();
      window.history.replaceState({}, document.title, '/');
    }
    else {
      console.log('fetch to callback no work')
    }
  }, [])

  useEffect(() => {
    try {
      const fetchData = async () => {
        const response = await fetch ('http://localhost:8080/api')
        const data = await response.json();
        setBackendData(data)
      }
      fetchData();
      console.log(backendData)
    } 
    catch (error) {
      alert(error)
    }
  }, [])

  return (
    <div>
      {backendData ?
        backendData["user1"].map((ele, incrementor) => {
          return (
            <li key={incrementor}>
              {ele}
            </li>
          )
        })
      :
      <p>not found</p>
      }
      <a href='http://localhost:8080/login'>Login</a>
      {/* <button onClick={() => login()}>Login</button> */}
      {token ?
        <p>access token is {token}</p>
        :
        <p>access token is null</p>
      }
    </div>
  )
}

export default App