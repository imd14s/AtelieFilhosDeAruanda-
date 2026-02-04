import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Homer";
import SearchPage from "./pages/SearchPage";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import AboutPage from "./pages/AboutPage";
import ShopPage from "./pages/ShopPage";
import CheckoutPage from "./pages/CheckoutPage";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[var(--branco-off-white)] flex flex-col font-lato text-[var(--azul-profundo)]">
        <ScrollToTop />
        <Header />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/store" element={<ShopPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />

            {/* Rotas Dinâmicas usando ID do Java */}

            <Route path="/categoria/:slug" element={<CategoryPage />} />
            <Route path="/produto/:id" element={<ProductPage />} />

            {/* Rota 404 */}
            <Route
              path="*"
              element={
                <div className="flex flex-col items-center justify-center py-40 font-playfair px-4 text-center">
                  <h2 className="text-6xl mb-4">404</h2>
                  <p className="font-lato uppercase tracking-[0.3em] text-[#C9A24D] text-sm">
                    Caminho não encontrado no axé.
                  </p>
                  <a href="/" className="mt-8 text-xs uppercase tracking-widest border-b border-[#0f2A44] pb-1">
                    Voltar para o início
                  </a>
                </div>
              }
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
