import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/homePage";
import NewRecipePage from "./pages/newRecipePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/new" element={<NewRecipePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
