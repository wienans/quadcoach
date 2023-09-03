import './App.css'
import Nav from './components/Nav'
import Footer from './components/Footer'
import SignUp from './components/SignUp'
import PrivateComponent from './components/PrivateComponent'
import AddExercise from './components/AddExercise'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path="/" element={<h1>Exercise component</h1>} />
          <Route path="/signup" element={<SignUp />} />
          {/* <Route element={<PrivateComponent/>}> */}
          <Route path="/add" element={<AddExercise />} />
          <Route path="/edit" element={<h1>edit Exercise component</h1>} />
          {/* </Route> */}
        </Routes>
      </BrowserRouter>
      <Footer />
    </div>
  )
}

export default App
