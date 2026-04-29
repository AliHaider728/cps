import React, { useState } from 'react';
import { FileText, Search, Eye, Download, Filter, Calendar, User, Activity } from 'lucide-react';
import * as XLSX from 'xlsx';

const LogTab = ({ staffData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const activityLogs = [
    {
      id: 1,
      subject: 'Performance Review Completed - Q4 2025',
      creator: 'Michael Thompson',
      createdDate: '2026-01-25 3:45:22 PM',
      type: 'review'
    },
    {
      id: 2,
      subject: 'Training Module Assigned - Advanced Patient Care',
      creator: 'Sarah Martinez',
      createdDate: '2026-01-24 10:15:30 AM',
      type: 'training'
    },
    {
      id: 3,
      subject: 'Certification Updated - CPR & First Aid',
      creator: 'David Chen',
      createdDate: '2026-01-23 2:30:45 PM',
      type: 'certification'
    },
    {
      id: 4,
      subject: 'Schedule Modified - Week 5 Shifts',
      creator: 'Emma Wilson',
      createdDate: '2026-01-22 9:20:15 AM',
      type: 'schedule'
    },
    {
      id: 5,
      subject: 'Leave Request Approved - Annual Leave',
      creator: 'James Rodriguez',
      createdDate: '2026-01-21 4:55:30 PM',
      type: 'leave'
    },
    {
      id: 6,
      subject: 'Equipment Assigned - Medical Kit #A457',
      creator: 'Lisa Anderson',
      createdDate: '2026-01-20 11:40:12 AM',
      type: 'equipment'
    },
    {
      id: 7,
      subject: 'Document Uploaded - Insurance Policy Update',
      creator: 'Robert Taylor',
      createdDate: '2026-01-19 1:25:50 PM',
      type: 'document'
    },
    {
      id: 8,
      subject: 'Timesheet Submitted - Week 3 January',
      creator: 'Jennifer Lee',
      createdDate: '2026-01-18 5:10:20 PM',
      type: 'timesheet'
    },
    {
      id: 9,
      subject: 'Contact Information Updated - Emergency Contact',
      creator: 'Christopher Brown',
      createdDate: '2026-01-17 10:05:35 AM',
      type: 'update'
    },
    {
      id: 10,
      subject: 'Compliance Training Completed - HIPAA Guidelines',
      creator: 'Amanda Garcia',
      createdDate: '2026-01-16 3:50:18 PM',
      type: 'training'
    },
    {
      id: 11,
      subject: 'Shift Swap Approved - Night Shift Coverage',
      creator: 'Daniel Kim',
      createdDate: '2026-01-15 8:30:45 AM',
      type: 'schedule'
    },
    {
      id: 12,
      subject: 'Expense Report Filed - Medical Supplies',
      creator: 'Patricia White',
      createdDate: '2026-01-14 2:15:22 PM',
      type: 'expense'
    },
    {
      id: 13,
      subject: 'Safety Incident Reported - Near Miss Documentation',
      creator: 'Kevin Johnson',
      createdDate: '2026-01-13 11:20:40 AM',
      type: 'incident'
    },
    {
      id: 14,
      subject: 'Payroll Information Updated - Bank Details',
      creator: 'Michelle Davis',
      createdDate: '2026-01-12 9:55:15 AM',
      type: 'payroll'
    },
    {
      id: 15,
      subject: 'Department Transfer Request - Emergency Department',
      creator: 'Thomas Miller',
      createdDate: '2026-01-11 4:35:50 PM',
      type: 'transfer'
    },
    {
      id: 16,
      subject: 'Performance Goal Set - Patient Satisfaction Score',
      creator: 'Rachel Green',
      createdDate: '2026-01-10 1:45:30 PM',
      type: 'goal'
    },
    {
      id: 17,
      subject: 'Vaccination Record Updated - Annual Flu Shot',
      creator: 'Brandon Scott',
      createdDate: '2026-01-09 10:30:25 AM',
      type: 'health'
    },
    {
      id: 18,
      subject: 'Meeting Scheduled - Team Briefing Q1 2026',
      creator: 'Victoria Adams',
      createdDate: '2026-01-08 3:20:40 PM',
      type: 'meeting'
    },
    {
      id: 19,
      subject: 'Policy Acknowledgment - Updated Attendance Policy',
      creator: 'Gregory Hall',
      createdDate: '2026-01-07 11:15:55 AM',
      type: 'policy'
    },
    {
      id: 20,
      subject: 'Professional Development - Conference Registration',
      creator: 'Stephanie Clark',
      createdDate: '2026-01-06 2:40:10 PM',
      type: 'development'
    }
  ];

  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = log.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.creator.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || log.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getActivityIcon = (type) => {
    const iconProps = { size: 18 };
    switch(type) {
      case 'document':
        return <FileText {...iconProps} className="text-core-primary-500" />;
      case 'training':
        return <Activity {...iconProps} className="text-blue-500" />;
      case 'leave':
        return <Calendar {...iconProps} className="text-yellow-500" />;
      case 'update':
        return <User {...iconProps} className="text-green-500" />;
      case 'timesheet':
        return <FileText {...iconProps} className="text-purple-500" />;
      case 'expense':
        return <FileText {...iconProps} className="text-orange-500" />;
      case 'certification':
        return <FileText {...iconProps} className="text-teal-500" />;
      case 'schedule':
        return <Calendar {...iconProps} className="text-indigo-500" />;
      case 'equipment':
        return <Activity {...iconProps} className="text-cyan-500" />;
      case 'incident':
        return <FileText {...iconProps} className="text-red-500" />;
      case 'payroll':
        return <FileText {...iconProps} className="text-emerald-500" />;
      case 'transfer':
        return <User {...iconProps} className="text-violet-500" />;
      case 'goal':
        return <Activity {...iconProps} className="text-pink-500" />;
      case 'health':
        return <Activity {...iconProps} className="text-rose-500" />;
      case 'meeting':
        return <Calendar {...iconProps} className="text-amber-500" />;
      case 'policy':
        return <FileText {...iconProps} className="text-slate-500" />;
      case 'development':
        return <Activity {...iconProps} className="text-fuchsia-500" />;
      case 'review':
        return <FileText {...iconProps} className="text-lime-500" />;
      default:
        return <FileText {...iconProps} className="text-core-primary-500" />;
    }
  };

  const getTypeBadgeColor = (type) => {
    const colors = {
      document: 'bg-core-primary-100 text-core-primary-700 border-core-primary-200',
      training: 'bg-blue-100 text-blue-700 border-blue-200',
      leave: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      update: 'bg-green-100 text-green-700 border-green-200',
      timesheet: 'bg-purple-100 text-purple-700 border-purple-200',
      expense: 'bg-orange-100 text-orange-700 border-orange-200',
      certification: 'bg-teal-100 text-teal-700 border-teal-200',
      schedule: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      equipment: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      incident: 'bg-red-100 text-red-700 border-red-200',
      payroll: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      transfer: 'bg-violet-100 text-violet-700 border-violet-200',
      goal: 'bg-pink-100 text-pink-700 border-pink-200',
      health: 'bg-rose-100 text-rose-700 border-rose-200',
      meeting: 'bg-amber-100 text-amber-700 border-amber-200',
      policy: 'bg-slate-100 text-slate-700 border-slate-200',
      development: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
      review: 'bg-lime-100 text-lime-700 border-lime-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Export to Excel
  const handleExport = () => {
    const exportData = filteredLogs.map(log => ({
      'Subject': log.subject,
      'Creator': log.creator,
      'Created Date': log.createdDate,
      'Type': log.type.charAt(0).toUpperCase() + log.type.slice(1)
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Activity Logs');
    
    // Set column widths
    ws['!cols'] = [
      { wch: 50 },
      { wch: 25 },
      { wch: 25 },
      { wch: 15 }
    ];

    XLSX.writeFile(wb, `${staffData?.name || 'Staff'}_Activity_Logs.xlsx`);
  };

  // Get unique activity types for filter
  const activityTypes = ['all', ...new Set(activityLogs.map(log => log.type))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary">Activity Log</h2>
          <p className="text-secondary text-sm mt-1">View all activities and changes for this staff member</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-sm"
        >
          <Download size={16} />
          <span className="font-medium">Export</span>
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="Search activity logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-primary border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-core-primary-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-48 pl-10 pr-4 py-2.5 bg-primary border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-core-primary-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
          >
            <option value="all">All Activities</option>
            {activityTypes.slice(1).map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-core-primary-50 border border-core-primary-200 rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-core-primary-600">
            {activityLogs.filter(l => l.type === 'document').length}
          </div>
          <div className="text-xs text-core-primary-700 mt-1 font-medium">Documents</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-blue-600">
            {activityLogs.filter(l => l.type === 'training').length}
          </div>
          <div className="text-xs text-blue-700 mt-1 font-medium">Training</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-yellow-600">
            {activityLogs.filter(l => l.type === 'leave').length}
          </div>
          <div className="text-xs text-yellow-700 mt-1 font-medium">Leaves</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-green-600">
            {activityLogs.filter(l => l.type === 'update').length}
          </div>
          <div className="text-xs text-green-700 mt-1 font-medium">Updates</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-purple-600">
            {activityLogs.filter(l => l.type === 'timesheet').length}
          </div>
          <div className="text-xs text-purple-700 mt-1 font-medium">Timesheets</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-orange-600">
            {activityLogs.filter(l => l.type === 'expense').length}
          </div>
          <div className="text-xs text-orange-700 mt-1 font-medium">Expenses</div>
        </div>
      </div>

      {/* Activity Log Table */}
      {filteredLogs.length > 0 ? (
        <div className="bg-primary rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-core-primary-50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Subject</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Creator</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Created Date</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-primary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-core-primary-50/30 transition-colors duration-150">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {getActivityIcon(log.type)}
                        <span className="text-primary font-medium">{log.subject}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getTypeBadgeColor(log.type)}`}>
                        {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-core-primary-100 flex items-center justify-center">
                          <User size={16} className="text-core-primary-600" />
                        </div>
                        <span className="text-secondary font-medium">{log.creator}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-secondary text-sm">{log.createdDate}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <button
                          className="p-2 text-muted hover:text-core-primary-500 hover:bg-core-primary-50 rounded-lg transition-all duration-200"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-primary rounded-xl border border-border p-12 text-center">
          <div className="w-20 h-20 bg-core-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="text-core-primary-500" size={40} />
          </div>
          <h3 className="text-xl font-semibold text-primary mb-2">No Activity Logs Found</h3>
          <p className="text-secondary">
            {searchTerm || filterType !== 'all' 
              ? 'No activity logs match your search or filter criteria' 
              : 'No activity logs found for this staff member'}
          </p>
        </div>
      )}
    </div>
  );
};

export default LogTab;
