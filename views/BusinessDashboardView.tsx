import React, { useState, useEffect } from 'react';
import { Page } from '../App';

interface BusinessDashboardViewProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const BusinessDashboardView: React.FC<BusinessDashboardViewProps> = ({ onNavigate, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [businessData, setBusinessData] = useState({
    name: 'Student',
    category: 'services',
    rating: 4.2,
    reviews: 15,
    views: 234,
    clicks: 89,
    phone: '+91 98765 43210',
    email: 'student@business.com',
    address: 'LPU Campus, Block 34, Phagwara',
    description: 'Professional student services and academic support.',
    hours: {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 6:00 PM',
      friday: '9:00 AM - 6:00 PM',
      saturday: '10:00 AM - 4:00 PM',
      sunday: 'Closed'
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(businessData);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  
  // Analytics chart state
  const [hoveredPoint, setHoveredPoint] = useState<{x: number, y: number, data: any} | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<'views' | 'clicks'>('views');

  const handleSave = () => {
    setBusinessData(editData);
    setIsEditing(false);
    alert('Business information updated successfully!');
  };

  const handleCancel = () => {
    setEditData(businessData);
    setIsEditing(false);
  };

  const handlePasswordChange = () => {
    const errors: Record<string, string> = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    } else if (passwordData.currentPassword !== 'student123') {
      errors.currentPassword = 'Current password is incorrect';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      // Simulate password change
      setTimeout(() => {
        alert('Password changed successfully! Please log in again.');
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        onLogout(); // Log out user after password change
      }, 1000);
    }
  };

  const handleDownloadData = () => {
    // Create a comprehensive data export
    const exportData = {
      businessInfo: businessData,
      analytics: {
        totalViews: businessData.views,
        totalClicks: businessData.clicks,
        rating: businessData.rating,
        reviewCount: businessData.reviews
      },
      exportDate: new Date().toISOString(),
      exportedBy: businessData.email
    };

    // Convert to JSON and create downloadable file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `${businessData.name.toLowerCase().replace(/\s+/g, '-')}-data-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('Your business data has been downloaded successfully!');
  };

  const handleDeleteAccount = () => {
    // Simulate account deletion process
    setTimeout(() => {
      alert('Your account has been permanently deleted. We\'re sorry to see you go!');
      localStorage.removeItem('business_owner_logged_in');
      onNavigate('home');
    }, 1500);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: null },
    { id: 'profile', label: 'Business Profile', icon: null },
    { id: 'analytics', label: 'Analytics', icon: null },
    { id: 'reviews', label: 'Reviews', icon: null },
    { id: 'settings', label: 'Settings', icon: null }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl" style={{ backgroundColor: '#1f2937' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: '#9ca3af' }}>Total Views</h3>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#4f46e5' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#ffffff' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold" style={{ color: '#ffffff' }}>{businessData.views}</p>
          <p className="text-sm mt-2" style={{ color: '#10b981' }}>+12% this week</p>
        </div>

        <div className="p-6 rounded-2xl" style={{ backgroundColor: '#1f2937' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: '#9ca3af' }}>Profile Clicks</h3>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b981' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#ffffff' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold" style={{ color: '#ffffff' }}>{businessData.clicks}</p>
          <p className="text-sm mt-2" style={{ color: '#10b981' }}>+8% this week</p>
        </div>

        <div className="p-6 rounded-2xl" style={{ backgroundColor: '#1f2937' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: '#9ca3af' }}>Rating</h3>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f59e0b' }}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#ffffff' }}>
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold" style={{ color: '#ffffff' }}>{businessData.rating}</p>
          <p className="text-sm mt-2" style={{ color: '#e5e7eb' }}>{businessData.reviews} reviews</p>
        </div>

        <div className="p-6 rounded-2xl" style={{ backgroundColor: '#1f2937' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: '#9ca3af' }}>Category Rank</h3>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8b5cf6' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#ffffff' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold" style={{ color: '#ffffff' }}>#3</p>
          <p className="text-sm mt-2" style={{ color: '#e5e7eb' }}>in Services</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-8 rounded-2xl" style={{ backgroundColor: '#1f2937' }}>
        <h3 className="text-xl font-bold mb-6" style={{ color: '#ffffff' }}>Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: '#374151' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#10b981' }}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#ffffff' }}>
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold" style={{ color: '#ffffff' }}>New 5-star review received</p>
              <p className="text-sm" style={{ color: '#9ca3af' }}>2 hours ago</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: '#374151' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3b82f6' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#ffffff' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold" style={{ color: '#ffffff' }}>Profile viewed 15 times today</p>
              <p className="text-sm" style={{ color: '#9ca3af' }}>6 hours ago</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: '#374151' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8b5cf6' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#ffffff' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold" style={{ color: '#ffffff' }}>Contact information updated</p>
              <p className="text-sm" style={{ color: '#9ca3af' }}>1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold" style={{ color: '#ffffff' }}>Business Profile</h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-3 rounded-xl font-semibold transition-all"
            style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="px-6 py-3 rounded-xl font-semibold transition-all"
              style={{ backgroundColor: '#10b981', color: '#ffffff' }}
            >
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-3 rounded-xl font-semibold transition-all"
              style={{ backgroundColor: '#6b7280', color: '#ffffff' }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="p-8 rounded-2xl" style={{ backgroundColor: '#1f2937' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: '#ffffff' }}>
              Business Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({...editData, name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 transition-all"
                style={{ backgroundColor: '#374151', borderColor: '#4b5563', color: '#ffffff' }}
              />
            ) : (
              <p className="text-lg" style={{ color: '#e5e7eb' }}>{businessData.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: '#ffffff' }}>
              Category
            </label>
            {isEditing ? (
              <select
                value={editData.category}
                onChange={(e) => setEditData({...editData, category: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 transition-all"
                style={{ backgroundColor: '#374151', borderColor: '#4b5563', color: '#ffffff' }}
              >
                <option value="services">Services</option>
                <option value="restaurant">Restaurant</option>
                <option value="retail">Retail</option>
                <option value="fitness">Fitness</option>
              </select>
            ) : (
              <p className="text-lg capitalize" style={{ color: '#e5e7eb' }}>{businessData.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: '#ffffff' }}>
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={editData.phone}
                onChange={(e) => setEditData({...editData, phone: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 transition-all"
                style={{ backgroundColor: '#374151', borderColor: '#4b5563', color: '#ffffff' }}
              />
            ) : (
              <p className="text-lg" style={{ color: '#e5e7eb' }}>{businessData.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: '#ffffff' }}>
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({...editData, email: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 transition-all"
                style={{ backgroundColor: '#374151', borderColor: '#4b5563', color: '#ffffff' }}
              />
            ) : (
              <p className="text-lg" style={{ color: '#e5e7eb' }}>{businessData.email}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-3" style={{ color: '#ffffff' }}>
              Address
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editData.address}
                onChange={(e) => setEditData({...editData, address: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 transition-all"
                style={{ backgroundColor: '#374151', borderColor: '#4b5563', color: '#ffffff' }}
              />
            ) : (
              <p className="text-lg" style={{ color: '#e5e7eb' }}>{businessData.address}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-3" style={{ color: '#ffffff' }}>
              Description
            </label>
            {isEditing ? (
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({...editData, description: e.target.value})}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border-2 transition-all resize-none"
                style={{ backgroundColor: '#374151', borderColor: '#4b5563', color: '#ffffff' }}
              />
            ) : (
              <p className="text-lg" style={{ color: '#e5e7eb' }}>{businessData.description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => {
    // Sample data for the line chart
    const chartData = [
      { day: 'Mon', views: 32, clicks: 12, date: '2024-01-08' },
      { day: 'Tue', views: 45, clicks: 18, date: '2024-01-09' },
      { day: 'Wed', views: 38, clicks: 15, date: '2024-01-10' },
      { day: 'Thu', views: 52, clicks: 22, date: '2024-01-11' },
      { day: 'Fri', views: 61, clicks: 28, date: '2024-01-12' },
      { day: 'Sat', views: 43, clicks: 19, date: '2024-01-13' },
      { day: 'Sun', views: 29, clicks: 11, date: '2024-01-14' }
    ];

    // Chart dimensions
    const chartWidth = 400;
    const chartHeight = 200;
    const padding = 40;

    // Calculate scales
    const maxValue = Math.max(...chartData.map(d => Math.max(d.views, d.clicks)));
    const xScale = (index: number) => padding + (index * (chartWidth - 2 * padding)) / (chartData.length - 1);
    const yScale = (value: number) => chartHeight - padding - ((value / maxValue) * (chartHeight - 2 * padding));

    // Generate path for line
    const generatePath = (metric: 'views' | 'clicks') => {
      return chartData.map((d, i) => {
        const x = xScale(i);
        const y = yScale(d[metric]);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ');
    };

    return (
      <div className="space-y-8">
        <h3 className="text-2xl font-bold" style={{ color: '#ffffff' }}>Analytics Dashboard</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Interactive Line Chart */}
          <div className="p-8 rounded-2xl" style={{ backgroundColor: '#1f2937' }}>
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold" style={{ color: '#ffffff' }}>Weekly Performance</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedMetric('views')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    selectedMetric === 'views' ? 'shadow-lg' : ''
                  }`}
                  style={{
                    backgroundColor: selectedMetric === 'views' ? '#4f46e5' : '#374151',
                    color: '#ffffff'
                  }}
                >
                  Views
                </button>
                <button
                  onClick={() => setSelectedMetric('clicks')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    selectedMetric === 'clicks' ? 'shadow-lg' : ''
                  }`}
                  style={{
                    backgroundColor: selectedMetric === 'clicks' ? '#10b981' : '#374151',
                    color: '#ffffff'
                  }}
                >
                  Clicks
                </button>
              </div>
            </div>
            
            <div className="relative">
              <svg 
                width={chartWidth} 
                height={chartHeight} 
                className="overflow-visible"
                style={{ background: 'transparent' }}
              >
                {/* Grid lines */}
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: selectedMetric === 'views' ? '#4f46e5' : '#10b981', stopOpacity: 0.3 }} />
                    <stop offset="100%" style={{ stopColor: selectedMetric === 'views' ? '#4f46e5' : '#10b981', stopOpacity: 0 }} />
                  </linearGradient>
                </defs>
                
                {/* Horizontal grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                  <line
                    key={i}
                    x1={padding}
                    y1={chartHeight - padding - ratio * (chartHeight - 2 * padding)}
                    x2={chartWidth - padding}
                    y2={chartHeight - padding - ratio * (chartHeight - 2 * padding)}
                    stroke="#374151"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                ))}
                
                {/* Vertical grid lines */}
                {chartData.map((_, i) => (
                  <line
                    key={i}
                    x1={xScale(i)}
                    y1={padding}
                    x2={xScale(i)}
                    y2={chartHeight - padding}
                    stroke="#374151"
                    strokeWidth="1"
                    opacity="0.2"
                  />
                ))}

                {/* Area under the line */}
                <path
                  d={`${generatePath(selectedMetric)} L ${xScale(chartData.length - 1)} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`}
                  fill="url(#chartGradient)"
                  opacity="0.3"
                />

                {/* Main line */}
                <path
                  d={generatePath(selectedMetric)}
                  fill="none"
                  stroke={selectedMetric === 'views' ? '#4f46e5' : '#10b981'}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }}
                />

                {/* Data points */}
                {chartData.map((d, i) => {
                  const x = xScale(i);
                  const y = yScale(d[selectedMetric]);
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="6"
                      fill={selectedMetric === 'views' ? '#4f46e5' : '#10b981'}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="cursor-pointer transition-all duration-200 hover:r-8"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredPoint({
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                          data: d
                        });
                      }}
                      onMouseLeave={() => setHoveredPoint(null)}
                      style={{
                        filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
                        transform: hoveredPoint?.data === d ? 'scale(1.2)' : 'scale(1)',
                        transition: 'transform 0.2s ease'
                      }}
                    />
                  );
                })}

                {/* X-axis labels */}
                {chartData.map((d, i) => (
                  <text
                    key={i}
                    x={xScale(i)}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#9ca3af"
                    fontWeight="500"
                  >
                    {d.day}
                  </text>
                ))}

                {/* Y-axis labels */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                  <text
                    key={i}
                    x={padding - 10}
                    y={chartHeight - padding - ratio * (chartHeight - 2 * padding) + 4}
                    textAnchor="end"
                    fontSize="12"
                    fill="#9ca3af"
                    fontWeight="500"
                  >
                    {Math.round(maxValue * ratio)}
                  </text>
                ))}
              </svg>

              {/* Tooltip */}
              {hoveredPoint && (
                <div
                  className="absolute z-10 p-3 rounded-lg shadow-lg pointer-events-none"
                  style={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    left: hoveredPoint.x - 60,
                    top: hoveredPoint.y - 80,
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div className="text-center">
                    <p className="text-xs font-semibold" style={{ color: '#9ca3af' }}>
                      {hoveredPoint.data.day}, {hoveredPoint.data.date}
                    </p>
                    <p className="text-lg font-bold" style={{ color: '#ffffff' }}>
                      {hoveredPoint.data[selectedMetric]} {selectedMetric}
                    </p>
                    <div className="flex justify-center gap-4 mt-2 text-xs">
                      <span style={{ color: '#4f46e5' }}>Views: {hoveredPoint.data.views}</span>
                      <span style={{ color: '#10b981' }}>Clicks: {hoveredPoint.data.clicks}</span>
                    </div>
                  </div>
                  {/* Tooltip arrow */}
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2"
                    style={{
                      bottom: '-6px',
                      width: 0,
                      height: 0,
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderTop: '6px solid #374151'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Chart Legend */}
            <div className="flex justify-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#4f46e5' }}></div>
                <span className="text-sm" style={{ color: '#e5e7eb' }}>Profile Views</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10b981' }}></div>
                <span className="text-sm" style={{ color: '#e5e7eb' }}>Profile Clicks</span>
              </div>
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="p-8 rounded-2xl" style={{ backgroundColor: '#1f2937' }}>
            <h4 className="text-lg font-semibold mb-6" style={{ color: '#ffffff' }}>Traffic Sources</h4>
            <div className="space-y-4">
              {[
                { source: 'Direct Search', percentage: 45, color: '#4f46e5' },
                { source: 'Category Browse', percentage: 30, color: '#10b981' },
                { source: 'Map View', percentage: 15, color: '#f59e0b' },
                { source: 'Featured', percentage: 10, color: '#8b5cf6' }
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span style={{ color: '#e5e7eb' }}>{item.source}</span>
                    <span style={{ color: '#ffffff' }}>{item.percentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#374151' }}>
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        backgroundColor: item.color,
                        width: `${item.percentage}%`,
                        animation: `slideIn 1s ease-out ${index * 0.2}s both`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="mt-8 p-4 rounded-xl" style={{ backgroundColor: '#374151' }}>
              <h5 className="text-sm font-semibold mb-3" style={{ color: '#ffffff' }}>This Week's Highlights</h5>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold" style={{ color: '#4f46e5' }}>
                    {chartData.reduce((sum, d) => sum + d.views, 0)}
                  </p>
                  <p className="text-xs" style={{ color: '#9ca3af' }}>Total Views</p>
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: '#10b981' }}>
                    {chartData.reduce((sum, d) => sum + d.clicks, 0)}
                  </p>
                  <p className="text-xs" style={{ color: '#9ca3af' }}>Total Clicks</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes slideIn {
            from {
              width: 0%;
            }
            to {
              width: var(--target-width);
            }
          }
        `}</style>
      </div>
    );
  };

  const renderReviews = () => (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold" style={{ color: '#ffffff' }}>Customer Reviews</h3>
      
      <div className="space-y-6">
        {[
          { name: 'Priya S.', rating: 5, comment: 'Excellent service! Very professional and helpful.', date: '2 days ago' },
          { name: 'Rahul K.', rating: 4, comment: 'Good experience overall. Quick response time.', date: '1 week ago' },
          { name: 'Anita M.', rating: 5, comment: 'Highly recommend! Great quality work.', date: '2 weeks ago' }
        ].map((review, index) => (
          <div key={index} className="p-6 rounded-2xl" style={{ backgroundColor: '#1f2937' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#4f46e5' }}>
                  <span style={{ color: '#ffffff' }}>{review.name[0]}</span>
                </div>
                <div>
                  <p className="font-semibold" style={{ color: '#ffffff' }}>{review.name}</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: i < review.rating ? '#fbbf24' : '#374151' }}>
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-sm" style={{ color: '#9ca3af' }}>{review.date}</span>
            </div>
            <p style={{ color: '#e5e7eb' }}>{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold" style={{ color: '#ffffff' }}>Account Settings</h3>
      
      <div className="space-y-6">
        <div className="p-8 rounded-2xl" style={{ backgroundColor: '#1f2937' }}>
          <h4 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>Notification Preferences</h4>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span style={{ color: '#e5e7eb' }}>Email notifications for new reviews</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </label>
            <label className="flex items-center justify-between">
              <span style={{ color: '#e5e7eb' }}>SMS alerts for profile views</span>
              <input type="checkbox" className="rounded" />
            </label>
            <label className="flex items-center justify-between">
              <span style={{ color: '#e5e7eb' }}>Weekly analytics report</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </label>
          </div>
        </div>

        <div className="p-8 rounded-2xl" style={{ backgroundColor: '#1f2937' }}>
          <h4 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>Account Actions</h4>
          <div className="space-y-4">
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="w-full px-6 py-3 rounded-xl font-semibold transition-all text-left hover:opacity-80" 
              style={{ backgroundColor: '#374151', color: '#ffffff' }}
            >
              Change Password
            </button>
            <button 
              onClick={handleDownloadData}
              className="w-full px-6 py-3 rounded-xl font-semibold transition-all text-left hover:opacity-80" 
              style={{ backgroundColor: '#374151', color: '#ffffff' }}
            >
              Download Data
            </button>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="w-full px-6 py-3 rounded-xl font-semibold transition-all text-left hover:opacity-80" 
              style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
          <div className="w-full max-w-md p-8 rounded-2xl" style={{ backgroundColor: '#1f2937' }}>
            <h3 className="text-xl font-bold mb-6" style={{ color: '#ffffff' }}>Change Password</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#ffffff' }}>
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all"
                  style={{ 
                    backgroundColor: '#374151', 
                    borderColor: passwordErrors.currentPassword ? '#dc2626' : '#4b5563', 
                    color: '#ffffff' 
                  }}
                  placeholder="Enter current password"
                />
                {passwordErrors.currentPassword && (
                  <p className="text-sm mt-1" style={{ color: '#dc2626' }}>{passwordErrors.currentPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#ffffff' }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all"
                  style={{ 
                    backgroundColor: '#374151', 
                    borderColor: passwordErrors.newPassword ? '#dc2626' : '#4b5563', 
                    color: '#ffffff' 
                  }}
                  placeholder="Enter new password"
                />
                {passwordErrors.newPassword && (
                  <p className="text-sm mt-1" style={{ color: '#dc2626' }}>{passwordErrors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#ffffff' }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all"
                  style={{ 
                    backgroundColor: '#374151', 
                    borderColor: passwordErrors.confirmPassword ? '#dc2626' : '#4b5563', 
                    color: '#ffffff' 
                  }}
                  placeholder="Confirm new password"
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-sm mt-1" style={{ color: '#dc2626' }}>{passwordErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handlePasswordChange}
                className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all"
                style={{ backgroundColor: '#10b981', color: '#ffffff' }}
              >
                Change Password
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setPasswordErrors({});
                }}
                className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all"
                style={{ backgroundColor: '#6b7280', color: '#ffffff' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
          <div className="w-full max-w-md p-8 rounded-2xl" style={{ backgroundColor: '#1f2937' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#ffffff' }}>Delete Account</h3>
            
            <div className="mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#dc2626' }}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#ffffff' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-center mb-4" style={{ color: '#e5e7eb' }}>
                Are you sure you want to delete your account? This action cannot be undone.
              </p>
              <div className="p-4 rounded-xl" style={{ backgroundColor: '#374151' }}>
                <p className="text-sm" style={{ color: '#fbbf24' }}>
                  <strong>This will permanently:</strong>
                </p>
                <ul className="text-sm mt-2 space-y-1" style={{ color: '#e5e7eb' }}>
                  <li>• Delete your business profile</li>
                  <li>• Remove all your data</li>
                  <li>• Cancel any active subscriptions</li>
                  <li>• Remove your business from search results</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all"
                style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
              >
                Yes, Delete Account
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all"
                style={{ backgroundColor: '#6b7280', color: '#ffffff' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'profile': return renderProfile();
      case 'analytics': return renderAnalytics();
      case 'reviews': return renderReviews();
      case 'settings': return renderSettings();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen px-8 py-8" style={{ backgroundColor: '#000000' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold" style={{ color: '#ffffff' }}>Business Dashboard</h1>
            <p className="text-lg mt-2" style={{ color: '#9ca3af' }}>Welcome back, {businessData.name}!</p>
          </div>
          <button
            onClick={onLogout}
            className="px-6 py-3 rounded-xl font-semibold transition-all"
            style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
          >
            Logout
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 p-2 rounded-2xl" style={{ backgroundColor: '#1f2937' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab.id ? 'shadow-lg' : ''
              }`}
              style={{
                backgroundColor: activeTab === tab.id ? '#4f46e5' : 'transparent',
                color: '#ffffff'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboardView;