import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-(--azul-profundo) relative items-center justify-center">
      <div className="flex items-center justify-between w-full">
        {/* botão hamburguer */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex flex-col gap-1"
        >
          <span
            className={`h-0.5 w-6 bg-white transition ${
              open && "rotate-45 translate-y-2"
            }`}
          />
          <span
            className={`h-0.5 w-6 bg-white transition ${open && "opacity-0"}`}
          />
          <span
            className={`h-0.5 w-6 bg-white transition ${
              open && "-rotate-45 -translate-y-2"
            }`}
          />
        </button>
      </div>

      {/* menu */}
      <div
        className={`fixed md:flex top-16 right-0 z-50 h-screen  transform transition-transform duration-300 bg-(--azul-profundo) p-6
          ${open ? "block" : "hidden"}
          md:static md:h-auto md:flex
          `}
      >
        <div className="h-full flex flex-col md:flex-row items-center pt-15 md:pt-0 gap-8">
            <a
          href="#home"
          className="text-2xl hover:text-(--dourado-suave) hover:scale-120 transition"
        >
          Inicio
        </a>

        <a
          href="#about"
          className="text-2xl hover:text-(--dourado-suave) hover:scale-120 transition"
        >
          Sobre
        </a>
        </div>
      </div>
    </nav>
  );
}
