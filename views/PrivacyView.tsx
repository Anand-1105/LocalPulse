import React from 'react';

const PrivacyView: React.FC = () => {
  return (
    <div className="pt-40 pb-32 px-8 overflow-hidden" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-20 text-center">
          <span className="font-bold tracking-[0.15em] uppercase text-[11px] mb-4 block" style={{ color: '#9ca3af' }}>
            Legal
          </span>
          <h1 className="text-3xl md:text-5xl font-[800] leading-tight" style={{ color: '#ffffff' }}>
            Privacy Policy
          </h1>
        </div>
        
        <div className="prose prose-lg max-w-none">
          <div className="mb-12">
            <p className="text-lg leading-relaxed mb-6" style={{ color: '#e5e7eb' }}>
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <p className="text-lg leading-relaxed" style={{ color: '#e5e7eb' }}>
              At LocalPulse, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our local business directory platform.
            </p>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#ffffff' }}>Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: '#ffffff' }}>Personal Information</h3>
                <p className="text-lg leading-relaxed" style={{ color: '#e5e7eb' }}>
                  We may collect personal information such as your name, email address, and location data when you create an account, submit business listings, or interact with our platform.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: '#ffffff' }}>Usage Data</h3>
                <p className="text-lg leading-relaxed" style={{ color: '#e5e7eb' }}>
                  We automatically collect information about how you use our service, including your IP address, browser type, pages visited, and time spent on our platform.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#ffffff' }}>How We Use Your Information</h2>
            <ul className="space-y-3">
              <li className="text-lg leading-relaxed" style={{ color: '#e5e7eb' }}>• To provide and maintain our service</li>
              <li className="text-lg leading-relaxed" style={{ color: '#e5e7eb' }}>• To personalize your experience and show relevant local businesses</li>
              <li className="text-lg leading-relaxed" style={{ color: '#e5e7eb' }}>• To communicate with you about updates and new features</li>
              <li className="text-lg leading-relaxed" style={{ color: '#e5e7eb' }}>• To improve our platform and develop new features</li>
              <li className="text-lg leading-relaxed" style={{ color: '#e5e7eb' }}>• To comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#ffffff' }}>Information Sharing</h2>
            <p className="text-lg leading-relaxed mb-4" style={{ color: '#e5e7eb' }}>
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:
            </p>
            <ul className="space-y-3">
              <li className="text-lg leading-relaxed" style={{ color: '#e5e7eb' }}>• With service providers who assist us in operating our platform</li>
              <li className="text-lg leading-relaxed" style={{ color: '#e5e7eb' }}>• When required by law or to protect our rights</li>
              <li className="text-lg leading-relaxed" style={{ color: '#e5e7eb' }}>• In connection with a business transfer or merger</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#ffffff' }}>Data Security</h2>
            <p className="text-lg leading-relaxed" style={{ color: '#e5e7eb' }}>
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#ffffff' }}>Your Rights</h2>
            <p className="text-lg leading-relaxed mb-4" style={{ color: '#e5e7eb' }}>
              You have the right to:
            </p>
            <ul className="space-y-3">
              <li className="text-lg leading-relaxed" style={{ color: '#e5e7eb' }}>• Access and update your personal information</li>
              <li className="text-lg leading-relaxed" style={{ color: '#e5e7eb' }}>• Request deletion of your data</li>
              <li className="text-lg leading-relaxed" style={{ color: '#e5e7eb' }}>• Opt-out of marketing communications</li>
              <li className="text-lg leading-relaxed" style={{ color: '#e5e7eb' }}>• Request data portability</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#ffffff' }}>Contact Us</h2>
            <p className="text-lg leading-relaxed" style={{ color: '#e5e7eb' }}>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-4 p-6 rounded-2xl" style={{ backgroundColor: '#1f2937' }}>
              <p className="text-lg" style={{ color: '#ffffff' }}>Email: privacy@localpulse.com</p>
              <p className="text-lg" style={{ color: '#ffffff' }}>Address: LocalPulse, LPU Campus, Phagwara, Punjab</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyView;