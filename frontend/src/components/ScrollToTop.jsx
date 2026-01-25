import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Rola para o topo de forma instantânea
    window.scrollTo(0, 0);
  }, [pathname]); // Executa sempre que o caminho da URL mudar

  return null;
};

export default ScrollToTop;