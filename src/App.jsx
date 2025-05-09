import { useState } from 'react'
import './App.css'
import Expend from "./components/Expends/Expend"


function App() {

  return (
    <>  
    <h1 style={{margin:0, padding:0, marginBottom:5, fontSize:30}}> Expense Tracker</h1>
    <Expend />
      
    </>
  )
}

export default App
