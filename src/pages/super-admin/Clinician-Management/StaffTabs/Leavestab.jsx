import React, { useState } from 'react';
import { Umbrella, Plus, Edit2, Trash2, Download, Search, Calendar, Clock, X, Save, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';

const LeavesTab = ({ staffData }) => {
  const [leaves, setLeaves] = useState([
    {
      id: 1,
      leaveType: 'Annual Leave',
      startDate: '2026-02-10',
      endDate: '2026-02-14',
      days: 5,
      status: 'Approved',
      reason: 'Family vacation',
      appliedDate: '2026-01-15',
      approvedBy: 'Arslan Shahroz',
      notes: 'Approved with coverage arranged'
    },
    {
      id: 2,
      leaveType: 'Sick Leave',
      startDate: '2026-01-20',
      endDate: '2026-01-22',
      days: 3,
      status: 'Approved',
      reason: 'Medical appointment and recovery',
      appliedDate: '2026-01-19',
      approvedBy: 'Stephen Elliott',
      notes: 'Medical certificate provided'
    },
    {
      id: 3,
      leaveType: 'Annual Leave',
      startDate: '2026-03-05',
      endDate: '2026-03-07',
      days: 3,
      status: 'Pending',
      reason: 'Personal matters',
      appliedDate: '2026-01-25',
      approvedBy: '-',
      notes: 'Awaiting manager approval'
    },
    {
      id: 4,
      leaveType: 'Emergency Leave',
      startDate: '2026-01-10',
      endDate: '2026-01-10',
      days: 1,
      status: 'Approved',
      reason: 'Family emergency',
      appliedDate: '2026-01-10',
      approvedBy: 'Arslan Shahroz',
      notes: 'Emergency approved same day'
    },
    {
      id: 5,
      leaveType: 'Unpaid Leave',
      startDate: '2026-04-01',
      endDate: '2026-04-05',
      days: 5,
      status: 'Rejected',
      reason: 'Extended personal time',
      appliedDate: '2026-01-20',
      approvedBy: 'Stephen Elliott',
      notes: 'Insufficient coverage available'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);
  const [formData, setFormData] = useState({
    leaveType: 'Annual Leave',
    startDate: '',
    endDate: '',
    reason: '',
    notes: ''
  });

  const leaveTypes = ['Annual Leave', 'Sick Leave', 'Emergency Leave', 'Unpaid Leave', 'Maternity Leave', 'Paternity Leave'];

  // Calculate days between dates
  const calculateDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Filter leaves
  const filteredLeaves = leaves.filter(leave =>
    leave.leaveType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leave.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leave.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add new leave
  const handleAdd = () => {
    if (!formData.startDate || !formData.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    const days = calculateDays(formData.startDate, formData.endDate);
    const newLeave = {
      id: Math.max(...leaves.map(l => l.id), 0) + 1,
      ...formData,
      days,
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0],
      approvedBy: '-',
    };

    setLeaves([...leaves, newLeave]);
    resetForm();
  };

  // Update leave
  const handleUpdate = () => {
    if (!formData.startDate || !formData.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    const days = calculateDays(formData.startDate, formData.endDate);
    setLeaves(leaves.map(leave =>
      leave.id === editingLeave.id
        ? { ...leave, ...formData, days }
        : leave
    ));
    resetForm();
  };

  // Delete leave
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this leave request?')) {
      setLeaves(leaves.filter(leave => leave.id !== id));
    }
  };

  // Edit leave
  const handleEdit = (leave) => {
    setEditingLeave(leave);
    setFormData({
      leaveType: leave.leaveType,
      startDate: leave.startDate,
      endDate: leave.endDate,
      reason: leave.reason,
      notes: leave.notes
    });
    setShowModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      leaveType: 'Annual Leave',
      startDate: '',
      endDate: '',
      reason: '',
      notes: ''
    });
    setEditingLeave(null);
    setShowModal(false);
  };

  // Export to Excel
  const handleExport = () => {
    const exportData = leaves.map(leave => ({
      'Leave Type': leave.leaveType,
      'Start Date': leave.startDate,
      'End Date': leave.endDate,
      'Days': leave.days,
      'Status': leave.status,
      'Reason': leave.reason,
      'Applied Date': leave.appliedDate,
      'Approved By': leave.approvedBy,
      'Notes': leave.notes
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leave Requests');
    
    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 6 }, { wch: 10 },
      { wch: 30 }, { wch: 12 }, { wch: 15 }, { wch: 30 }
    ];

    XLSX.writeFile(wb, `${staffData?.name || 'Staff'}_Leave_Requests.xlsx`);
  };

  // Calculate statistics
  const stats = {
    total: leaves.length,
    approved: leaves.filter(l => l.status === 'Approved').length,
    pending: leaves.filter(l => l.status === 'Pending').length,
    rejected: leaves.filter(l => l.status === 'Rejected').length,
    totalDays: leaves.filter(l => l.status === 'Approved').reduce((sum, l) => sum + l.days, 0)
  };

  // Mobile Card Component
  const LeaveCard = ({ leave }) => (
    <div className="bg-primary border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Umbrella size={14} className="text-core-primary-500 flex-shrink-0" />
            <h3 className="font-semibold text-sm text-primary truncate">{leave.leaveType}</h3>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(leave.status)}`}>
              {leave.status}
            </span>
            <span className="text-xs text-secondary">{leave.days} days</span>
          </div>
        </div>
        <div className="flex gap-1 ml-2 flex-shrink-0">
          <button
            onClick={() => handleEdit(leave)}
            className="p-1.5 text-core-primary-500 hover:bg-core-primary-50 rounded-lg transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => handleDelete(leave.id)}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-secondary">Start:</span>
          <span className="text-primary font-medium">{leave.startDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-secondary">End:</span>
          <span className="text-primary font-medium">{leave.endDate}</span>
        </div>
        <div className="pt-2 border-t border-border">
          <p className="text-secondary line-clamp-2">{leave.reason}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-primary">Leave Management</h2>
          <p className="text-secondary text-xs sm:text-sm mt-1">View and manage staff leave requests</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-sm text-sm"
          >
            <Download size={16} />
            <span className="font-medium">Export</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-core-primary-500 text-white rounded-lg hover:bg-core-primary-600 transition-colors duration-200 shadow-sm text-sm"
          >
            <Plus size={16} />
            <span className="font-medium">Add Leave</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4">
        <div className="bg-primary rounded-lg sm:rounded-xl border border-border p-3 sm:p-4 hover:shadow-md transition-shadow">
          <div className="text-xl sm:text-2xl font-bold text-core-primary-500">{stats.total}</div>
          <div className="text-xs sm:text-sm text-secondary mt-1">Total Requests</div>
        </div>
        <div className="bg-green-50 rounded-lg sm:rounded-xl border border-green-200 p-3 sm:p-4 hover:shadow-md transition-shadow">
          <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.approved}</div>
          <div className="text-xs sm:text-sm text-green-700 mt-1">Approved</div>
        </div>
        <div className="bg-yellow-50 rounded-lg sm:rounded-xl border border-yellow-200 p-3 sm:p-4 hover:shadow-md transition-shadow">
          <div className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-xs sm:text-sm text-yellow-700 mt-1">Pending</div>
        </div>
        <div className="bg-red-50 rounded-lg sm:rounded-xl border border-red-200 p-3 sm:p-4 hover:shadow-md transition-shadow">
          <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-xs sm:text-sm text-red-700 mt-1">Rejected</div>
        </div>
        <div className="bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200 p-3 sm:p-4 hover:shadow-md transition-shadow">
          <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.totalDays}</div>
          <div className="text-xs sm:text-sm text-blue-700 mt-1">Days Approved</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
        <input
          type="text"
          placeholder="Search by leave type, reason, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-sm sm:text-base text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-core-primary-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      {/* Leaves Content */}
      {filteredLeaves.length > 0 ? (
        <>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {filteredLeaves.map((leave) => (
              <LeaveCard key={leave.id} leave={leave} />
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-primary rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-core-primary-50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Leave Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Start Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">End Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Days</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Reason</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Applied Date</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLeaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-core-primary-50/30 transition-colors duration-150">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Umbrella size={16} className="text-core-primary-500" />
                          <span className="font-medium text-primary">{leave.leaveType}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-secondary">{leave.startDate}</td>
                      <td className="px-4 py-3 text-secondary">{leave.endDate}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-primary">{leave.days}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(leave.status)}`}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-secondary max-w-xs truncate" title={leave.reason}>
                        {leave.reason}
                      </td>
                      <td className="px-4 py-3 text-secondary text-sm">{leave.appliedDate}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(leave)}
                            className="p-2 text-core-primary-500 hover:bg-core-primary-50 rounded-lg transition-all duration-200"
                            title="Edit Leave"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(leave.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Delete Leave"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-primary rounded-xl border border-border p-8 sm:p-12 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-core-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Umbrella className="text-core-primary-500" size={32} />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2">No Leave Requests Found</h3>
          <p className="text-sm sm:text-base text-secondary mb-6">
            {searchTerm ? 'No leave requests match your search criteria' : 'No leave requests found for this staff member'}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2.5 bg-core-primary-500 text-white rounded-lg hover:bg-core-primary-600 transition-colors duration-200 text-sm sm:text-base"
          >
            Add New Leave Request
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-secondary rounded-xl shadow-2xl max-w-2xl w-full my-4">
            <div className="sticky top-0 bg-secondary border-b border-border px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-xl">
              <h3 className="text-lg sm:text-xl font-bold text-primary">
                {editingLeave ? 'Edit Leave Request' : 'Add Leave Request'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-primary rounded-lg transition-colors"
              >
                <X size={20} className="text-secondary" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 max-h-[calc(90vh-140px)] overflow-y-auto">
              {/* Leave Type */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Leave Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-sm sm:text-base text-primary focus:outline-none focus:ring-2 focus:ring-core-primary-500"
                >
                  {leaveTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-sm sm:text-base text-primary focus:outline-none focus:ring-2 focus:ring-core-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-sm sm:text-base text-primary focus:outline-none focus:ring-2 focus:ring-core-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Days Calculation */}
              {formData.startDate && formData.endDate && (
                <div className="bg-core-primary-50 border border-core-primary-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-core-primary-700">
                    <Clock size={16} />
                    <span className="font-medium text-sm">
                      Duration: {calculateDays(formData.startDate, formData.endDate)} days
                    </span>
                  </div>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                  placeholder="Please provide a reason for your leave request..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-sm sm:text-base text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-core-primary-500 resize-none"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  placeholder="Any additional information..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-sm sm:text-base text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-core-primary-500 resize-none"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-secondary border-t border-border px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3 rounded-b-xl">
              <button
                onClick={resetForm}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-secondary hover:bg-core-primary-50 hover:text-core-primary-500 hover:border-core-primary-500 transition-all duration-200 text-sm sm:text-base"
              >
                <X size={18} />
                <span className="font-medium">Cancel</span>
              </button>
              <button
                onClick={editingLeave ? handleUpdate : handleAdd}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-core-primary-500 text-white rounded-lg hover:bg-core-primary-600 transition-colors duration-200 shadow-sm text-sm sm:text-base"
              >
                <Save size={18} />
                <span className="font-medium">{editingLeave ? 'Update' : 'Add'} Leave</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeavesTab;