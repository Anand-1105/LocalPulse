import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Page } from '../App';
import { db } from '../lib/database';

interface BusinessSubmission {
  id: string;
  businessName: string;
  category: string;
  description: string;
  address: string;
  phone: string;
  website: string;
  hours: string;
  rating: string;
  latitude: string;
  longitude: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  submittedBy?: string;
}

interface AdminDashboardViewProps {
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
}

const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onNavigate, onLogout }) => {
  const [submissions, setSubmissions] = useState<BusinessSubmission[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [selectedSubmission, setSelectedSubmission] = useState<BusinessSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load submissions from localStorage
    const loadSubmissions = () => {
      const stored = localStorage.getItem('business_submissions');
      if (stored) {
        const parsedSubmissions = JSON.parse(stored);
        setSubmissions(parsedSubmissions);
      } else {
        // Create some mock submissions for demo
        const mockSubmissions: BusinessSubmission[] = [
          {
            id: 'sub_001',
            businessName: 'Cafe Mocha LPU',
            category: 'Coffee',
            description: 'Cozy coffee shop near LPU campus with fresh pastries and study-friendly atmosphere.',
            address: 'Near Block 30, LPU Campus, Phagwara',
            phone: '+91 98765 43210',
            website: 'https://cafemocha.com',
            hours: '7:00 AM - 11:00 PM',
            rating: '4.5',
            latitude: '31.2545',
            longitude: '75.7025',
            images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800'],
            status: 'pending',
            submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            submittedBy: 'john.doe@lpu.in'
          },
          {
            id: 'sub_002',
            businessName: 'TechHub Coworking',
            category: 'Services',
            description: '24/7 coworking space with high-speed internet, meeting rooms, and startup community.',
            address: 'Phagwara IT Park, Near LPU',
            phone: '+91 87654 32109',
            website: 'https://techhub.co.in',
            hours: '24/7',
            rating: '4.8',
            latitude: '31.2520',
            longitude: '75.7080',
            images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'],
            status: 'pending',
            submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            submittedBy: 'startup@techhub.co.in'
          },
          {
            id: 'sub_003',
            businessName: 'Fitness Zone Pro',
            category: 'Fitness',
            description: 'Modern gym with latest equipment, personal trainers, and group fitness classes.',
            address: 'Main Market, Phagwara',
            phone: '+91 76543 21098',
            website: 'https://fitnesszonepro.com',
            hours: '5:00 AM - 11:00 PM',
            rating: '4.6',
            latitude: '31.2480',
            longitude: '75.7120',
            images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800'],
            status: 'approved',
            submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            submittedBy: 'owner@fitnesszone.com'
          }
        ];
        localStorage.setItem('business_submissions', JSON.stringify(mockSubmissions));
        setSubmissions(mockSubmissions);
      }
      setIsLoading(false);
    };

    loadSubmissions();

    // Real-time updates: Listen for localStorage changes (cross-tab communication)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'business_submissions' && e.newValue) {
        const updatedSubmissions = JSON.parse(e.newValue);
        setSubmissions(updatedSubmissions);
        
        // Show notification for new submissions
        const currentSubmissions = JSON.parse(localStorage.getItem('business_submissions') || '[]');
        const newSubmissions = updatedSubmissions.filter((sub: BusinessSubmission) => 
          !currentSubmissions.find((current: BusinessSubmission) => current.id === sub.id)
        );
        
        if (newSubmissions.length > 0) {
          // Show notification for new submissions
          setNotification(`${newSubmissions.length} new business submission(s) received!`);
          setTimeout(() => setNotification(null), 5000);
          setLastUpdated(new Date());
          console.log(`${newSubmissions.length} new business submission(s) received!`);
        }
      }
    };

    // Listen for changes from other tabs/windows
    window.addEventListener('storage', handleStorageChange);

    // Poll for changes every 2 seconds (in case storage event doesn't fire)
    const pollInterval = setInterval(() => {
      const stored = localStorage.getItem('business_submissions');
      if (stored) {
        const parsedSubmissions = JSON.parse(stored);
        if (JSON.stringify(parsedSubmissions) !== JSON.stringify(submissions)) {
          setSubmissions(parsedSubmissions);
          setLastUpdated(new Date());
        }
      }
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, [submissions]);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, 
        { y: 40, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1.2, ease: "power4.out", delay: 0.2 }
      );
    }
  }, []);

  const handleApprove = async (submissionId: string) => {
    const submission = submissions.find(sub => sub.id === submissionId);
    if (!submission) return;

    try {
      // Add to Supabase database
      await db.addBusiness({
        name: submission.businessName,
        category: submission.category.toLowerCase(),
        type: submission.category.toLowerCase(),
        city: 'Phagwara', // Default city
        rating: parseFloat(submission.rating) || 4.0,
        latitude: parseFloat(submission.latitude) || 31.2540,
        longitude: parseFloat(submission.longitude) || 75.7030,
        ai_generated: false
      });

      // Update local state
      const updatedSubmissions = submissions.map(sub => 
        sub.id === submissionId ? { ...sub, status: 'approved' as const } : sub
      );
      setSubmissions(updatedSubmissions);
      localStorage.setItem('business_submissions', JSON.stringify(updatedSubmissions));
      setSelectedSubmission(null);
      setLastUpdated(new Date());
      
      // Show success notification
      setNotification(`${submission.businessName} has been approved and added to the directory!`);
      setTimeout(() => setNotification(null), 5000);
      
    } catch (error) {
      console.error('Failed to approve business:', error);
      setNotification('Failed to approve business. Please try again.');
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleReject = (submissionId: string) => {
    const updatedSubmissions = submissions.map(sub => 
      sub.id === submissionId ? { ...sub, status: 'rejected' as const } : sub
    );
    setSubmissions(updatedSubmissions);
    localStorage.setItem('business_submissions', JSON.stringify(updatedSubmissions));
    setSelectedSubmission(null);
    setLastUpdated(new Date());
  };

  const handleDelist = (submissionId: string) => {
    const updatedSubmissions = submissions.filter(sub => sub.id !== submissionId);
    setSubmissions(updatedSubmissions);
    localStorage.setItem('business_submissions', JSON.stringify(updatedSubmissions));
    setSelectedSubmission(null);
    setLastUpdated(new Date());
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (activeTab === 'all') return true;
    return sub.status === activeTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafb] dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-[11px]">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafb] dark:bg-slate-900">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-8 right-8 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-lg z-50 animate-in slide-in-from-right duration-300">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <span className="font-bold">{notification}</span>
          </div>
        </div>
      )}

      {/* Admin Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-[800] text-slate-900 dark:text-white">Admin Dashboard</h1>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-slate-500 dark:text-slate-400 font-medium">Manage business submissions and listings</p>
              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Live • Updated {lastUpdated.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                const stored = localStorage.getItem('business_submissions');
                if (stored) {
                  setSubmissions(JSON.parse(stored));
                  setLastUpdated(new Date());
                }
              }}
              className="bg-indigo-100 text-indigo-700 px-6 py-3 rounded-2xl font-bold hover:bg-indigo-200 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh
            </button>
            <button 
              onClick={() => {
                if (onLogout) onLogout();
                localStorage.removeItem('admin_logged_in');
                onNavigate('home');
              }}
              className="bg-red-100 text-red-700 px-6 py-3 rounded-2xl font-bold hover:bg-red-200 transition-all"
            >
              Logout
            </button>
            <button 
              onClick={() => onNavigate('home')}
              className="bg-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-bold hover:bg-slate-200 transition-all"
            >
              ← Back to Site
            </button>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="max-w-7xl mx-auto px-8 py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-slate-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 dark:text-gray-400 font-medium text-sm">Total Submissions</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{submissions.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-slate-100 dark:border-gray-800 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 dark:text-gray-400 font-medium text-sm">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{submissions.filter(s => s.status === 'pending').length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            {/* Pulse indicator for pending items */}
            {submissions.filter(s => s.status === 'pending').length > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-slate-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 dark:text-gray-400 font-medium text-sm">Approved</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{submissions.filter(s => s.status === 'approved').length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-slate-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 dark:text-gray-400 font-medium text-sm">Rejected</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{submissions.filter(s => s.status === 'rejected').length}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-800 mb-8">
          <div className="flex border-b border-slate-100 dark:border-gray-800">
            {[
              { key: 'pending', label: 'Pending Review', count: submissions.filter(s => s.status === 'pending').length },
              { key: 'approved', label: 'Approved', count: submissions.filter(s => s.status === 'approved').length },
              { key: 'rejected', label: 'Rejected', count: submissions.filter(s => s.status === 'rejected').length },
              { key: 'all', label: 'All Submissions', count: submissions.length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-8 py-6 font-bold transition-all ${
                  activeTab === tab.key 
                    ? 'text-indigo-600 border-b-2 border-indigo-600' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Submissions List */}
          <div className="p-8">
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No submissions found</h3>
                <p className="text-slate-500">No business submissions match the current filter.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSubmissions.map(submission => (
                  <div key={submission.id} className="border border-slate-200 rounded-2xl p-6 hover:border-slate-300 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <h3 className="text-xl font-bold text-slate-900">{submission.businessName}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(submission.status)}`}>
                            {submission.status.toUpperCase()}
                          </span>
                          {/* Show "NEW" badge for submissions less than 5 minutes old */}
                          {new Date().getTime() - new Date(submission.submittedAt).getTime() < 5 * 60 * 1000 && (
                            <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-bold animate-pulse">
                              NEW
                            </span>
                          )}
                          <span className="text-sm text-slate-500 font-medium">{submission.category}</span>
                        </div>
                        <p className="text-slate-600 mb-3 line-clamp-2">{submission.description}</p>
                        <div className="flex items-center gap-6 text-sm text-slate-500">
                          <span>📍 {submission.address}</span>
                          <span>📞 {submission.phone}</span>
                          <span>📅 {new Date(submission.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-3 ml-6">
                        <button 
                          onClick={() => setSelectedSubmission(submission)}
                          className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-bold hover:bg-slate-200 transition-all"
                        >
                          View Details
                        </button>
                        {submission.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApprove(submission.id)}
                              className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-green-600 transition-all"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleReject(submission.id)}
                              className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-red-600 transition-all"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {submission.status === 'approved' && (
                          <button 
                            onClick={() => handleDelist(submission.id)}
                            className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-red-600 transition-all"
                          >
                            Delist
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-8 z-50">
          <div className="bg-white rounded-[40px] max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-slate-900">Business Details</h2>
                <button 
                  onClick={() => setSelectedSubmission(null)}
                  className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-all"
                >
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Business Name</label>
                    <p className="text-lg text-slate-700">{selectedSubmission.businessName}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Category</label>
                    <p className="text-lg text-slate-700">{selectedSubmission.category}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Description</label>
                    <p className="text-slate-700">{selectedSubmission.description}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Address</label>
                    <p className="text-slate-700">{selectedSubmission.address}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2">Phone</label>
                      <p className="text-slate-700">{selectedSubmission.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2">Rating</label>
                      <p className="text-slate-700">{selectedSubmission.rating}/5</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Website</label>
                    <p className="text-slate-700">{selectedSubmission.website}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Hours</label>
                    <p className="text-slate-700">{selectedSubmission.hours}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Location</label>
                    <p className="text-slate-700">Lat: {selectedSubmission.latitude}, Lng: {selectedSubmission.longitude}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Submitted By</label>
                    <p className="text-slate-700">{selectedSubmission.submittedBy || 'Anonymous'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Submitted Date</label>
                    <p className="text-slate-700">{new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {selectedSubmission.images.length > 0 && (
                <div className="mt-8">
                  <label className="block text-sm font-bold text-slate-900 mb-4">Images</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedSubmission.images.map((image, idx) => (
                      <img 
                        key={idx}
                        src={image} 
                        alt={`${selectedSubmission.businessName} ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-2xl"
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedSubmission.status === 'pending' && (
                <div className="flex gap-4 mt-8 pt-8 border-t border-slate-200">
                  <button 
                    onClick={() => handleApprove(selectedSubmission.id)}
                    className="flex-1 bg-green-500 text-white py-4 rounded-2xl font-bold hover:bg-green-600 transition-all"
                  >
                    Approve Business
                  </button>
                  <button 
                    onClick={() => handleReject(selectedSubmission.id)}
                    className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-bold hover:bg-red-600 transition-all"
                  >
                    Reject Business
                  </button>
                </div>
              )}

              {selectedSubmission.status === 'approved' && (
                <div className="flex gap-4 mt-8 pt-8 border-t border-slate-200">
                  <button 
                    onClick={() => handleDelist(selectedSubmission.id)}
                    className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-bold hover:bg-red-600 transition-all"
                  >
                    Delist Business
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardView;