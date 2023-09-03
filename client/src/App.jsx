import './App.css'
import Nav from './components/Nav'
import Footer from './components/Footer'
import {BrowserRouter, Routes, Route} from 'react-router-dom'

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path="/" element={<h1>Exercise component</h1>} />
          <Route path="/add" element={<h1>add Exercise component</h1>} />
          <Route path="/edit" element={<h1>edit Exercise component</h1>} />
        </Routes>
      </BrowserRouter>
      <Footer/>
    </div>
  )
}

export default App
