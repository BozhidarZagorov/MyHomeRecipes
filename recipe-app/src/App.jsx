import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Recipes from './pages/Recipes'
import CreateRecipe from './pages/CreateRecipe'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/recipes" element={<Recipes />} />
      <Route path="/create" element={<CreateRecipe />} />
    </Routes>
  )
}

export default App
