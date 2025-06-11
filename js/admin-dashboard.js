import React, { useState } from 'react';
import { Shield, Users, Calendar, FileText, Eye, Search, Filter, Download, Settings, LogOut, BarChart3 } from 'lucide-react';

const HostAdminDashboard = () => {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'dashboard', 'trials', 'users', 'entries'
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrial, setSelectedTrial] = useState(null);

  // Sample admin credentials (in real app, this would be secure authentication)
  const adminCredentials = {
    username: 'admin',
    password: 'dogtrial2025'
  };

  // Sample data (would come from database)
  const [trialsData] = useState([
    {
      id: 1,
      name: 'Summer Championship Trial',
      club: 'Prairie Dog Obedience Club',
      date: '2025-07-15',
      location: 'Spruce Grove Community Center',
      status: 'Active',
      entriesCount: 45,
      maxEntries: 60,
      secretary: 'Sarah Johnson',
      secretaryEmail: 'sarah@prairiedogs.ca',
      fees: { novice: 45, open: 50, utility: 55 },
      totalRevenue: 2100
    },
    {
      id: 2,
      name: 'Fall Classic',
      club: 'Edmonton Kennel Club',
      date: '2025-09-20',
      location: 'Edmonton Expo Centre',
      status: 'Registration Open',
      entriesCount: 23,
      maxEntries: 80,
      secretary: 'Mike Chen',
      secretaryEmail: 'mike@edmontonkc.ca',
      fees: { novice: 40, open: 45, utility: 50 },
      totalRevenue: 1035
    },
    {
      id: 3,
      name: 'Winter Wonderland Trial',
      club: 'Calgary Dog Training',
      date: '2025-12-10',
      location: 'Calgary Training Center',
      status: 'Planning',
      entriesCount: 0,
      maxEntries: 50,
      secretary: 'Lisa Brown',
      secretaryEmail: 'lisa@calgarydt.ca',
      fees: { novice: 42, open: 47, utility: 52 },
      totalRevenue: 0
    }
  ]);

  const [entriesData] = useState([
    {
      id: 1,
      confirmationNumber: 'DOG2025001',
      trialId: 1,
      dogName: 'Rex',
      breed: 'German Shepherd',
      handlerName: 'John Doe',
      handlerEmail: 'john.doe@email.com',
      handlerPhone: '555-0123',
      trialClass: 'Novice A',
      entryDate: '2025-06-01',
      paymentStatus: 'Pending',
      fees: 55.00,
      specialNeeds: 'First time competing'
    }
  ]);

  const [usersData] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '555-0123',
      registrationDate: '2025-05-15',
      totalEntries: 3,
      lastLogin: '2025-06-08',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Sara Smith',
      email: 'sara.smith@email.com',
      phone: '555-0456',
      registrationDate: '2025-05-20',
      totalEntries: 2,
      lastLogin: '2025-06-09',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Tom Wilson',
      email: 'tom.wilson@email.com',
      phone: '555-0789',
      registrationDate: '2025-06-01',
      totalEntries: 1,
      lastLogin: '2025-06-03',
      status: 'Active'
    }
  ]);

  const handleLogin = () => {
    setError('');
    
    if (loginData.username === adminCredentials.username && 
        loginData.password === adminCredentials.password) {
      setCurrentView('dashboard');
    } else {
      setError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    setCurrentView('login');
    setLoginData({ username: '', password: '' });
    setError('');
  };

  const getFilteredEntries = () => {
    let filtered = entriesData;
    
    if (selectedTrial) {
      filtered = filtered.filter(entry => entry.trialId === selectedTrial);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.dogName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.handlerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.confirmationNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getFilteredUsers = () => {
    if (!searchTerm) return usersData;
    
    return usersData.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Login View
  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Host Admin Portal</h1>
            <p className="text-gray-600 mt-2">Manage trials, entries, and users</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter admin username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter admin password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleLogin}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <Shield className="w-4 h-4 inline mr-2" />
              Login to Admin Panel
            </button>
          </div>

          <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-indigo-800 font-medium">Demo Login:</p>
            <p className="text-sm text-indigo-700">Username: <span className="font-mono">admin</span></p>
            <p className="text-sm text-indigo-700">Password: <span className="font-mono">dogtrial2025</span></p>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Overview
  if (currentView === 'dashboard') {
    const totalEntries = entriesData.length;
    const totalUsers = usersData.length;
    const totalTrials = trialsData.length;
    const totalRevenue = trialsData.reduce((sum, trial) => sum + trial.totalRevenue, 0);
    const pendingPayments = entriesData.filter(entry => entry.paymentStatus === 'Pending').length;

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Shield className="w-8 h-8 text-indigo-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              </div>
              <div className="flex items-center space-x-4">
                <nav className="flex space-x-1">
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setCurrentView('trials')}
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Trials
                  </button>
                  <button
                    onClick={() => setCurrentView('entries')}
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Entries
                  </button>
                  <button
                    onClick={() => setCurrentView('users')}
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Users
                  </button>
                </nav>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">All Users</h2>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  <Users className="w-4 h-4 inline mr-2" />
                  Export Users
                </button>
              </div>
              
              <div className="flex space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">ID: {user.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">{user.email}</div>
                          <div className="text-sm text-gray-500">{user.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(user.registrationDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">{user.totalEntries} entries</div>
                          <div className="text-sm text-gray-500">Last: {new Date(user.lastLogin).toLocaleDateString()}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <Settings className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">User Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Users</span>
                  <span className="text-sm font-medium text-gray-900">{usersData.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Users</span>
                  <span className="text-sm font-medium text-green-600">
                    {usersData.filter(u => u.status === 'Active').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">New This Month</span>
                  <span className="text-sm font-medium text-blue-600">2</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Tom Wilson</div>
                  <div className="text-gray-600">Registered new account</div>
                  <div className="text-gray-500">2 hours ago</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Sara Smith</div>
                  <div className="text-gray-600">Updated entry information</div>
                  <div className="text-gray-500">1 day ago</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">John Doe</div>
                  <div className="text-gray-600">Completed payment</div>
                  <div className="text-gray-500">3 days ago</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <div className="font-medium text-blue-900">Send Announcement</div>
                  <div className="text-sm text-blue-700">Send message to all users</div>
                </button>
                <button className="w-full text-left p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <div className="font-medium text-green-900">Export Data</div>
                  <div className="text-sm text-green-700">Download user list</div>
                </button>
                <button className="w-full text-left p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <div className="font-medium text-purple-900">System Settings</div>
                  <div className="text-sm text-purple-700">Configure user permissions</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default HostAdminDashboard;
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Trials</p>
                  <p className="text-2xl font-bold text-gray-900">{totalTrials}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Entries</p>
                  <p className="text-2xl font-bold text-gray-900">{totalEntries}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${totalRevenue}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Recent Trials</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {trialsData.slice(0, 3).map((trial) => (
                    <div key={trial.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{trial.name}</h3>
                        <p className="text-sm text-gray-600">{trial.club}</p>
                        <p className="text-sm text-gray-500">{new Date(trial.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{trial.entriesCount}/{trial.maxEntries}</p>
                        <p className="text-sm text-gray-600">entries</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">System Status</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Trials</span>
                    <span className="text-sm font-medium text-green-600">
                      {trialsData.filter(t => t.status === 'Active').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pending Payments</span>
                    <span className="text-sm font-medium text-yellow-600">{pendingPayments}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Registration Open</span>
                    <span className="text-sm font-medium text-blue-600">
                      {trialsData.filter(t => t.status === 'Registration Open').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Planning Phase</span>
                    <span className="text-sm font-medium text-gray-600">
                      {trialsData.filter(t => t.status === 'Planning').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Trials View
  if (currentView === 'trials') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Shield className="w-8 h-8 text-indigo-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">Trial Management</h1>
              </div>
              <div className="flex items-center space-x-4">
                <nav className="flex space-x-1">
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setCurrentView('trials')}
                    className="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Trials
                  </button>
                  <button
                    onClick={() => setCurrentView('entries')}
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Entries
                  </button>
                  <button
                    onClick={() => setCurrentView('users')}
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Users
                  </button>
                </nav>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">All Trials</h2>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Create New Trial
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trial</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entries</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trialsData.map((trial) => (
                    <tr key={trial.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{trial.name}</div>
                          <div className="text-sm text-gray-500">{trial.location}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trial.club}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(trial.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          trial.status === 'Active' ? 'bg-green-100 text-green-800' :
                          trial.status === 'Registration Open' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {trial.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trial.entriesCount}/{trial.maxEntries}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${trial.totalRevenue}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                          <Settings className="w-4 h-4" />
                        </button>
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Entries View
  if (currentView === 'entries') {
    const filteredEntries = getFilteredEntries();
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Shield className="w-8 h-8 text-indigo-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">Entry Management</h1>
              </div>
              <div className="flex items-center space-x-4">
                <nav className="flex space-x-1">
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setCurrentView('trials')}
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Trials
                  </button>
                  <button
                    onClick={() => setCurrentView('entries')}
                    className="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Entries
                  </button>
                  <button
                    onClick={() => setCurrentView('users')}
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Users
                  </button>
                </nav>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">All Entries</h2>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  <Download className="w-4 h-4 inline mr-2" />
                  Export All
                </button>
              </div>
              
              <div className="flex space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search entries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={selectedTrial || ''}
                  onChange={(e) => setSelectedTrial(e.target.value ? parseInt(e.target.value) : null)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Trials</option>
                  {trialsData.map((trial) => (
                    <option key={trial.id} value={trial.id}>{trial.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confirmation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dog/Handler</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{entry.confirmationNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{entry.dogName}</div>
                          <div className="text-sm text-gray-500">{entry.handlerName}</div>
                          <div className="text-sm text-gray-500">{entry.handlerEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.trialClass}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(entry.entryDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            entry.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {entry.paymentStatus}
                          </span>
                          <div className="text-sm text-gray-500 mt-1">${entry.fees}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Users View
  if (currentView === 'users') {
    const filteredUsers = getFilteredUsers();
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Shield className="w-8 h-8 text-indigo-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              </div>
              <div className="flex items-center space-x-4">
                <nav className="flex space-x-1">
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setCurrentView('trials')}
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Trials
                  </button>
                  <button
                    onClick={() => setCurrentView('entries')}
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Entries
                  </button>
                  <button
                    onClick={() => setCurrentView('users')}
                    className="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Users
                  </button>
                </nav>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Paid',
      fees: 45.00,
      specialNeeds: 'None'
    },
    {
      id: 2,
      confirmationNumber: 'DOG2025002',
      trialId: 1,
      dogName: 'Luna',
      breed: 'Golden Retriever',
      handlerName: 'Sara Smith',
      handlerEmail: 'sara.smith@email.com',
      handlerPhone: '555-0456',
      trialClass: 'Open B',
      entryDate: '2025-06-02',
      paymentStatus: 'Paid',
      fees: 50.00,
      specialNeeds: 'Reactive to other dogs'
    },
    {
      id: 3,
      confirmationNumber: 'DOG2025003',
      trialId: 2,
      dogName: 'Buddy',
      breed: 'Labrador',
      handlerName: 'Tom Wilson',
      handlerEmail: 'tom.wilson@email.com',
      handlerPhone: '555-0789',
      trialClass: 'Utility A',
      entryDate: '2025-06-03',
      paymentStatus: '
