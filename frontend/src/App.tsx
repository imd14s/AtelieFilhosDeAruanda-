import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import GlobalAlertModal from "./components/GlobalAlertModal";
import { FavoritesProvider } from "./context/FavoritesContext";
import Home from "./pages/Home";
import SearchPage from "./pages/SearchPage";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import AboutPage from "./pages/AboutPage";
import EthicsPage from "./pages/EthicsPage";
import ShopPage from "./pages/ShopPage";
import ContactPage from "./pages/ContactPage";
import ShippingPolicyPage from "./pages/ShippingPolicyPage";
import ReturnsPolicyPage from "./pages/ReturnsPolicyPage";
import FAQPage from "./pages/FAQPage";
import TermsOfUsePage from "./pages/TermsOfUsePage";
import CheckoutPage from "./pages/CheckoutPage";
import ProfilePage from "./pages/ProfilePage";
import OrdersPage from "./pages/OrdersPage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import SavedCardsPage from "./pages/SavedCardsPage";
import ReviewsPage from "./pages/ReviewsPage";
import QuestionsPage from "./pages/QuestionsPage";
import HistoryPage from "./pages/HistoryPage";
import FavoritesPage from "./pages/FavoritesPage";
import BenefitsPage from "./pages/BenefitsPage";
import AddressesPage from "./pages/AddressesPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import AtelieSubscribePage from "./pages/AtelieSubscribePage";
import VerifyNewsletter from "./pages/VerifyNewsletter";
import UnsubscribeNewsletter from "./pages/UnsubscribeNewsletter";
import PasswordResetPage from "./pages/PasswordResetPage";
import UserLayout from "./pages/UserLayout";
import SubscriptionCheckoutPage from "./pages/SubscriptionCheckoutPage";
import SubscriptionDetailPage from "./pages/SubscriptionDetailPage";
import ReviewSubmissionPage from "./pages/ReviewSubmissionPage";
import ScrollToTop from "./components/ScrollToTop";

import { AuthProvider } from "./context/AuthContext";
import { CategoryProvider } from "./context/CategoryContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <CategoryProvider>
          <FavoritesProvider>
            <div className="min-h-screen bg-[var(--branco-off-white)] flex flex-col font-lato text-[var(--azul-profundo)]">
              <ScrollToTop />
              <GlobalAlertModal />
              <Header />

              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/store" element={<ShopPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/ethics" element={<EthicsPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/politicas-de-envio" element={<ShippingPolicyPage />} />
                  <Route path="/trocas-e-devolucoes" element={<ReturnsPolicyPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/termos" element={<TermsOfUsePage />} />
                  <Route path="/contato" element={<ContactPage />} />
                  <Route path="/assinaturas" element={<AtelieSubscribePage />} />
                  <Route path="/assinaturas/:id" element={<SubscriptionDetailPage />} />
                  <Route path="/verify-newsletter" element={<VerifyNewsletter />} />
                  <Route path="/unsubscribe" element={<UnsubscribeNewsletter />} />
                  <Route path="/assinar/:id" element={<SubscriptionCheckoutPage />} />
                  <Route path="/redefinir-senha" element={<PasswordResetPage />} />

                  {/* Rotas Dinâmicas usando ID do Java */}

                  <Route path="/categoria/:slug" element={<CategoryPage />} />
                  <Route path="/avaliar/:token" element={<ReviewSubmissionPage />} />
                  <Route path="/produto/:id" element={<ProductPage />} />

                  {/* Rotas de Conta do Usuário */}
                  <Route path="/perfil" element={<UserLayout />}>
                    <Route index element={<ProfilePage />} />
                    <Route path="compras" element={<OrdersPage />} />
                    <Route path="beneficios" element={<BenefitsPage />} />
                    <Route path="assinaturas" element={<SubscriptionsPage />} />
                    <Route path="cartoes" element={<SavedCardsPage />} />
                    <Route path="opinioes" element={<ReviewsPage />} />
                    <Route path="perguntas" element={<QuestionsPage />} />
                    <Route path="historico" element={<HistoryPage />} />
                    <Route path="favoritos" element={<FavoritesPage />} />
                    <Route path="enderecos" element={<AddressesPage />} />
                    <Route path="compras/:id" element={<OrderDetailPage />} />
                  </Route>

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
          </FavoritesProvider>
        </CategoryProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
