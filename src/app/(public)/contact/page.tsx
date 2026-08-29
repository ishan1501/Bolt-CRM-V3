export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 text-center">
      <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
      <p className="text-white/70 mb-12 max-w-2xl mx-auto">Have questions about Bolt CRM? Need help with your account or billing? Our support team is here to assist you.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto text-left">
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl">
          <h3 className="font-semibold text-lg mb-2">Email Support</h3>
          <p className="text-white/50 mb-4">We aim to respond to all inquiries within 24 hours.</p>
          <a href="mailto:support@boltcrm.com" className="text-[#ff5b33] font-medium hover:underline">support@boltcrm.com</a>
        </div>
        
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl">
          <h3 className="font-semibold text-lg mb-2">Business Address</h3>
          <p className="text-white/50 leading-relaxed">
            Bolt CRM Technologies<br />
            New Delhi, India<br />
            PIN: 110001
          </p>
        </div>
      </div>
    </div>
  );
}
