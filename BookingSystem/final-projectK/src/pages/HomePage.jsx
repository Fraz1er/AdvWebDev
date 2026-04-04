import { useState } from 'react';
import ResourceForm from '../components/ResourceForm';
import ResourceCard from '../components/ResourceCard';
import Message from '../components/Message';

const initialResources = [
  { id: 1, name: 'Conference Room A', type: 'Meeting Room', description: 'Large room with projector, seats 20 people', status: 'available' },
  { id: 2, name: 'MacBook Pro', type: 'Laptop', description: '16-inch M3 Pro, 512GB', status: 'in-use' },
  { id: 3, name: '4K Projector', type: 'AV Equipment', description: 'HDMI compatible, 4000 lumens', status: 'available' },
  { id: 4, name: 'Whiteboard', type: 'Office Supply', description: 'Mobile whiteboard, 4x6 feet', status: 'available' },
];

function HomePage() {
  const [resources, setResources] = useState(initialResources);
  const [editingResource, setEditingResource] = useState(null);
  const [message, setMessage] = useState({ show: false, type: 'success', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showMessage = (type, text) => {
    setMessage({ show: true, type, text });
  };

  const hideMessage = () => {
    setMessage({ show: false, type: 'success', text: '' });
  };

  const handleCreateResource = async (formData) => {
    setIsSubmitting(true);
    setTimeout(() => {
      const newResource = {
        id: resources.length + 1,
        ...formData
      };
      setResources([...resources, newResource]);
      showMessage('success', `✅ Resource "${formData.name}" created successfully!`);
      setIsSubmitting(false);
    }, 500);
  };

  const handleUpdateResource = async (formData) => {
    setIsSubmitting(true);
    setTimeout(() => {
      const updatedResources = resources.map(resource =>
        resource.id === editingResource.id
          ? { ...resource, ...formData }
          : resource
      );
      setResources(updatedResources);
      showMessage('success', `✅ Resource "${formData.name}" updated successfully!`);
      setEditingResource(null);
      setIsSubmitting(false);
    }, 500);
  };

  const handleDeleteResource = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      const resourceToDelete = resources.find(r => r.id === id);
      setTimeout(() => {
        const filteredResources = resources.filter(resource => resource.id !== id);
        setResources(filteredResources);
        showMessage('success', `✅ Resource "${resourceToDelete.name}" deleted successfully!`);
      }, 300);
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

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Manage Resources</h2>
        <p className="text-sm text-gray-500 mt-1">Create, view, update and delete resources</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

export default HomePage;