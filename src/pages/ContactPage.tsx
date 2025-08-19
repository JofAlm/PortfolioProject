// src/pages/ContactPage.tsx
const ContactPage = () => (
  <div className="max-w-3xl mx-auto">
    <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
    <div className="bg-white p-8 rounded-lg shadow-md space-y-4">
      <p className="text-lg text-gray-700">
        I'm always open to discussing new projects, creative ideas, or
        opportunities to be part of an ambitious vision. Feel free to get in
        touch with me.
      </p>
      <div>
        <h3 className="text-xl font-semibold text-gray-800">Email</h3>
        <a
          href="mailto:your.email@example.com"
          className="text-blue-600 hover:underline"
        >
          your.email@example.com
        </a>
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-800">LinkedIn</h3>
        <a href="#" className="text-blue-600 hover:underline">
          linkedin.com/in/your-profile
        </a>
      </div>
    </div>
  </div>
);

export default ContactPage;
