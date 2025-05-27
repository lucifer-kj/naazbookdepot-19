
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Shield, Eye, Lock, FileText } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Shield className="text-naaz-green mx-auto mb-4" size={64} />
            <h1 className="text-3xl md:text-4xl font-playfair font-bold text-naaz-green mb-4">Privacy Policy</h1>
            <p className="text-gray-700">
              At Naaz Book Depot, we are committed to protecting your privacy in accordance with Islamic principles of trust and honesty.
            </p>
            <p className="text-sm text-gray-500 mt-2">Last updated: January 1, 2024</p>
          </div>

          <div className="space-y-8">
            <section className="bg-white p-8 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <Eye className="text-naaz-gold mr-3" size={24} />
                <h2 className="text-2xl font-playfair font-bold text-naaz-green">Information We Collect</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <h3 className="font-semibold text-naaz-green">Personal Information</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Name, email address, and phone number when you create an account</li>
                  <li>Shipping and billing addresses for order processing</li>
                  <li>Payment information (processed securely through our payment partners)</li>
                  <li>Order history and preferences</li>
                </ul>

                <h3 className="font-semibold text-naaz-green mt-6">Automatic Information</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Browser type, device information, and IP address</li>
                  <li>Pages visited and time spent on our website</li>
                  <li>Cookies and similar tracking technologies (with your consent)</li>
                </ul>
              </div>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <Lock className="text-naaz-gold mr-3" size={24} />
                <h2 className="text-2xl font-playfair font-bold text-naaz-green">How We Use Your Information</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>We use your information for the following purposes, always with honesty and transparency:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Processing and fulfilling your orders</li>
                  <li>Providing customer support and responding to inquiries</li>
                  <li>Sending important updates about your orders and account</li>
                  <li>Improving our website and services</li>
                  <li>Personalizing your shopping experience</li>
                  <li>Sending promotional emails (only with your consent)</li>
                  <li>Compliance with legal requirements</li>
                </ul>
              </div>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <Shield className="text-naaz-gold mr-3" size={24} />
                <h2 className="text-2xl font-playfair font-bold text-naaz-green">Islamic Principles in Data Protection</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>Our data protection practices are guided by Islamic values:</p>
                <div className="bg-naaz-cream p-4 rounded-lg">
                  <ul className="space-y-3">
                    <li><strong>Amanah (Trust):</strong> We consider your personal information as a trust (amanah) and protect it accordingly.</li>
                    <li><strong>Sidq (Truthfulness):</strong> We are transparent about how we collect, use, and protect your data.</li>
                    <li><strong>Adl (Justice):</strong> We ensure fair treatment and respect your rights regarding your personal information.</li>
                    <li><strong>Haya (Modesty):</strong> We collect only necessary information and respect your privacy.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-playfair font-bold text-naaz-green mb-4">Information Sharing</h2>
              <div className="space-y-4 text-gray-700">
                <p>We do not sell, trade, or rent your personal information to third parties. We may share information only in these limited circumstances:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>With shipping partners to deliver your orders</li>
                  <li>With payment processors to handle transactions securely</li>
                  <li>With service providers who help us operate our website</li>
                  <li>When required by law or to protect our rights</li>
                  <li>With your explicit consent for specific purposes</li>
                </ul>
              </div>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-playfair font-bold text-naaz-green mb-4">Your Rights</h2>
              <div className="space-y-4 text-gray-700">
                <p>You have the following rights regarding your personal information:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access and review your personal information</li>
                  <li>Correct or update inaccurate information</li>
                  <li>Delete your account and personal data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Request a copy of your data</li>
                  <li>Lodge a complaint about our data practices</li>
                </ul>
              </div>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-playfair font-bold text-naaz-green mb-4">Data Security</h2>
              <div className="space-y-4 text-gray-700">
                <p>We implement appropriate security measures to protect your information:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>SSL encryption for data transmission</li>
                  <li>Secure servers and databases</li>
                  <li>Regular security audits and updates</li>
                  <li>Limited access to personal information</li>
                  <li>Staff training on data protection</li>
                </ul>
              </div>
            </section>

            <section className="bg-naaz-green text-white p-8 rounded-lg">
              <h2 className="text-2xl font-playfair font-bold mb-4">Contact Us</h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2">
                <p>📧 Email: privacy@naazbookdepot.com</p>
                <p>📞 Phone: +91 98765 43210</p>
                <p>📍 Address: 123 Chowringhee Road, Kolkata, West Bengal 700016</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
