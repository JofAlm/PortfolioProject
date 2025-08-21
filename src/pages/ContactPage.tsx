// src/pages/ContactPage.tsx

/** Simple contact page with email and LinkedIn info. */
const ContactPage = () => (
  <div className="max-w-3xl mx-auto">
    {/* Page title */}
    <h1 className="text-4xl font-bold mb-4">Contact Us</h1>

    {/* Card container */}
    <div className="bg-white p-8 rounded-lg shadow-md space-y-4">
      {/* Intro text */}
      <p className="text-lg text-gray-700">
        We are always open to discussing new projects, creative ideas, or
        opportunities to be part of an ambitious vision. Feel free to get in
        touch with us.
      </p>

      {/* Email section */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800">Email</h3>
        <a
          href="mailto:your.email@example.com"
          className="text-blue-600 hover:underline"
        >
          info@audiovisium.se
        </a>
      </div>

      {/* LinkedIn section */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800">LinkedIn</h3>
        <a href="#" className="text-blue-600 hover:underline">
          linkedin.com
        </a>
      </div>
    </div>
  </div>
);

export default ContactPage;
