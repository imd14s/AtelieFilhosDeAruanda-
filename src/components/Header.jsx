import NavBar from './NavBar.jsx';

export default function Header() {
  return (
    <header className="bg-(--azul-profundo) text-white p-4 flex justify-between items-center">
      <h1 className="text-2xl hover:text-(--dourado-suave) hover:scale-105 transition">
        Ateliê Filhos de Aruanda
      </h1>
      <NavBar />
    </header>
  );
}
