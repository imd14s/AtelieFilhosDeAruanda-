import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Rola para o topo de forma instantânea
    window.scrollTo(0, 0);
  }, [pathname, search]); // Executa sempre que o caminho ou query da URL mudar

  return null;
};

export default ScrollToTop;