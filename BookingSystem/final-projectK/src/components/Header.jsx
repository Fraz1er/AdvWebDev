function Header() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-blue-600">Booking System</h1>
          </div>
          <div className="flex items-center space-x-4">
            <a href="#" className="text-blue-600 border-b-2 border-blue-600 px-1 pt-1 text-sm font-medium">
              Resources
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700 text-sm font-medium">
              Reservations
            </a>
            <button className="text-sm text-gray-500 hover:text-gray-700">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;