import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Homer";
import SearchPage from "./pages/SearchPage";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import AboutPage from "./pages/AboutPage";
import ShopPage from "./pages/ShopPage";
import ScrollToTop from "./components/ScrollToTop";
import { wixClient, getWixTokens } from "./utils/wixClient"; // Importado getWixTokens

function App() {
  // Lógica de Autenticação e Inicialização
  useEffect(() => {
  const initializeApp = async () => {
    try {
      // 1️⃣ Garante identidade do visitor (evita erro 400 / System Error)
      await getWixTokens();

      // 2️⃣ Callback OAuth
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");
      const oauthDataRaw = localStorage.getItem("wix_oauth_data");

      if (code && state && oauthDataRaw) {
        console.log("Finalizando processo de login...");

        const oauthData = JSON.parse(oauthDataRaw);

        // 🔵 Fluxo oficial Wix (SEM validação manual de state)
        const tokens = await wixClient.auth.getMemberTokens(
          code,
          state,
          oauthData
        );

        // 3️⃣ Salva e aplica tokens
        localStorage.setItem("wix_tokens", JSON.stringify(tokens));
        wixClient.auth.setTokens(tokens);
        localStorage.removeItem("wix_oauth_data");

        // 4️⃣ Limpa URL
        window.history.replaceState({}, "", window.location.origin);
      }
    } catch (error) {
      console.error("Erro na inicialização do App:", error);

      // Evita loop de autenticação
      localStorage.removeItem("wix_tokens");
      localStorage.removeItem("wix_oauth_data");
    }
  };

  initializeApp();
}, []);


  return (
    <Router>
      <div className="min-h-screen bg-[#F7F7F4] flex flex-col">
        <ScrollToTop />
        <Header />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/store" element={<ShopPage />} />

            {/* Rotas Dinâmicas */}
            <Route path="/categoria/:slug" element={<CategoryPage />} />
            <Route path="/produto/:slug" element={<ProductPage />} />

            {/* Rota 404 - Not Found */}
            <Route
              path="*"
              element={
                <div className="flex flex-col items-center justify-center py-40 font-playfair bg-[#F7F7F4]">
                  <h2 className="text-6xl text-[#0f2A44] mb-4">404</h2>
                  <p className="font-lato uppercase tracking-[0.3em] text-[#C9A24D] text-sm">
                    Caminho não encontrado no axé.
                  </p>
                  <a
                    href="/"
                    className="mt-8 text-[10px] uppercase tracking-widest border-b border-[#0f2A44] pb-1 text-[#0f2A44]"
                  >
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
