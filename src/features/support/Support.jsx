import { useState } from 'react';
import { HelpCircle, MessageSquare, Phone, Mail, ChevronDown, ChevronUp, Send, BookOpen, ExternalLink, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';

const Support = () => {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState(0);

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
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-[#f8fafc]">
      {/* HEADER */}
      <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
        <div className="w-14 h-14 md:w-16 md:h-16 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
          <HelpCircle size={28} className="md:w-8 md:h-8" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1 md:mb-2">{t('helpSupportTitle')}</h1>
        <p className="text-sm md:text-base text-slate-500">{t('helpSupportDesc')}</p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left Side (FAQ & Ticket) */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          
          {/* FAQ Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2 mb-4 md:mb-6">
              <BookOpen className="text-teal-600 md:w-5 md:h-5" /> {t('faqTitle')}
            </h2>
            <div className="space-y-2 md:space-y-3">
              {FAQData.map((faq, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button 
                    onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                    className="w-full flex justify-between items-center p-3 md:p-4 bg-slate-50 hover:bg-slate-100 transition text-left"
                  >
                    <span className="font-semibold text-slate-800 text-xs md:text-sm pr-2">{faq.q}</span>
                    {openFaq === idx ? <ChevronUp size={16} className="md:w-4.5 md:h-4.5 text-teal-600 shrink-0" /> : <ChevronDown size={16} className="md:w-4.5 md:h-4.5 text-slate-400 shrink-0" />}
                  </button>
                  {openFaq === idx && (
                    <div className="p-3 md:p-4 bg-white text-xs md:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2 mb-4 md:mb-6">
              <MessageSquare className="text-teal-600 md:w-5 md:h-5" /> {t('submitTicket')}
            </h2>
            <form onSubmit={handleTicketSubmit} className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">{t('subject')}</label>
                <input type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 md:px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">{t('describeIssue')}</label>
                <textarea rows="3" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 md:px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 text-sm"></textarea>
              </div>
              <button type="submit" className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#0f766e] hover:bg-[#115e59] text-white px-6 py-2.5 rounded-xl font-bold transition text-sm">
                <Send size={16} className="md:w-4.5 md:h-4.5" /> {t('submit')}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side (Contact Info & Live Chat) */}
        <div className="space-y-4 md:space-y-6">
          
          {/* Owner Contact Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6">
            <h3 className="font-bold text-slate-900 mb-3 md:mb-4 text-sm md:text-base">Developer Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2.5 md:p-3 rounded-xl bg-slate-50">
                <div className="p-1.5 md:p-2 bg-blue-100 text-blue-600 rounded-lg"><User size={16} className="md:w-4.5 md:h-4.5" /></div>
                <div>
                  <p className="text-[10px] md:text-xs text-slate-500">Name</p>
                  <p className="font-bold text-slate-800 text-xs md:text-sm">Rehan Rashid</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 md:p-3 rounded-xl bg-slate-50">
                <div className="p-1.5 md:p-2 bg-teal-100 text-teal-600 rounded-lg"><Phone size={16} className="md:w-4.5 md:h-4.5" /></div>
                <div>
                  <p className="text-[10px] md:text-xs text-slate-500">Phone</p>
                  <p className="font-bold text-slate-800 text-xs md:text-sm">03474052013</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 md:p-3 rounded-xl bg-slate-50">
                <div className="p-1.5 md:p-2 bg-orange-100 text-orange-600 rounded-lg"><Mail size={16} className="md:w-4.5 md:h-4.5" /></div>
                <div className="min-w-0">
                  <p className="text-[10px] md:text-xs text-slate-500">Email</p>
                  <p className="font-bold text-slate-800 text-xs md:text-sm truncate">rehantrader20@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Live Chat Card */}
          <div className="bg-gradient-to-br from-[#0f766e] to-[#115e59] rounded-2xl p-4 md:p-6 text-white text-center">
            <MessageSquare size={28} className="mx-auto mb-2 md:mb-3 opacity-80" />
            <h3 className="font-bold text-base md:text-lg mb-1 md:mb-2">{t('liveChat')}</h3>
            <p className="text-teal-100 text-xs md:text-sm mb-3 md:mb-4">{t('liveChatDesc')}</p>
            <button className="w-full bg-white text-[#0f766e] py-2.5 rounded-xl font-bold hover:bg-teal-50 transition flex items-center justify-center gap-2 text-sm">
              {t('startChat')} <ExternalLink size={14} className="md:w-4 md:h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;