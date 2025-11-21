
import React from 'react';
import { useSiteContent } from '../hooks/useSiteContent';
import Swal from 'sweetalert2';

const ContactForm: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    Swal.fire({
        title: 'Message Sent!',
        text: 'Thank you for your message! We will get back to you shortly.',
        icon: 'success',
        confirmButtonColor: '#2563EB'
    });
    // In a real app, you would handle form submission here (e.g., save to Firestore).
    (e.target as HTMLFormElement).reset();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-card-foreground">Full Name</label>
        <div className="mt-1">
          <input type="text" name="name" id="name" required className="block w-full shadow-sm py-3 px-4 bg-background border border-input rounded-md focus:ring-ring focus:border-ring" />
        </div>
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-card-foreground">Email</label>
        <div className="mt-1">
          <input id="email" name="email" type="email" autoComplete="email" required className="block w-full shadow-sm py-3 px-4 bg-background border border-input rounded-md focus:ring-ring focus:border-ring" />
        </div>
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-card-foreground">Message</label>
        <div className="mt-1">
          <textarea id="message" name="message" rows={4} required className="block w-full shadow-sm py-3 px-4 bg-background border border-input rounded-md focus:ring-ring focus:border-ring"></textarea>
        </div>
      </div>
      <div>
        <button type="submit" className="w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-accent-foreground bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent">
          Send Message
        </button>
      </div>
    </form>
  );
};


const Contact: React.FC = () => {
    const { siteContent } = useSiteContent();
    const contactInfo = siteContent?.contactInfo;

    if (!contactInfo) return null;

  return (
    <div className="bg-background py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground">Contact Us</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            We'd love to hear from you. Reach out with any questions or to schedule a test drive.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-secondary p-8 rounded-lg border border-border">
                <ContactForm />
            </div>
            <div className="text-foreground">
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Location</h3>
                <p className="mb-2 text-muted-foreground">{contactInfo.address}</p>
                <p className="mb-2 text-muted-foreground">Phone: {contactInfo.phone}</p>
                <p className="text-muted-foreground">Email: {contactInfo.email}</p>

                <h3 className="text-2xl font-bold text-foreground mt-8 mb-4">Business Hours</h3>
                <p className="text-muted-foreground">Monday - Friday: {contactInfo.hours.week}</p>
                <p className="text-muted-foreground">Saturday: {contactInfo.hours.saturday}</p>
                <p className="text-muted-foreground">Sunday: {contactInfo.hours.sunday}</p>

                <div className="mt-8">
                    <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-muted">
                         <img src="https://images.unsplash.com/photo-1579532589218-1cde4ac8c422?q=80&w=1740&auto=format&fit=crop" alt="Map to dealership" className="object-cover"/>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
