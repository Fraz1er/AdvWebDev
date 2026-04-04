import { Link, useLocation } from 'react-router-dom';

function Navigation() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-blue-600">Booking System</h1>
          </div>
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className={`text-sm font-medium transition ${
                isActive('/')
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Resources
            </Link>
            <Link
              to="/test-form"
              className={`text-sm font-medium transition ${
                isActive('/test-form')
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Test Form
            </Link>
            {/* ✅ ADD THIS SUBMISSIONS LINK */}
            <Link
              to="/submissions"
              className={`text-sm font-medium transition ${
                isActive('/submissions')
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Submissions
            </Link>
            <button className="text-sm text-gray-500 hover:text-gray-700">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;