import React from 'react';

const About: React.FC = () => {
  return (
    <div className="bg-background text-foreground">
      <div className="relative h-80">
        <img src="https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?q=80&w=1740&auto=format&fit=crop" alt="Our dealership" className="absolute h-full w-full object-cover"/>
        <div className="absolute h-full w-full bg-background/70 flex items-center justify-center">
          <h1 className="text-5xl font-bold text-foreground tracking-tight">About AutoSphere</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-accent mb-4">Our Mission</h2>
            <p className="text-muted-foreground text-lg mb-4">
              At AutoSphere, our mission is to revolutionize the car buying experience. We believe that purchasing a vehicle should be an exciting, transparent, and seamless process. We are committed to providing a curated selection of high-quality vehicles, backed by exceptional customer service and a deep passion for all things automotive.
            </p>
            <p className="text-muted-foreground text-lg">
              We leverage cutting-edge technology and a customer-centric approach to ensure you find the perfect car that fits your lifestyle and budget, without the hassle and pressure of traditional dealerships.
            </p>
          </div>
          <div>
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop" alt="AutoSphere Team" className="rounded-lg shadow-xl"/>
          </div>
        </div>

        <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-8">Our Core Values</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div className="bg-secondary p-8 rounded-lg border border-border">
                    <h3 className="text-xl font-semibold text-accent">Integrity</h3>
                    <p className="mt-2 text-muted-foreground">We operate with honesty and transparency in every interaction.</p>
                </div>
                <div className="bg-secondary p-8 rounded-lg border border-border">
                    <h3 className="text-xl font-semibold text-accent">Quality</h3>
                    <p className="mt-2 text-muted-foreground">We offer only the best, hand-picked vehicles that meet our strict standards.</p>
                </div>
                <div className="bg-secondary p-8 rounded-lg border border-border">
                    <h3 className="text-xl font-semibold text-accent">Innovation</h3>
                    <p className="mt-2 text-muted-foreground">We constantly seek new ways to improve the car buying journey for our customers.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default About;