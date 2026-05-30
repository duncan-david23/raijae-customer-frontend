import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MessageCircle, ChevronDown, ChevronUp, Headphones, FileText, Clock } from 'lucide-react';

const HelpSection = () => {
  const [openFaq, setOpenFaq] = useState(null);

 const faqs = [
  {
    q: 'What products do you sell?',
    a: 'We offer a curated selection of luxury home items, premium home décor, lifestyle accessories, kitchen essentials, and high-quality ice chests designed for both indoor and outdoor use.'
  },
  {
    q: 'How do I place an order?',
    a: 'Browse our products, add your desired items to the cart, and proceed to checkout. Follow the payment steps to complete your purchase.'
  },
  {
    q: 'How can I track my order?',
    a: 'You can track your order directly from the Orders page in your account. Order statuses are updated in real-time so you can monitor your delivery progress.'
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept secure online payments, including cards, mobile money, and other available payment methods displayed during checkout.'
  },
  {
    q: 'Do you offer Cash on Delivery (COD)?',
    a: 'Yes, Cash on Delivery is available for eligible locations. If COD is available for your area, you will see it as a payment option during checkout.'
  },
  {
    q: 'How long does shipping take?',
    a: 'Delivery times vary depending on your location. Most orders are processed within 1–3 business days and delivered shortly after dispatch.'
  },
  {
    q: 'Do you deliver nationwide?',
    a: 'Yes, we deliver to most locations nationwide. Delivery availability and shipping fees are calculated during checkout.'
  },
  {
    q: 'What is your return policy?',
    a: 'We accept returns for eligible products that are unused and in their original condition. Please contact our support team to initiate a return request.'
  },
  {
    q: 'What should I do if I receive a damaged item?',
    a: 'If your order arrives damaged or defective, contact our support team as soon as possible with photos of the item so we can assist with a replacement or resolution.'
  },
  {
    q: 'Can I cancel my order?',
    a: 'Orders can be canceled before they are processed for shipment. Once an order has been dispatched, cancellation may no longer be possible.'
  },
  {
    q: 'Are your products authentic and high quality?',
    a: 'Yes. We carefully source all products from trusted suppliers to ensure excellent quality, durability, and customer satisfaction.'
  },
  {
    q: 'How long do your ice chests keep items cold?',
    a: 'Performance varies by model and usage conditions, but our premium ice chests are designed to provide long-lasting insulation for outdoor activities and travel.'
  },
  {
    q: 'Do you offer discounts and promotions?',
    a: 'Yes. We regularly run special promotions, seasonal sales, and exclusive offers. Check the app frequently for the latest deals.'
  },
  {
    q: 'How can I contact customer support?',
    a: 'You can reach our support team through email, phone, or WhatsApp for assistance with orders and inquiries.'
  }
];



const handleWhatsappChat = () => {
  const phoneNumber = '+233558822969'; // Replace with your support phone number
  const message = encodeURIComponent('Hello, I need assistance with my order.'); // Pre-filled message
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
  window.open(whatsappUrl, '_blank');
}


const handleEmailSupport = () => {
  const email = 'andaratu81@gmail.com';
  window.open(`mailto:${email}`, '_blank');
}

const handleCall = () => {
  const phoneNumber = '+233558822969';
  window.open(`tel:${phoneNumber}`, '_blank');
}

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <div className="mb-6">
        <h2 className="text-2xl font-light tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>Help & Support</h2>
        <p className="text-gray-500 text-sm mt-1">We're here to help</p>
      </div>

      {/* Contact Options */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-5 text-center">
          <div onClick={handleEmailSupport} className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-medium text-gray-900 mb-1">Email Support</h3>
          <p className="text-sm text-gray-500 mb-2">andaratu81@gmail.com</p>
          <p className="text-xs text-gray-400">Response within 24 hours</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5 text-center">
          <div onClick={handleCall} className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-medium text-gray-900 mb-1">Phone Support</h3>
          <p className="text-sm text-gray-500 mb-2">+233 (558) 82 2969</p>
          <p className="text-xs text-gray-400">Mon-Fri, 9AM - 6PM EST</p>
        </div>
      </div>

      {/* Live Chat */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Live Chat Support</h3>
              <p className="text-sm text-gray-500">Chat with our support team instantly</p>
            </div>
          </div>
          <button onClick={handleWhatsappChat} className="px-5 py-2 bg-black text-white rounded-md hover:bg-gray-800 text-sm">
            Start Chat
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-medium text-gray-900">Frequently Asked Questions</h3>
          <p className="text-sm text-gray-500 mt-1">Quick answers to common questions</p>
        </div>
        <div className="divide-y divide-gray-100">
          {faqs.map((faq, index) => (
            <div key={index}>
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full p-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">{faq.q}</span>
                {openFaq === index ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              {openFaq === index && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-5 pb-5">
                  <p className="text-sm text-gray-600">{faq.a}</p>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Resources */}
      {/* <div className="grid md:grid-cols-2 gap-4 mt-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
          <FileText className="w-5 h-5 text-gray-400" />
          <div>
            <p className="font-medium text-gray-900 text-sm">Return Policy</p>
            <p className="text-xs text-gray-500">Learn about our return process</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-gray-400" />
          <div>
            <p className="font-medium text-gray-900 text-sm">Shipping Information</p>
            <p className="text-xs text-gray-500">Delivery times and costs</p>
          </div>
        </div>
      </div> */}
    </motion.div>
  );
};

export default HelpSection;