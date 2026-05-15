import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/homePage";
import NewRecipePage from "./pages/newRecipePage";
import RecipeDetailPage from "./pages/recipeDetailPage";
import EditRecipePage from "./pages/editRecipePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/new" element={<NewRecipePage />} />
        <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        <Route path="/recipes/:id/edit" element={<EditRecipePage />} />,
      </Routes>
    </BrowserRouter>
  );
}

export default App;
