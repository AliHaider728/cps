import React, { useState } from 'react';
import { GraduationCap, Plus, Edit2, Trash2, Download, Search, Eye, CheckCircle, Clock, X, Save, Award, TrendingUp } from 'lucide-react';
import * as XLSX from 'xlsx';

const TrainingTab = ({ staffData }) => {
  const [trainings, setTrainings] = useState([
    {
      id: 1,
      title: 'Data Security Awareness',
      category: 'Mandatory',
      type: 'Online Course',
      provider: 'NHS Digital',
      startDate: '2025-05-10',
      completionDate: '2025-05-12',
      expiryDate: '2026-05-12',
      duration: '2 hours',
      status: 'Completed',
      progress: 100,
      score: 95,
      certificate: 'CERT-DS-2025-001',
      notes: 'Excellent understanding of data protection principles',
      assignedBy: 'Saba Kazmi'
    },
    {
      id: 2,
      title: 'Sepsis in Primary Care - Overview',
      category: 'Clinical',
      type: 'Workshop',
      provider: 'Primary Care Training',
      startDate: '2025-11-17',
      completionDate: '2025-11-17',
      expiryDate: '2027-11-17',
      duration: '4 hours',
      status: 'Completed',
      progress: 100,
      score: 92,
      certificate: 'CERT-SPC-2025-002',
      notes: 'Practical session with case studies',
      assignedBy: 'Noor Ul Hameed'
    },
    {
      id: 3,
      title: 'Infection Prevention and Control - Level 1',
      category: 'Mandatory',
      type: 'Online Course',
      provider: 'NHS England',
      startDate: '2025-05-15',
      completionDate: '2025-05-16',
      expiryDate: '2026-05-16',
      duration: '1.5 hours',
      status: 'Completed',
      progress: 100,
      score: 88,
      certificate: 'CERT-IPC-2025-003',
      notes: 'Understanding of infection control protocols',
      assignedBy: 'Noor Ul Hameed'
    },
    {
      id: 4,
      title: 'Deprivation of Liberty Safeguards (DoLS)',
      category: 'Safeguarding',
      type: 'E-Learning',
      provider: 'Social Care Institute',
      startDate: '2025-05-19',
      completionDate: '2025-05-20',
      expiryDate: '2027-05-20',
      duration: '3 hours',
      status: 'Completed',
      progress: 100,
      score: 90,
      certificate: 'CERT-DOLS-2025-004',
      notes: 'Comprehensive understanding of safeguarding principles',
      assignedBy: 'Noor Ul Hameed'
    },
    {
      id: 5,
      title: 'Advanced Prescribing Skills',
      category: 'Clinical',
      type: 'Online Course',
      provider: 'Royal Pharmaceutical Society',
      startDate: '2026-01-10',
      completionDate: null,
      expiryDate: null,
      duration: '8 hours',
      status: 'In Progress',
      progress: 65,
      score: null,
      certificate: null,
      notes: 'Expected completion by end of January',
      assignedBy: 'Arslan Shahroz'
    },
    {
      id: 6,
      title: 'Mental Health First Aid',
      category: 'Professional Development',
      type: 'Workshop',
      provider: 'Mental Health England',
      startDate: '2026-02-01',
      completionDate: null,
      expiryDate: null,
      duration: '6 hours',
      status: 'Scheduled',
      progress: 0,
      score: null,
      certificate: null,
      notes: 'Two-day workshop scheduled',
      assignedBy: 'Stephen Elliott'
    },
    {
      id: 7,
      title: 'Fire Safety Training',
      category: 'Mandatory',
      type: 'Classroom',
      provider: 'Local Fire Service',
      startDate: '2025-03-15',
      completionDate: '2025-03-15',
      expiryDate: '2026-03-15',
      duration: '2 hours',
      status: 'Expired',
      progress: 100,
      score: 85,
      certificate: 'CERT-FS-2025-005',
      notes: 'Renewal required',
      assignedBy: 'Saba Kazmi'
    },
    {
      id: 8,
      title: 'Clinical Governance',
      category: 'Professional Development',
      type: 'E-Learning',
      provider: 'BMJ Learning',
      startDate: '2025-08-20',
      completionDate: '2025-08-22',
      expiryDate: '2027-08-22',
      duration: '5 hours',
      status: 'Completed',
      progress: 100,
      score: 93,
      certificate: 'CERT-CG-2025-006',
      notes: 'Excellent grasp of governance principles',
      assignedBy: 'Arslan Shahroz'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingTraining, setEditingTraining] = useState(null);
  const [viewingTraining, setViewingTraining] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Mandatory',
    type: 'Online Course',
    provider: '',
    startDate: '',
    duration: '',
    notes: ''
  });

  const categories = ['All', 'Mandatory', 'Clinical', 'Safeguarding', 'Professional Development', 'Technical', 'Soft Skills'];
  const types = ['Online Course', 'Workshop', 'E-Learning', 'Classroom', 'Webinar', 'Conference'];
  const statuses = ['All', 'Completed', 'In Progress', 'Scheduled', 'Expired', 'Not Started'];

  // Get status color - Dark mode compatible
  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'In Progress':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Scheduled':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'Expired':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'Not Started':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  // Get category badge color - Dark mode compatible
  const getCategoryColor = (category) => {
    const colors = {
      'Mandatory': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      'Clinical': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'Safeguarding': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      'Professional Development': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'Technical': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      'Soft Skills': 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300'
    };
    return colors[category] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
  };

  // Filter trainings
  const filteredTrainings = trainings.filter(training => {
    const matchesSearch = 
      training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.notes.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'All' || training.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || training.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Add new training
  const handleAdd = () => {
    if (!formData.title.trim() || !formData.provider.trim() || !formData.startDate) {
      alert('Please fill in all required fields');
      return;
    }

    const newTraining = {
      id: Math.max(...trainings.map(t => t.id), 0) + 1,
      title: formData.title,
      category: formData.category,
      type: formData.type,
      provider: formData.provider,
      startDate: formData.startDate,
      completionDate: null,
      expiryDate: null,
      duration: formData.duration,
      status: 'Scheduled',
      progress: 0,
      score: null,
      certificate: null,
      notes: formData.notes,
      assignedBy: 'Current User'
    };

    setTrainings([newTraining, ...trainings]);
    resetForm();
  };

  // Update training
  const handleUpdate = () => {
    if (!formData.title.trim() || !formData.provider.trim() || !formData.startDate) {
      alert('Please fill in all required fields');
      return;
    }

    setTrainings(trainings.map(training =>
      training.id === editingTraining.id
        ? {
            ...training,
            title: formData.title,
            category: formData.category,
            type: formData.type,
            provider: formData.provider,
            startDate: formData.startDate,
            duration: formData.duration,
            notes: formData.notes
          }
        : training
    ));
    resetForm();
  };

  // Delete training
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this training record?')) {
      setTrainings(trainings.filter(training => training.id !== id));
    }
  };

  // Edit training
  const handleEdit = (training) => {
    setEditingTraining(training);
    setFormData({
      title: training.title,
      category: training.category,
      type: training.type,
      provider: training.provider,
      startDate: training.startDate,
      duration: training.duration,
      notes: training.notes
    });
    setShowModal(true);
  };

  // View training
  const handleView = (training) => {
    setViewingTraining(training);
    setShowViewModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      category: 'Mandatory',
      type: 'Online Course',
      provider: '',
      startDate: '',
      duration: '',
      notes: ''
    });
    setEditingTraining(null);
    setShowModal(false);
  };

  // Export to Excel
  const handleExport = () => {
    const exportData = trainings.map(training => ({
      'Training Title': training.title,
      'Category': training.category,
      'Type': training.type,
      'Provider': training.provider,
      'Start Date': training.startDate,
      'Completion Date': training.completionDate || 'N/A',
      'Expiry Date': training.expiryDate || 'N/A',
      'Duration': training.duration,
      'Status': training.status,
      'Progress': `${training.progress}%`,
      'Score': training.score ? `${training.score}%` : 'N/A',
      'Certificate': training.certificate || 'N/A',
      'Assigned By': training.assignedBy,
      'Notes': training.notes
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Training Records');
    
    ws['!cols'] = [
      { wch: 35 }, { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 12 },
      { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 10 },
      { wch: 10 }, { wch: 20 }, { wch: 20 }, { wch: 40 }
    ];

    XLSX.writeFile(wb, `${staffData?.name || 'Staff'}_Training_Records.xlsx`);
  };

  // Calculate statistics
  const stats = {
    total: trainings.length,
    completed: trainings.filter(t => t.status === 'Completed').length,
    inProgress: trainings.filter(t => t.status === 'In Progress').length,
    scheduled: trainings.filter(t => t.status === 'Scheduled').length,
    expired: trainings.filter(t => t.status === 'Expired').length,
    avgScore: trainings.filter(t => t.score).length > 0
      ? Math.round(trainings.filter(t => t.score).reduce((sum, t) => sum + t.score, 0) / trainings.filter(t => t.score).length)
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Training & Development</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Track staff training courses and certifications</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg transition-colors duration-200 shadow-sm"
          >
            <Download size={16} />
            <span className="font-medium">Export</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 shadow-sm"
          >
            <Plus size={16} />
            <span className="font-medium">Add Training</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-4 hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</div>
          <div className="text-sm text-green-700 dark:text-green-300 mt-1">Completed</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4 hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</div>
          <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">In Progress</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 p-4 hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.scheduled}</div>
          <div className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">Scheduled</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-4 hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.expired}</div>
          <div className="text-sm text-red-700 dark:text-red-300 mt-1">Expired</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 p-4 hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.avgScore}%</div>
          <div className="text-sm text-purple-700 dark:text-purple-300 mt-1">Avg Score</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search by title, provider, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        >
          {statuses.map(status => (
            <option key={status} value={status}>{status === 'All' ? 'All Statuses' : status}</option>
          ))}
        </select>
      </div>

      {/* Training Cards */}
      {filteredTrainings.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTrainings.map((training) => (
            <div
              key={training.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all duration-200 group"
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <GraduationCap size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {training.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(training.category)}`}>
                      {training.category}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {training.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Training Details */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Provider:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{training.provider}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                  <span className="text-gray-900 dark:text-gray-100">{training.duration}</span>
                </div>
                {training.score && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Score:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{training.score}%</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(training.status)}`}>
                    {training.status}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              {training.progress > 0 && training.progress < 100 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{training.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${training.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Certificate Badge */}
              {training.certificate && (
                <div className="flex items-center gap-2 mb-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <Award size={16} className="text-green-600 dark:text-green-400" />
                  <span className="text-xs text-green-700 dark:text-green-300 font-medium">{training.certificate}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Start: {training.startDate}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleView(training)}
                    className="p-2 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleEdit(training)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                    title="Edit Training"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(training.id)}
                    className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                    title="Delete Training"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="text-blue-600 dark:text-blue-400" size={40} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Training Records Found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || filterCategory !== 'All' || filterStatus !== 'All'
              ? 'No training records match your current filters'
              : 'No training records found for this staff member'}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
          >
            Add First Training
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {editingTraining ? 'Edit Training' : 'Add New Training'}
              </h3>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <X size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Training Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Data Security Awareness"
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  >
                    {types.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Provider <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  placeholder="e.g., NHS Digital"
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 2 hours"
                    className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Additional information..."
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={resetForm}
                className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
              >
                <X size={18} />
                <span className="font-medium">Cancel</span>
              </button>
              <button
                onClick={editingTraining ? handleUpdate : handleAdd}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 shadow-sm"
              >
                <Save size={18} />
                <span className="font-medium">{editingTraining ? 'Update' : 'Add'} Training</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && viewingTraining && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full">
            <div className="bg-blue-50 dark:bg-blue-900/30 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Training Details</h3>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors">
                <X size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="p-4 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <GraduationCap size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">{viewingTraining.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{viewingTraining.provider}</p>
                </div>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(viewingTraining.status)}`}>
                  {viewingTraining.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Category</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{viewingTraining.category}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Type</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{viewingTraining.type}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Duration</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{viewingTraining.duration}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Start Date</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{viewingTraining.startDate}</div>
                </div>
                {viewingTraining.completionDate && (
                  <>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Completion Date</div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{viewingTraining.completionDate}</div>
                    </div>
                    {viewingTraining.expiryDate && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Expiry Date</div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{viewingTraining.expiryDate}</div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {viewingTraining.progress > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">Progress</span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{viewingTraining.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${viewingTraining.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {viewingTraining.score && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center justify-between">
                  <span className="text-green-700 dark:text-green-300 font-medium">Assessment Score:</span>
                  <span className="text-3xl font-bold text-green-600 dark:text-green-400">{viewingTraining.score}%</span>
                </div>
              )}

              {viewingTraining.certificate && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center gap-3">
                  <Award size={24} className="text-blue-600 dark:text-blue-400" />
                  <div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Certificate Number</div>
                    <div className="font-medium text-blue-800 dark:text-blue-300">{viewingTraining.certificate}</div>
                  </div>
                </div>
              )}

              {viewingTraining.notes && (
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Notes</div>
                  <div className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    {viewingTraining.notes}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                Assigned by {viewingTraining.assignedBy}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingTab;