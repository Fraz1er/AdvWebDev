function ResourceCard({ resource, onEdit, onDelete }) {
  const getStatusColor = (status) => {
    switch(status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'in-use':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow cursor-pointer"
         onClick={() => onEdit(resource)}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{resource.name}</h3>
          <p className="text-sm text-gray-600 mt-1">ID: {resource.id}</p>
          <p className="text-sm text-gray-600">Type: {resource.type || 'General'}</p>
          {resource.description && (
            <p className="text-sm text-gray-500 mt-2">{resource.description}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(resource.status)}`}>
            {resource.status || 'available'}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(resource.id);
            }}
            className="text-rose-600 hover:text-rose-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResourceCard;