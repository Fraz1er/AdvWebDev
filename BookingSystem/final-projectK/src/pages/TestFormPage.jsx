import { useState } from 'react';
import { z } from 'zod';

const testFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email required"),
  bookingDate: z.string().min(1, "Select a date"),
  purpose: z.string().min(5, "Purpose must be at least 5 characters"),
  acceptTerms: z.boolean().refine(val => val === true, "You must accept terms"),
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
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setLoading(true);

    const result = testFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      console.log('Sending data:', result.data);
      
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: result.data.name,
          email: result.data.email,
          bookingDate: result.data.bookingDate,
          purpose: result.data.purpose,
          acceptTerms: result.data.acceptTerms
        }),
      });

      const data = await response.json();
      console.log('Response:', data);

      if (response.ok) {
        setSuccessMessage('✅ Submission saved to database!');
        setFormData({
          name: '',
          email: '',
          bookingDate: '',
          purpose: '',
          acceptTerms: false,
        });
        // Refresh the page after 1 second to show new submission
        setTimeout(() => {
          window.location.href = '/submissions';
        }, 1500);
      } else {
        setErrorMessage('❌ Failed to save: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Submit error:', error);
      setErrorMessage('❌ Network error: Could not reach the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">New Booking Submission</h2>
        <p className="text-sm text-gray-500 mt-1">Submit your booking request to the database</p>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Booking Date *</label>
            <input
              type="date"
              name="bookingDate"
              value={formData.bookingDate}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            {errors.bookingDate && <p className="text-red-500 text-xs mt-1">{errors.bookingDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label>
            <textarea
              name="purpose"
              rows="3"
              value={formData.purpose}
              onChange={handleChange}
              placeholder="Describe the purpose of your booking..."
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose}</p>}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm text-gray-700">
              I accept the terms and conditions *
            </label>
          </div>
          {errors.acceptTerms && <p className="text-red-500 text-xs mt-1">{errors.acceptTerms}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit to Database'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default TestFormPage;