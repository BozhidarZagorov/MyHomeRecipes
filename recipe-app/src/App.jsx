import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Recipes from './pages/Recipes'
import CreateRecipe from './pages/CreateRecipe'
import RecipeDetails from './pages/RecipeDetails'
import EditRecipe from './pages/EditRecipe'
import Footer from './components/Footer'
import Header from './components/Header'
import NotFound from './pages/NotFound'

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/recipes" element={<Recipes />} />
      <Route path="/create" element={<CreateRecipe />} />
      <Route path="/recipes/:id" element={<RecipeDetails />} />
      <Route path="/edit/:id" element={<EditRecipe />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    </main>
    <Footer />
    </div>
  )
}

export default App
