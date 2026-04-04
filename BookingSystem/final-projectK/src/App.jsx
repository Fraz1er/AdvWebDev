import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import ResourceForm from './components/ResourceForm';
import ResourceCard from './components/ResourceCard';
import Message from './components/Message';
import TestFormPage from './pages/TestFormPage';
import SubmissionsPage from './pages/SubmissionsPage';

// Home Page Component (Task I - Integrated with API)
function HomePage() {
  const [resources, setResources] = useState([]);
  const [editingResource, setEditingResource] = useState(null);
  const [message, setMessage] = useState({ show: false, type: 'success', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch resources from backend API
  const fetchResources = async () => {
    try {
      const response = await fetch('/api/resources');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setResources(data);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      showMessage('error', 'Failed to load resources from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ show: true, type, text });
  };

  const hideMessage = () => {
    setMessage({ show: false, type: 'success', text: '' });
  };

  const handleCreateResource = async (formData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        showMessage('success', `✅ Resource "${formData.name}" created successfully!`);
        fetchResources(); // Refresh the list
      } else {
        const error = await response.json();
        showMessage('error', error.error || 'Failed to create resource');
      }
    } catch (error) {
      showMessage('error', 'Network error: Could not reach the server');
    }
    setIsSubmitting(false);
  };

  const handleUpdateResource = async (formData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/resources/${editingResource.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        showMessage('success', `✅ Resource "${formData.name}" updated successfully!`);
        setEditingResource(null);
        fetchResources(); // Refresh the list
      } else {
        const error = await response.json();
        showMessage('error', error.error || 'Failed to update resource');
      }
    } catch (error) {
      showMessage('error', 'Network error: Could not reach the server');
    }
    setIsSubmitting(false);
  };

  const handleDeleteResource = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        const response = await fetch(`/api/resources/${id}`, { 
          method: 'DELETE' 
        });
        
        if (response.ok) {
          showMessage('success', '✅ Resource deleted successfully!');
          fetchResources(); // Refresh the list
        } else {
          const error = await response.json();
          showMessage('error', error.error || 'Failed to delete resource');
        }
      } catch (error) {
        showMessage('error', 'Network error: Could not reach the server');
      }
    }
  };

  const handleFormSubmit = (formData) => {
    if (editingResource) {
      handleUpdateResource(formData);
    } else {
      handleCreateResource(formData);
    }
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
  };

  const handleCancelEdit = () => {
    setEditingResource(null);
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12 text-gray-500">Loading resources from database...</div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Manage Resources</h2>
        <p className="text-sm text-gray-500 mt-1">Create, view, update and delete resources</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Resource Form */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">
              {editingResource ? 'Edit Resource' : 'Create New Resource'}
            </h3>
            
            {message.show && (
              <Message
                type={message.type}
                message={message.text}
                onClose={hideMessage}
              />
            )}
            
            <ResourceForm
              resourceToEdit={editingResource}
              onSubmit={handleFormSubmit}
              onCancel={handleCancelEdit}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>

        {/* Right Column: Resources List */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Existing Resources</h3>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {resources.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No resources found. Create your first resource!
                </div>
              ) : (
                resources.map(resource => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onEdit={handleEdit}
                    onDelete={handleDeleteResource}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Main App Component with Routing
function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/test-form" element={<TestFormPage />} />
          <Route path="/submissions" element={<SubmissionsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;