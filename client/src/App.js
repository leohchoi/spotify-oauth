import React, { useEffect, useState } from 'react'

function App() {
  
  const [backendData, setBackendData] = useState(null)

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
    
  }, [backendData])

  return (
    <div>
      {backendData ?
        backendData.map((ele) => {
          return (
            <p>{ele}</p>
          )
        })
      :
      <p>not found</p>
      }
    </div>
  )
}

export default App