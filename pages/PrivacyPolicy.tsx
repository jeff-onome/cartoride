
import React from 'react';
import { useSiteContent } from '../hooks/useSiteContent';

const PrivacyPolicy: React.FC = () => {
  const { siteContent } = useSiteContent();
  const siteName = siteContent?.siteName || 'AutoSphere';
  const contactEmail = siteContent?.contactInfo?.email || 'contact@autosphere.com';
  const address = siteContent?.contactInfo?.address || '123 Auto Drive, Velocity City, 45678';

  return (
    <div className="bg-background min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">Privacy Policy</h1>
        <div className="bg-secondary p-8 rounded-lg border border-border text-muted-foreground">
          <p className="mb-4 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
          
          <p className="mb-6">
            At {siteName}, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Information We Collect</h2>
          <p className="mb-4">
            We may collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website (such as posting messages in our online forums or entering competitions, contests or giveaways) or otherwise when you contact us.
          </p>
          <p className="mb-4">
            The personal information that we collect depends on the context of your interactions with us and the website, the choices you make and the products and features you use. The personal information we collect may include:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the website or when you choose to participate in various activities related to the website.</li>
            <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the website, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the website.</li>
            <li><strong>Financial Data:</strong> Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you purchase, order, return, exchange, or request information about our services from the website.</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">
            Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the website to:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Create and manage your account.</li>
            <li>Process your orders and payments.</li>
            <li>Email you regarding your account or order.</li>
            <li>Fulfill and manage purchases, orders, payments, and other transactions related to the website.</li>
            <li>Generate a personal profile about you to make future visits to the website more personalized.</li>
            <li>Increase the efficiency and operation of the website.</li>
            <li>Monitor and analyze usage and trends to improve your experience with the website.</li>
            <li>Notify you of updates to the website.</li>
            <li>Offer new products, services, and/or recommendations to you.</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Disclosure of Your Information</h2>
          <p className="mb-4">
            We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
            <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Security of Your Information</h2>
          <p className="mb-4">
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Policy for Children</h2>
          <p className="mb-4">
            We do not knowingly solicit information from or market to children under the age of 13. If you become aware that any data we have collected comes from children under the age of 13, please contact us using the contact information provided below.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Contact Us</h2>
          <p className="mb-4">
            If you have questions or comments about this Privacy Policy, please contact us at:
          </p>
          <div className="mt-4 p-4 bg-background rounded border border-border">
            <p className="font-bold text-foreground">{siteName}</p>
            <p>{address}</p>
            <p className="mt-2">Email: <a href={`mailto:${contactEmail}`} className="text-accent hover:underline">{contactEmail}</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
