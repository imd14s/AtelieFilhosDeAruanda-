import { Link } from "wouter";
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Ateliê Filhos de Aruanda</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Artesanato afro-brasileiro autêntico, criado com amor e respeito às tradições ancestrais.
            </p>
            <div className="flex space-x-3 mt-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/produtos">
                  <a className="text-muted-foreground hover:text-primary transition-colors">
                    Produtos
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/categorias">
                  <a className="text-muted-foreground hover:text-primary transition-colors">
                    Categorias
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/sobre">
                  <a className="text-muted-foreground hover:text-primary transition-colors">
                    Sobre Nós
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/contato">
                  <a className="text-muted-foreground hover:text-primary transition-colors">
                    Contato
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Atendimento</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/minha-conta">
                  <a className="text-muted-foreground hover:text-primary transition-colors">
                    Minha Conta
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/pedidos">
                  <a className="text-muted-foreground hover:text-primary transition-colors">
                    Meus Pedidos
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  <a className="text-muted-foreground hover:text-primary transition-colors">
                    FAQ
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/politica-privacidade">
                  <a className="text-muted-foreground hover:text-primary transition-colors">
                    Política de Privacidade
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contato</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">
                  Rua Exemplo, 123<br />
                  São Paulo, SP
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">(11) 98765-4321</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">contato@atelie.com.br</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Ateliê Filhos de Aruanda. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
