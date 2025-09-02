const ContactPage = () => (
  <div className="max-w-3xl mx-auto">
    <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
    <div className="bg-white p-8 rounded-lg shadow-md space-y-6">
      <p className="text-lg text-gray-700">
        We are always open to discussing new projects, creative ideas, or
        opportunities to be part of an ambitious vision. Feel free to get in
        touch with us.
      </p>

      <div>
        <h3 className="text-xl font-semibold text-gray-800">Email</h3>
        <a
          href="mailto:info@audiovisum.se"
          className="text-blue-600 hover:underline"
        >
          info@audiovisum.se
        </a>
      </div>
    </div>
  </div>
);

export default ContactPage;
