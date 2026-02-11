import React from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';

const ProductionNotice = () => {
    return (
        <div className="bg-gradient-to-r from-[var(--dourado-suave)]/10 to-[var(--azul-profundo)]/5 border-y border-[var(--dourado-suave)]/20">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
                    <div className="flex items-center gap-3">
                        <AlertCircle size={24} className="text-[var(--dourado-suave)] shrink-0" />
                        <div>
                            <p className="font-playfair text-lg text-[var(--azul-profundo)] mb-1">
                                Site em Desenvolvimento
                            </p>
                            <p className="font-lato text-sm text-[var(--azul-profundo)]/70">
                                Nossas vendas estão acontecendo exclusivamente pela{" "}
                                <a
                                    href="https://www.tiktok.com/@atelie_filhos_de_aruanda"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[var(--dourado-suave)] hover:underline inline-flex items-center gap-1 font-semibold"
                                >
                                    TikTok Shop
                                    <ExternalLink size={14} />
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductionNotice;
