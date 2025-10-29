
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FileText, Scale, ShoppingCart, Shield } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Scale className="text-naaz-green mx-auto mb-4" size={64} />
            <h1 className="text-3xl md:text-4xl font-playfair font-bold text-naaz-green mb-4">Terms of Service</h1>
            <p className="text-gray-700">
              These terms govern your use of Naaz Book Depot's website and services, guided by Islamic principles of fairness and justice.
            </p>
            <p className="text-sm text-gray-500 mt-2">Last updated: January 1, 2024</p>
          </div>

          <div className="space-y-8">
            <section className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-playfair font-bold text-naaz-green mb-4">Acceptance of Terms</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  By accessing and using the Naaz Book Depot website, you accept and agree to be bound by these Terms of Service. 
                  If you do not agree to abide by these terms, please do not use this service.
                </p>
                <div className="bg-naaz-cream p-4 rounded-lg">
                  <p className="font-semibold text-naaz-green mb-2">Islamic Business Ethics</p>
                  <p>Our terms are designed in accordance with Islamic business principles, emphasizing fairness, transparency, and mutual respect.</p>
                </div>
              </div>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <ShoppingCart className="text-naaz-gold mr-3" size={24} />
                <h2 className="text-2xl font-playfair font-bold text-naaz-green">Orders and Payments</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <h3 className="font-semibold text-naaz-green">Order Processing</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>All orders are subject to acceptance and availability</li>
                  <li>We reserve the right to refuse or cancel orders</li>
                  <li>Prices are subject to change without notice</li>
                  <li>Order confirmation will be sent via email</li>
                </ul>

                <h3 className="font-semibold text-naaz-green mt-6">Payment Terms</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Payment is required at the time of order placement</li>
                  <li>We accept major credit cards, debit cards, and digital payments</li>
                  <li>All transactions are processed securely</li>
                  <li>Currency is Indian Rupees (INR) unless otherwise specified</li>
                </ul>

                <h3 className="font-semibold text-naaz-green mt-6">Islamic Payment Principles</h3>
                <div className="bg-naaz-cream p-4 rounded-lg">
                  <ul className="space-y-2">
                    <li>• No interest-based transactions (Riba-free)</li>
                    <li>• Transparent pricing with no hidden charges</li>
                    <li>• Honest representation of products and services</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <Shield className="text-naaz-gold mr-3" size={24} />
                <h2 className="text-2xl font-playfair font-bold text-naaz-green">Shipping and Delivery</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <h3 className="font-semibold text-naaz-green">Shipping Policy</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Standard shipping within India: 3-5 business days</li>
                  <li>Express shipping: 1-2 business days (additional charges apply)</li>
                  <li>International shipping: 7-14 business days</li>
                  <li>Shipping costs calculated at checkout</li>
                  <li>Free shipping on orders above ₹999</li>
                </ul>

                <h3 className="font-semibold text-naaz-green mt-6">Delivery Terms</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Delivery attempts made during business hours</li>
                  <li>Signature required for high-value items</li>
                  <li>Customer responsible for providing accurate delivery address</li>
                  <li>Risk of loss transfers upon delivery</li>
                </ul>
              </div>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-playfair font-bold text-naaz-green mb-4">Returns and Refunds</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="font-semibold text-naaz-green">Return Policy</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Returns accepted within 14 days of delivery</li>
                  <li>Items must be in original condition and packaging</li>
                  <li>Customer responsible for return shipping costs</li>
                  <li>Some items may not be eligible for return</li>
                </ul>

                <h3 className="font-semibold text-naaz-green mt-6">Refund Process</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Refunds processed within 5-7 business days</li>
                  <li>Original payment method will be credited</li>
                  <li>Shipping charges are non-refundable</li>
                  <li>Damaged or defective items eligible for full refund</li>
                </ul>

                <div className="bg-naaz-cream p-4 rounded-lg mt-4">
                  <p className="font-semibold text-naaz-green mb-2">Adl (Justice) in Returns</p>
                  <p>We strive for fairness in all return and refund situations, considering both customer satisfaction and business sustainability.</p>
                </div>
              </div>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-playfair font-bold text-naaz-green mb-4">Product Information</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="font-semibold text-naaz-green">Content Authenticity</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>All Islamic books verified by qualified scholars</li>
                  <li>Translations reviewed for accuracy</li>
                  <li>Content adheres to authentic Islamic teachings</li>
                  <li>Publisher information clearly displayed</li>
                </ul>

                <h3 className="font-semibold text-naaz-green mt-6">Product Descriptions</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>We strive for accurate product descriptions</li>
                  <li>Colors may vary due to monitor settings</li>
                  <li>Dimensions and weights are approximate</li>
                  <li>Report any discrepancies for immediate correction</li>
                </ul>
              </div>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-playfair font-bold text-naaz-green mb-4">User Conduct</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="font-semibold text-naaz-green">Acceptable Use</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Use website for lawful purposes only</li>
                  <li>Respect Islamic values and cultural sensitivity</li>
                  <li>Do not violate any local, state, or federal laws</li>
                  <li>Respect intellectual property rights</li>
                </ul>

                <h3 className="font-semibold text-naaz-green mt-6">Prohibited Activities</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Uploading harmful or offensive content</li>
                  <li>Attempting to gain unauthorized access</li>
                  <li>Interfering with website functionality</li>
                  <li>Using automated systems without permission</li>
                </ul>
              </div>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-playfair font-bold text-naaz-green mb-4">Intellectual Property</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  All content on this website, including text, graphics, logos, and images, is the property of 
                  Naaz Book Depot or its content suppliers and is protected by intellectual property laws.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Content may not be reproduced without permission</li>
                  <li>Trademarks and logos are protected</li>
                  <li>User-generated content becomes our property</li>
                  <li>We respect third-party intellectual property rights</li>
                </ul>
              </div>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-playfair font-bold text-naaz-green mb-4">Limitation of Liability</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Naaz Book Depot shall not be liable for any indirect, incidental, special, or consequential damages 
                  resulting from the use of our website or services.
                </p>
                <div className="bg-naaz-cream p-4 rounded-lg">
                  <p className="font-semibold text-naaz-green mb-2">Maximum Liability</p>
                  <p>Our total liability shall not exceed the amount paid by you for the specific product or service.</p>
                </div>
              </div>
            </section>

            <section className="bg-naaz-green text-white p-8 rounded-lg">
              <h2 className="text-2xl font-playfair font-bold mb-4">Contact Information</h2>
              <p className="mb-4">
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2">
                <p>📧 Email: legal@naazbookdepot.com</p>
                <p>📞 Phone: +91 98765 43210</p>
                <p>📍 Address: 123 Chowringhee Road, Kolkata, West Bengal 700016</p>
              </div>
              <p className="mt-4 text-sm">
                These terms are effective as of January 1, 2024, and may be updated periodically.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
