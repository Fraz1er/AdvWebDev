import { useState } from 'react';
import { z } from 'zod';

// Define Zod validation schema
const testFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Please enter a valid email address"),
  bookingDate: z.string().min(1, "Please select a booking date"),
  purpose: z.string().min(5, "Purpose must be at least 5 characters long"),
  acceptTerms: z.boolean().refine(val => val === true, "You must accept the terms"),
});

function TestFormPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bookingDate: '',
    purpose: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate with Zod
    const result = testFormSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        fieldErrors[fieldName] = issue.message;
      });
      setErrors(fieldErrors);
      setSuccessMessage('');
      setApiResponse(null);
      return;
    }

    setErrors({});
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await fetch('https://httpbin.org/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(result.data),
      });

      const data = await response.json();
      setApiResponse(data);
      setSuccessMessage('✅ Form submitted successfully! Data sent to httpbin.');
      
      // Optional: Clear form after successful submission
      // setFormData({ name: '', email: '', bookingDate: '', purpose: '', acceptTerms: false });
      
    } catch (error) {
      console.error('Error:', error);
      setSuccessMessage('❌ Something went wrong while sending data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Test Form Subpage</h2>
        <p className="text-sm text-gray-500 mt-1">
          Fill out this form to test validation and API submission to httpbin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Submit Your Information</h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Text Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:ring-2 focus:outline-none transition
                  ${errors.name 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'}`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:ring-2 focus:outline-none transition
                  ${errors.email 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'}`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Date Input */}
            <div>
              <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700 mb-1">
                Booking Date *
              </label>
              <input
                type="date"
                id="bookingDate"
                name="bookingDate"
                value={formData.bookingDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:ring-2 focus:outline-none transition
                  ${errors.bookingDate 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'}`}
              />
              {errors.bookingDate && <p className="text-red-500 text-xs mt-1">{errors.bookingDate}</p>}
            </div>

            {/* Textarea (purpose) */}
            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
                Purpose of Booking *
              </label>
              <textarea
                id="purpose"
                name="purpose"
                rows="3"
                value={formData.purpose}
                onChange={handleChange}
                placeholder="Describe the purpose of your booking..."
                className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:ring-2 focus:outline-none transition
                  ${errors.purpose 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'}`}
              />
              {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose}</p>}
            </div>

            {/* Checkbox Input */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="acceptTerms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                I accept the terms and conditions *
              </label>
            </div>
            {errors.acceptTerms && <p className="text-red-500 text-xs mt-1">{errors.acceptTerms}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit to httpbin'}
            </button>
          </form>
        </div>

        {/* Right Column: Response Display */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Server Response</h3>
          
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
              {successMessage}
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-500 mt-2">Sending data to httpbin...</p>
            </div>
          )}

          {apiResponse && (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                ✓ Data sent to: <code className="bg-gray-100 px-2 py-0.5 rounded">https://httpbin.org/post</code>
              </p>
              <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                <pre className="text-green-400 text-xs font-mono">
                  {JSON.stringify(apiResponse.json, null, 2)}
                </pre>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                ↑ httpbin echoes your submitted data back as JSON
              </p>
            </div>
          )}

          {!apiResponse && !loading && (
            <div className="text-center py-12 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
              <p>Submit the form to see the server response here</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default TestFormPage;