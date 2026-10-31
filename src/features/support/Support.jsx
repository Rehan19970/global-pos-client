import { useState } from 'react';
import { HelpCircle, MessageSquare, Phone, Mail, ChevronDown, ChevronUp, Send, BookOpen, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext'; // 🚨 NAYA IMPORT

const Support = () => {
  const { t } = useLanguage(); // 🚨 NAYA HOOK
  const [openFaq, setOpenFaq] = useState(0);

  // 🚨 FAQ Data ko translate karne ke liye hum t() use karenge
  const FAQData = [
    { q: t('faqQ1'), a: t('faqA1') },
    { q: t('faqQ2'), a: t('faqA2') },
    { q: t('faqQ3'), a: t('faqA3') },
  ];

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    toast.success(t('ticketSubmitted'));
    e.target.reset();
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-[#f8fafc]">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <HelpCircle size={32} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('helpSupportTitle')}</h1>
        <p className="text-slate-500">{t('helpSupportDesc')}</p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side */}
        <div className="lg:col-span-2 space-y-8">
          {/* FAQ */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
              <BookOpen className="text-teal-600" /> {t('faqTitle')}
            </h2>
            <div className="space-y-3">
              {FAQData.map((faq, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button 
                    onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                    className="w-full flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 transition text-left"
                  >
                    <span className="font-semibold text-slate-800 text-sm">{faq.q}</span>
                    {openFaq === idx ? <ChevronUp size={18} className="text-teal-600" /> : <ChevronDown size={18} className="text-slate-400" />}
                  </button>
                  {openFaq === idx && (
                    <div className="p-4 bg-white text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
              <MessageSquare className="text-teal-600" /> {t('submitTicket')}
            </h2>
            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('subject')}</label>
                <input type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('describeIssue')}</label>
                <textarea rows="3" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"></textarea>
              </div>
              <button type="submit" className="flex items-center gap-2 bg-[#0f766e] hover:bg-[#115e59] text-white px-6 py-2.5 rounded-xl font-bold transition">
                <Send size={18} /> {t('submit')}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-slate-900 mb-4">{t('contactUs')}</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                <Phone size={18} className="text-blue-600" />
                <div>
                  <p className="text-xs text-slate-500">{t('call')}</p>
                  <p className="font-bold text-slate-800 text-sm">+1 (800) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                <Mail size={18} className="text-orange-600" />
                <div>
                  <p className="text-xs text-slate-500">{t('email')}</p>
                  <p className="font-bold text-slate-800 text-sm">support@globalpos.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#0f766e] to-[#115e59] rounded-2xl p-6 text-white text-center">
            <MessageSquare size={32} className="mx-auto mb-3 opacity-80" />
            <h3 className="font-bold text-lg mb-2">{t('liveChat')}</h3>
            <p className="text-teal-100 text-sm mb-4">{t('liveChatDesc')}</p>
            <button className="w-full bg-white text-[#0f766e] py-2.5 rounded-xl font-bold hover:bg-teal-50 transition flex items-center justify-center gap-2">
              {t('startChat')} <ExternalLink size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;