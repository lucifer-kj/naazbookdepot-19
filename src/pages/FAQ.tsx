
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';

const FAQ = () => {
  const faqs = [
    {
      category: "Orders & Shipping",
      questions: [
        {
          question: "How long does shipping take?",
          answer: "Standard shipping within India takes 3-5 business days. Express shipping is available for 1-2 business days delivery. International shipping typically takes 7-14 business days depending on the destination country."
        },
        {
          question: "Do you ship internationally?",
          answer: "Yes, we ship to most countries worldwide. Shipping costs and delivery times vary based on location. Please check our shipping policy for more details."
        },
        {
          question: "How can I track my order?",
          answer: "Once your order is shipped, you will receive a tracking number via email. You can use this tracking number on our website or the courier's website to track your package."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept credit cards (Visa, Mastercard), debit cards, PayPal, UPI payments, and bank transfers. All payments are processed securely."
        }
      ]
    },
    {
      category: "Returns & Refunds",
      questions: [
        {
          question: "What is your return policy?",
          answer: "We accept returns within 14 days of delivery for most items. Products must be unused, in their original packaging, and in resalable condition. Please note that certain items like perfumes, if opened, cannot be returned for hygiene reasons."
        },
        {
          question: "How do I initiate a return?",
          answer: "To initiate a return, please contact our customer service team through the Contact Us page or email at returns@naazgroup.com with your order number and reason for return."
        },
        {
          question: "When will I receive my refund?",
          answer: "Once we receive and inspect the returned item, we will process your refund. The amount will be credited back to your original payment method within 5-7 business days."
        }
      ]
    },
    {
      category: "Products",
      questions: [
        {
          question: "Are your perfumes alcohol-free?",
          answer: "Yes, all our perfumes are 100% alcohol-free and comply with Islamic guidelines. They are made using traditional attar methods with natural oils."
        },
        {
          question: "How authentic are the Islamic books you sell?",
          answer: "We source our books from reputable publishers and ensure authenticity of translations. Each book undergoes verification by scholars before being added to our collection."
        },
        {
          question: "Do you provide product care instructions?",
          answer: "Yes, all products come with care instructions. For specific queries about maintaining any product, please contact our customer service team."
        }
      ]
    },
    {
      category: "Account & Orders",
      questions: [
        {
          question: "How do I create an account?",
          answer: "You can create an account by clicking on the 'Account' icon in the top navigation bar and selecting 'Register'. Fill in your details to complete the registration process."
        },
        {
          question: "Can I place an order without creating an account?",
          answer: "Yes, we offer a guest checkout option. However, creating an account offers benefits like order tracking, saved addresses, and faster checkout for future purchases."
        },
        {
          question: "How can I check my order history?",
          answer: "Log in to your account and navigate to the 'Order History' section to view details of all your past orders."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-playfair font-bold text-naaz-green mb-4">Frequently Asked Questions</h1>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Find answers to the most common questions about our products, shipping, returns, and more.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Quick Links */}
            <div className="mb-10 p-6 bg-naaz-cream rounded-lg">
              <h2 className="text-xl font-playfair font-semibold text-naaz-green mb-4">Quick Links</h2>
              <div className="flex flex-wrap gap-3">
                {faqs.map((category, index) => (
                  <a 
                    key={index}
                    href={`#${category.category.toLowerCase().replace(/\s+/g, '-')}`}
                    className="bg-white px-4 py-2 rounded-full shadow-sm text-naaz-green hover:bg-naaz-green hover:text-white transition-colors"
                  >
                    {category.category}
                  </a>
                ))}
              </div>
            </div>
            
            {/* FAQ Categories */}
            {faqs.map((category, categoryIndex) => (
              <div 
                key={categoryIndex} 
                id={category.category.toLowerCase().replace(/\s+/g, '-')}
                className="mb-10 scroll-mt-20"
              >
                <h2 className="text-2xl font-playfair font-bold text-naaz-green mb-6 pb-2 border-b border-gray-200">
                  {category.category}
                </h2>
                
                <div className="space-y-6">
                  {category.questions.map((faq, faqIndex) => (
                    <div key={faqIndex} className="bg-white p-6 rounded-lg shadow-md">
                      <h3 className="text-lg font-playfair font-semibold text-naaz-green mb-3">
                        {faq.question}
                      </h3>
                      <p className="text-gray-700">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Still have questions */}
            <div className="mt-16 bg-naaz-green/10 p-8 rounded-lg text-center">
              <h2 className="text-2xl font-playfair font-bold text-naaz-green mb-3">
                Still Have Questions?
              </h2>
              <p className="text-gray-700 mb-6">
                Can't find what you're looking for? Our customer support team is here to help.
              </p>
              <Link to="/contact" className="gold-button inline-block">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
