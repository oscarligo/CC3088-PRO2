import { BrowserRouter, Routes, Route } from "react-router";
import Inventory from "./pages/Inventory/Inventory";
import NotFound from "./pages/NotFound/NotFound";
import MainLayout from "./layouts/MainLayout/MainLayout";
import { ThemeProvider } from './context/ThemeContext/ThemeContext';
import MovieDetail from "./pages/MovieDetail/MovieDetail";
import TopRatedMovies from "./pages/TopRatedMovies/TopRatedMovies";



function App() {

  return (
    <ThemeProvider >
      <BrowserRouter >
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="movie/:id" element={<MovieDetail />} />
            <Route path="top-rated-movies" element={<TopRatedMovies />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
