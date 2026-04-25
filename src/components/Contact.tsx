import { motion } from 'motion/react';
import { Mail, Phone, MessageCircle } from 'lucide-react';

export default function Contact() {
  const whatsappNumber = "201551373964";
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir="ltr">
      <div className="bg-surface rounded-[4rem] overflow-hidden relative shadow-2xl border border-white/5">
        <div className="max-w-4xl mx-auto py-20 px-6 text-center">
          <p className="text-white/40 text-lg mb-12 font-light max-w-2xl mx-auto border-b border-white/5 pb-12">
            If you are looking for a dentist with practical experience and a passion for digital development, I would be pleased to connect and discuss how I can contribute to the success of your clinic.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-12 mb-16">
            <a href="tel:+201551373964" className="flex flex-col items-center gap-4 group">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-gold border border-white/10 group-hover:bg-gold group-hover:text-dark transition-all">
                <Phone className="w-7 h-7" />
              </div>
              <div className="text-center">
                <div className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold mb-1 italic">Contact Number</div>
                <div className="text-xl font-bold text-white tracking-widest font-serif">+20 015 5137 3964</div>
              </div>
            </a>

            <a href="mailto:samiali20102001@gmail.com" className="flex flex-col items-center gap-4 group">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-gold border border-white/10 group-hover:bg-gold group-hover:text-dark transition-all">
                <Mail className="w-7 h-7" />
              </div>
              <div className="text-center">
                <div className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold mb-1 italic">Professional Email</div>
                <div className="text-xl font-bold text-white tracking-tight font-serif italic">samiali20102001@gmail.com</div>
              </div>
            </a>
          </div>

          <div className="flex justify-center">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-4 px-10 py-5 bg-[#25D366] text-white rounded-2xl font-bold text-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-2xl shadow-[#25D366]/20 group"
            >
              <MessageCircle className="w-7 h-7 fill-white/20" />
              Chat on WhatsApp
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                →
              </div>
            </a>
          </div>
        </div>
      </div>
      <div className="text-center mt-12 text-white/20 text-[10px] uppercase tracking-[0.5em] font-bold">
        © {new Date().getFullYear()} — Sami Ali
      </div>
    </section>
  );
}
