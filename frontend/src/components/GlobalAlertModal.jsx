import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const GlobalAlertModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const handleShowAlert = (e) => {
            setMessage(e.detail);
            setIsOpen(true);
        };

        window.addEventListener("show-alert", handleShowAlert);
        return () => window.removeEventListener("show-alert", handleShowAlert);
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0f2A44]/60 backdrop-blur-sm">
            <div className="bg-[#F7F7F4] w-full max-w-sm overflow-hidden relative shadow-2xl rounded-sm animate-in fade-in zoom-in duration-200">
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-3 right-3 text-[#0f2A44]/40 hover:text-[#0f2A44] transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-8 text-center bg-white flex flex-col items-center">
                    <div className="w-12 h-12 bg-[#0f2A44]/5 flex items-center justify-center rounded-full mb-4">
                        <span className="text-[#C9A24D] text-xl font-serif">!</span>
                    </div>
                    <h2 className="font-playfair text-xl text-[#0f2A44] mb-4">Aviso</h2>
                    <p className="font-lato text-sm text-gray-600 mb-6 leading-relaxed">
                        {message}
                    </p>

                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-full bg-[#0f2A44] text-white py-3 font-lato text-xs uppercase tracking-[0.2em] hover:bg-[#C9A24D] transition-all"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GlobalAlertModal;
