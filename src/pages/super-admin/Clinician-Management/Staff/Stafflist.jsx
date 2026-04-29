import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  X,
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react';
import AddStaffForm from '../StaffUI/Addstaffform';

const StaffList = ({ onSelectStaff }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterCompliance, setFilterCompliance] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const itemsPerPage = 10;

  // Mock data - Initially loaded
  const [staffData, setStaffData] = useState([
    {
      id: 1,
      name: 'Daniel Harper',
      photo: null,
      jobTitle: 'Senior Care Coordinator',
      role: 'Standard User',
      email: 'daniel.harper@healthmail.co.uk',
      group: 'Care Coordination',
      status: 'Working',
      compDoc: 'Compliant',
      compTraining: 'Compliant',
      department: 'Primary Care'
    },
    {
      id: 2,
      name: 'Sophie Williams',
      photo: null,
      jobTitle: 'Practice Operations Lead',
      role: 'Operations Lead',
      email: 'sophie.williams@primarycare.org',
      group: 'Practice Management',
      status: 'Working',
      compDoc: 'Compliant',
      compTraining: 'Non-Compliant',
      department: 'Operations'
    },
    {
      id: 3,
      name: 'Michael Turner',
      photo: null,
      jobTitle: 'Regional Service Manager',
      role: 'Manager',
      email: 'michael.turner@caregroup.co.uk',
      group: 'Regional Management',
      status: 'Working',
      compDoc: 'Compliant',
      compTraining: 'Compliant',
      department: 'Central Services'
    },
    {
      id: 4,
      name: 'Ayesha Khan',
      photo: null,
      jobTitle: 'Healthcare Analyst',
      role: 'Standard User',
      email: 'ayesha.khan@healthanalytics.net',
      group: 'Data & Insights',
      status: 'Working',
      compDoc: 'Non-Compliant',
      compTraining: 'Compliant',
      department: 'Analytics'
    },
    {
      id: 5,
      name: 'Oliver Bennett',
      photo: null,
      jobTitle: 'Clinical Systems Administrator',
      role: 'System Admin',
      email: 'oliver.bennett@clinicalsystems.io',
      group: 'IT Services',
      status: 'Working',
      compDoc: 'Compliant',
      compTraining: 'Compliant',
      department: 'IT'
    },
    {
      id: 6,
      name: 'Fatima Noor',
      photo: null,
      jobTitle: 'Patient Engagement Officer',
      role: 'Standard User',
      email: 'fatima.noor@patientcare.uk',
      group: 'Patient Services',
      status: 'Left',
      compDoc: 'Non-Compliant',
      compTraining: 'Non-Compliant',
      department: 'Patient Care'
    },
    {
      id: 7,
      name: 'James Collins',
      photo: null,
      jobTitle: 'Quality & Compliance Executive',
      role: 'Compliance Officer',
      email: 'james.collins@qualitycare.org',
      group: 'Compliance',
      status: 'Working',
      compDoc: 'Compliant',
      compTraining: 'Compliant',
      department: 'Governance'
    },
    {
      id: 8,
      name: 'Hannah Lewis',
      photo: null,
      jobTitle: 'Workforce Planning Manager',
      role: 'Manager',
      email: 'hannah.lewis@workforcehealth.co.uk',
      group: 'Workforce Planning',
      status: 'Working',
      compDoc: 'Compliant',
      compTraining: 'Non-Compliant',
      department: 'HR'
    }
  ]);

  // CRUD Operations
  const handleAddStaff = (newStaff) => {
    setStaffData(prev => [...prev, newStaff]);
    setShowAddForm(false);
  };

  const handleEditStaff = (staff) => {
    setEditingStaff(staff);
    setShowAddForm(true);
  };

  const handleUpdateStaff = (updatedStaff) => {
    setStaffData(prev => prev.map(staff => 
      staff.id === updatedStaff.id ? updatedStaff : staff
    ));
    setShowAddForm(false);
    setEditingStaff(null);
  };

  const handleDeleteStaff = (staffId) => {
    setStaffData(prev => prev.filter(staff => staff.id !== staffId));
    setShowDeleteConfirm(null);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingStaff(null);
  };

  // Get unique values for filters
  const roles = ['all', ...new Set(staffData.map(s => s.role))];
  const departments = ['all', ...new Set(staffData.map(s => s.department))];

  // Advanced filter logic
  const filteredStaff = staffData.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || staff.status === filterStatus;
    const matchesRole = filterRole === 'all' || staff.role === filterRole;
    const matchesDepartment = filterDepartment === 'all' || staff.department === filterDepartment;
    
    let matchesCompliance = true;
    if (filterCompliance === 'compliant') {
      matchesCompliance = staff.compDoc === 'Compliant' && staff.compTraining === 'Compliant';
    } else if (filterCompliance === 'non-compliant') {
      matchesCompliance = staff.compDoc === 'Non-Compliant' || staff.compTraining === 'Non-Compliant';
    }
    
    return matchesSearch && matchesStatus && matchesRole && matchesDepartment && matchesCompliance;
  });

  // Pagination
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStaff = filteredStaff.slice(startIndex, endIndex);

  const getStatusBadgeClass = (status) => {
    return status === 'Working' 
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
      : 'bg-rose-50 text-rose-700 border border-rose-200';
  };

  const getComplianceBadgeClass = (compliance) => {
    return compliance === 'Compliant' 
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
      : 'bg-rose-50 text-rose-700 border border-rose-200';
  };

  const clearFilters = () => {
    setFilterStatus('all');
    setFilterRole('all');
    setFilterDepartment('all');
    setFilterCompliance('all');
    setSearchTerm('');
  };

  const activeFiltersCount = [filterStatus, filterRole, filterDepartment, filterCompliance]
    .filter(f => f !== 'all').length;

  return (
    <div className="min-h-screen bg-primary overflow-x-hidden">
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Header Section - Dark mode support */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Staff Directory
            </h1>
            <p className="text-secondary text-xs mt-0.5">
              Manage and monitor your team members
            </p>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
          >
            <UserPlus size={16} />
            <span className="font-medium">Add Staff</span>
          </button>
        </div>

        {/* Stats Cards - Dark mode support */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-secondary rounded-xl p-3.5 border border-[var(--border-color)] hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary text-xs font-medium">Total Staff</p>
                <p className="text-2xl font-bold text-primary mt-0.5">{staffData.length}</p>
              </div>
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
                <UserPlus className="text-white" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-secondary rounded-xl p-3.5 border border-[var(--border-color)] hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary text-xs font-medium">Active</p>
                <p className="text-2xl font-bold text-emerald-600 mt-0.5">
                  {staffData.filter(s => s.status === 'Working').length}
                </p>
              </div>
              <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-md">
                <UserPlus className="text-white" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-secondary rounded-xl p-3.5 border border-[var(--border-color)] hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary text-xs font-medium">Compliant</p>
                <p className="text-2xl font-bold text-green-600 mt-0.5">
                  {staffData.filter(s => s.compDoc === 'Compliant' && s.compTraining === 'Compliant').length}
                </p>
              </div>
              <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-md">
                <UserPlus className="text-white" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-secondary rounded-xl p-3.5 border border-[var(--border-color)] hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary text-xs font-medium">Non-Compliant</p>
                <p className="text-2xl font-bold text-rose-600 mt-0.5">
                  {staffData.filter(s => s.compDoc === 'Non-Compliant' || s.compTraining === 'Non-Compliant').length}
                </p>
              </div>
              <div className="w-11 h-11 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                <UserPlus className="text-white" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters Bar - Dark mode support */}
        <div className="bg-secondary rounded-xl p-3.5 shadow-sm border border-[var(--border-color)]">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                placeholder="Search staff members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-primary border border-[var(--border-color)] rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="relative flex items-center justify-center gap-2 px-4 py-2 bg-primary border border-[var(--border-color)] rounded-lg text-secondary hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-200 text-sm"
            >
              <SlidersHorizontal size={18} />
              <span className="font-medium">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Advanced Filter Options */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-primary">Advanced Filters</h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    <X size={14} />
                    Clear All
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-medium text-secondary mb-1.5">Status</label>
                  <div className="relative">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-primary border border-[var(--border-color)] rounded-lg text-primary appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="Working">Working</option>
                      <option value="Left">Left</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={16} />
                  </div>
                </div>

                {/* Role Filter */}
                <div>
                  <label className="block text-xs font-medium text-secondary mb-1.5">Role</label>
                  <div className="relative">
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="w-full px-3 py-2 bg-primary border border-[var(--border-color)] rounded-lg text-primary appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                    >
                      <option value="all">All Roles</option>
                      {roles.slice(1).map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={16} />
                  </div>
                </div>

                {/* Department Filter */}
                <div>
                  <label className="block text-xs font-medium text-secondary mb-1.5">Department</label>
                  <div className="relative">
                    <select
                      value={filterDepartment}
                      onChange={(e) => setFilterDepartment(e.target.value)}
                      className="w-full px-3 py-2 bg-primary border border-[var(--border-color)] rounded-lg text-primary appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                    >
                      <option value="all">All Departments</option>
                      {departments.slice(1).map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={16} />
                  </div>
                </div>

                {/* Compliance Filter */}
                <div>
                  <label className="block text-xs font-medium text-secondary mb-1.5">Compliance</label>
                  <div className="relative">
                    <select
                      value={filterCompliance}
                      onChange={(e) => setFilterCompliance(e.target.value)}
                      className="w-full px-3 py-2 bg-primary border border-[var(--border-color)] rounded-lg text-primary appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                    >
                      <option value="all">All Compliance</option>
                      <option value="compliant">Fully Compliant</option>
                      <option value="non-compliant">Non-Compliant</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={16} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Staff Table - Desktop - Dark mode support */}
        <div className="hidden lg:block bg-secondary rounded-xl shadow-sm border border-[var(--border-color)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary border-b border-[var(--border-color)]">
                <tr>
                  <th className="px-3 py-2.5 text-left w-10">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-bold text-secondary uppercase tracking-wider">Employee</th>
                  <th className="px-3 py-2.5 text-left text-xs font-bold text-secondary uppercase tracking-wider">Job Title</th>
                  <th className="px-3 py-2.5 text-left text-xs font-bold text-secondary uppercase tracking-wider">Role</th>
                  <th className="px-3 py-2.5 text-left text-xs font-bold text-secondary uppercase tracking-wider">Email</th>
                  <th className="px-3 py-2.5 text-left text-xs font-bold text-secondary uppercase tracking-wider">Department</th>
                  <th className="px-3 py-2.5 text-left text-xs font-bold text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2.5 text-left text-xs font-bold text-secondary uppercase tracking-wider">Documents</th>
                  <th className="px-3 py-2.5 text-left text-xs font-bold text-secondary uppercase tracking-wider">Training</th>
                  <th className="px-3 py-2.5 text-right text-xs font-bold text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {currentStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-blue-50/50 transition-colors duration-150">
                    <td className="px-3 py-2.5">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md flex-shrink-0">
                          {staff.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <span className="font-semibold text-primary text-sm">{staff.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-secondary text-xs">{staff.jobTitle}</td>
                    <td className="px-3 py-2.5 text-secondary text-xs">{staff.role}</td>
                    <td className="px-3 py-2.5 text-secondary text-xs">{staff.email}</td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {staff.department}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold ${getStatusBadgeClass(staff.status)}`}>
                        {staff.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold ${getComplianceBadgeClass(staff.compDoc)}`}>
                        {staff.compDoc}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold ${getComplianceBadgeClass(staff.compTraining)}`}>
                        {staff.compTraining}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-0.5">
                        <button
                          onClick={() => onSelectStaff(staff)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditStaff(staff)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(staff.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                          title="More"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 bg-primary border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-secondary">
              Showing <span className="font-semibold text-primary">{startIndex + 1}</span> to{' '}
              <span className="font-semibold text-primary">{Math.min(endIndex, filteredStaff.length)}</span> of{' '}
              <span className="font-semibold text-primary">{filteredStaff.length}</span> results
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 text-secondary hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-secondary"
              >
                <ChevronDown size={18} className="rotate-90" />
              </button>
              
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`min-w-[32px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      currentPage === pageNum
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                        : 'text-secondary hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 text-secondary hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-secondary"
              >
                <ChevronDown size={18} className="-rotate-90" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Card View - Dark mode support */}
        <div className="lg:hidden space-y-3">
          {currentStaff.map((staff) => (
            <div key={staff.id} className="bg-secondary rounded-xl p-4 shadow-sm border border-[var(--border-color)] hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md">
                    {staff.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary text-sm">{staff.name}</h3>
                    <p className="text-xs text-secondary">{staff.jobTitle}</p>
                  </div>
                </div>
                <button
                  onClick={() => onSelectStaff(staff)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                >
                  <Eye size={16} />
                </button>
              </div>
              
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Email:</span>
                  <span className="text-primary font-medium">{staff.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Department:</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    {staff.department}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Status:</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold ${getStatusBadgeClass(staff.status)}`}>
                    {staff.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Documents:</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold ${getComplianceBadgeClass(staff.compDoc)}`}>
                    {staff.compDoc}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Training:</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold ${getComplianceBadgeClass(staff.compTraining)}`}>
                    {staff.compTraining}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border-color)]">
                <button
                  onClick={() => handleEditStaff(staff)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all duration-200 text-xs"
                >
                  <Edit size={14} />
                  <span className="font-medium">Edit</span>
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(staff.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-200 text-xs"
                >
                  <Trash2 size={14} />
                  <span className="font-medium">Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Staff Form Modal */}
      {showAddForm && (
        <AddStaffForm
          onClose={handleCloseForm}
          onSave={editingStaff ? handleUpdateStaff : handleAddStaff}
          editData={editingStaff}
        />
      )}

      {/* Delete Confirmation Modal - Dark mode support */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-secondary rounded-xl shadow-2xl max-w-md w-full p-5 border border-[var(--border-color)]">
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 className="text-red-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Delete Staff Member?</h3>
              <p className="text-secondary mb-5 text-sm">
                Are you sure you want to delete this staff member? This action cannot be undone.
              </p>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-5 py-2 bg-primary border border-[var(--border-color)] text-secondary rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteStaff(showDeleteConfirm)}
                  className="flex-1 px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 transition-all duration-200 font-semibold text-sm shadow-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffList;