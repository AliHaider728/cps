import React, { useState } from 'react';
import { Plus, Trash2, Search, Download, Edit2, X, Check, Calendar, Clock, DollarSign, Briefcase, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';

const TimesheetTab = ({ staffData }) => {
  const [activeSubTab, setActiveSubTab] = useState('project-mapping');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('');

  // Project Mappings State
  const [projectMappings, setProjectMappings] = useState([
    { id: 1, project: 'Primary Care Consultation', practice: 'Riverside Medical Center', type: 'Contract', rate: '52.00', rateType: 'Hourly', vat: '20.00' },
    { id: 2, project: 'Emergency Response Unit', practice: 'City Hospital', type: 'Paye', rate: '48.50', rateType: 'Hourly', vat: '0.00' },
    { id: 3, project: 'Mental Health Assessment', practice: 'Wellness Clinic', type: 'Contract', rate: '65.00', rateType: 'Hourly', vat: '20.00' },
    { id: 4, project: 'Pediatric Care Services', practice: 'Children\'s Health Center', type: 'Paye', rate: '55.00', rateType: 'Hourly', vat: '0.00' },
    { id: 5, project: 'Geriatric Home Visits', practice: 'Community Care', type: 'Contract', rate: '58.00', rateType: 'Hourly', vat: '20.00' },
    { id: 6, project: 'Vaccination Program', practice: 'Public Health Department', type: 'Paye', rate: '42.00', rateType: 'Hourly', vat: '0.00' },
    { id: 7, project: 'Chronic Disease Management', practice: 'Health Plus Clinic', type: 'Contract', rate: '60.00', rateType: 'Hourly', vat: '20.00' },
    { id: 8, project: 'Surgical Assistance', practice: 'Metropolitan Hospital', type: 'Paye', rate: '70.00', rateType: 'Hourly', vat: '0.00' },
  ]);

  // Timesheet Entries State
  const [timesheetEntries, setTimesheetEntries] = useState([
    { id: 1, date: '2026-01-20', project: 'Primary Care Consultation', practice: 'Riverside Medical Center', hours: 8.0, status: 'Approved', approver: 'Dr. Emily Parker' },
    { id: 2, date: '2026-01-21', project: 'Emergency Response Unit', practice: 'City Hospital', hours: 6.5, status: 'Pending', approver: '-' },
    { id: 3, date: '2026-01-22', project: 'Mental Health Assessment', practice: 'Wellness Clinic', hours: 5.0, status: 'Approved', approver: 'Dr. Marcus Liu' },
    { id: 4, date: '2026-01-23', project: 'Pediatric Care Services', practice: 'Children\'s Health Center', hours: 7.5, status: 'Approved', approver: 'Dr. Sarah Johnson' },
    { id: 5, date: '2026-01-24', project: 'Geriatric Home Visits', practice: 'Community Care', hours: 4.5, status: 'Rejected', approver: 'Dr. Robert Chen' },
    { id: 6, date: '2026-01-25', project: 'Vaccination Program', practice: 'Public Health Department', hours: 6.0, status: 'Pending', approver: '-' },
    { id: 7, date: '2026-01-26', project: 'Chronic Disease Management', practice: 'Health Plus Clinic', hours: 8.0, status: 'Approved', approver: 'Dr. Jennifer Adams' },
    { id: 8, date: '2026-01-27', project: 'Surgical Assistance', practice: 'Metropolitan Hospital', hours: 10.0, status: 'Approved', approver: 'Dr. Michael Ross' },
  ]);

  // Expenses State
  const [expenses, setExpenses] = useState([
    { id: 1, date: '2026-01-20', description: 'Transportation - Home to Riverside Medical', category: 'Transport', amount: '28.50', status: 'Approved' },
    { id: 2, date: '2026-01-21', description: 'Medical Conference Registration', category: 'Professional Development', amount: '150.00', status: 'Pending' },
    { id: 3, date: '2026-01-22', description: 'Parking - Wellness Clinic', category: 'Parking', amount: '12.00', status: 'Approved' },
    { id: 4, date: '2026-01-23', description: 'Medical Equipment Purchase', category: 'Equipment', amount: '85.75', status: 'Approved' },
    { id: 5, date: '2026-01-24', description: 'Mileage Reimbursement - 62 miles', category: 'Mileage', amount: '27.90', status: 'Approved' },
    { id: 6, date: '2026-01-25', description: 'Professional Journal Subscription', category: 'Professional Development', amount: '45.00', status: 'Pending' },
    { id: 7, date: '2026-01-26', description: 'Client Meeting Lunch', category: 'Meals', amount: '22.50', status: 'Approved' },
    { id: 8, date: '2026-01-27', description: 'Taxi - Emergency Call', category: 'Transport', amount: '35.00', status: 'Pending' },
  ]);

  const [formData, setFormData] = useState({});

  // Helper Functions
  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // CRUD Operations for Projects
  const handleAddProject = () => {
    if (!formData.project || !formData.practice || !formData.type || !formData.rate || !formData.rateType || formData.vat === undefined) {
      alert('Please fill in all required fields');
      return;
    }
    const newProject = {
      id: Math.max(...projectMappings.map(p => p.id), 0) + 1,
      ...formData
    };
    setProjectMappings([...projectMappings, newProject]);
    setShowAddModal(false);
    setFormData({});
  };

  const handleDeleteProject = (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjectMappings(projectMappings.filter(p => p.id !== id));
    }
  };

  // CRUD Operations for Timesheet
  const handleAddTimesheet = () => {
    if (!formData.date || !formData.project || !formData.practice || !formData.hours) {
      alert('Please fill in all required fields');
      return;
    }
    const newEntry = {
      id: Math.max(...timesheetEntries.map(t => t.id), 0) + 1,
      ...formData,
      status: 'Pending',
      approver: '-'
    };
    setTimesheetEntries([...timesheetEntries, newEntry]);
    setShowAddModal(false);
    setFormData({});
  };

  const handleDeleteTimesheet = (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      setTimesheetEntries(timesheetEntries.filter(t => t.id !== id));
    }
  };

  // CRUD Operations for Expenses
  const handleAddExpense = () => {
    if (!formData.date || !formData.description || !formData.category || !formData.amount) {
      alert('Please fill in all required fields');
      return;
    }
    const newExpense = {
      id: Math.max(...expenses.map(e => e.id), 0) + 1,
      ...formData,
      status: 'Pending'
    };
    setExpenses([...expenses, newExpense]);
    setShowAddModal(false);
    setFormData({});
  };

  const handleDeleteExpense = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  // Export to Excel
  const handleExport = () => {
    let exportData = [];
    let sheetName = '';
    let filename = '';

    if (activeSubTab === 'project-mapping') {
      exportData = projectMappings.map(p => ({
        'Project': p.project,
        'Practice': p.practice,
        'Type': p.type,
        'Rate': `£${p.rate}`,
        'Rate Type': p.rateType,
        'VAT %': `${p.vat}%`
      }));
      sheetName = 'Project Mappings';
      filename = `${staffData?.name || 'Staff'}_Project_Mappings.xlsx`;
    } else if (activeSubTab === 'timesheet') {
      exportData = timesheetEntries.map(t => ({
        'Date': t.date,
        'Project': t.project,
        'Practice': t.practice,
        'Hours': t.hours,
        'Status': t.status,
        'Approver': t.approver
      }));
      sheetName = 'Timesheet Entries';
      filename = `${staffData?.name || 'Staff'}_Timesheet_Entries.xlsx`;
    } else if (activeSubTab === 'expenses') {
      exportData = expenses.map(e => ({
        'Date': e.date,
        'Description': e.description,
        'Category': e.category,
        'Amount': `£${e.amount}`,
        'Status': e.status
      }));
      sheetName = 'Expenses';
      filename = `${staffData?.name || 'Staff'}_Expenses.xlsx`;
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Set column widths
    if (activeSubTab === 'project-mapping') {
      ws['!cols'] = [
        { wch: 30 }, { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 }
      ];
    } else if (activeSubTab === 'timesheet') {
      ws['!cols'] = [
        { wch: 12 }, { wch: 30 }, { wch: 30 }, { wch: 8 }, { wch: 12 }, { wch: 25 }
      ];
    } else if (activeSubTab === 'expenses') {
      ws['!cols'] = [
        { wch: 12 }, { wch: 40 }, { wch: 20 }, { wch: 12 }, { wch: 12 }
      ];
    }

    XLSX.writeFile(wb, filename);
  };

  // Search functionality
  const getFilteredData = () => {
    if (activeSubTab === 'project-mapping') {
      return projectMappings.filter(p =>
        p.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.practice.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else if (activeSubTab === 'timesheet') {
      return timesheetEntries.filter(t =>
        t.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.practice.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else if (activeSubTab === 'expenses') {
      return expenses.filter(e =>
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return [];
  };

  // Mobile Card Components
  const ProjectCard = ({ project }) => (
    <div className="bg-primary border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-primary text-sm sm:text-base truncate">{project.project}</h3>
          <p className="text-xs sm:text-sm text-secondary truncate mt-0.5">{project.practice}</p>
        </div>
        <button
          onClick={() => handleDeleteProject(project.id)}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2 flex-shrink-0"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
        <div>
          <span className="text-secondary">Type:</span>
          <span className={`ml-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
            project.type === 'Paye' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-purple-100 text-purple-700 border-purple-200'
          }`}>
            {project.type}
          </span>
        </div>
        <div>
          <span className="text-secondary">Rate:</span>
          <span className="ml-1.5 font-semibold text-primary">£{project.rate}</span>
        </div>
        <div>
          <span className="text-secondary">Rate Type:</span>
          <span className="ml-1.5 text-primary">{project.rateType}</span>
        </div>
        <div>
          <span className="text-secondary">VAT:</span>
          <span className="ml-1.5 text-primary">{project.vat}%</span>
        </div>
      </div>
    </div>
  );

  const TimesheetCard = ({ entry }) => (
    <div className="bg-primary border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs sm:text-sm font-medium text-secondary">{entry.date}</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(entry.status)}`}>
              {entry.status}
            </span>
          </div>
          <h3 className="font-semibold text-primary text-sm sm:text-base truncate">{entry.project}</h3>
          <p className="text-xs sm:text-sm text-secondary truncate">{entry.practice}</p>
        </div>
        <button
          onClick={() => handleDeleteTimesheet(entry.id)}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2 flex-shrink-0"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t border-border">
        <div>
          <span className="text-secondary">Hours:</span>
          <span className="ml-1.5 font-bold text-core-primary-500">{entry.hours}</span>
        </div>
        <div className="text-right">
          <span className="text-secondary">Approver:</span>
          <p className="text-primary font-medium truncate max-w-[150px]">{entry.approver}</p>
        </div>
      </div>
    </div>
  );

  const ExpenseCard = ({ expense }) => (
    <div className="bg-primary border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs sm:text-sm font-medium text-secondary">{expense.date}</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(expense.status)}`}>
              {expense.status}
            </span>
          </div>
          <h3 className="font-semibold text-primary text-sm sm:text-base line-clamp-2">{expense.description}</h3>
        </div>
        <button
          onClick={() => handleDeleteExpense(expense.id)}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2 flex-shrink-0"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t border-border">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border bg-violet-100 text-violet-700 border-violet-200">
          {expense.category}
        </span>
        <span className="font-bold text-core-primary-500 text-base">£{expense.amount}</span>
      </div>
    </div>
  );

  // Modal Component
  const Modal = ({ onClose, onSave, type }) => {
    const renderFields = () => {
      if (type === 'project') {
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-primary mb-2">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter project name"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-primary text-sm sm:text-base placeholder-muted focus:outline-none focus:ring-2 focus:ring-core-primary-500"
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-primary mb-2">
                Practice <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter practice name"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-primary text-sm sm:text-base placeholder-muted focus:outline-none focus:ring-2 focus:ring-core-primary-500"
                onChange={(e) => setFormData({ ...formData, practice: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-primary text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-core-primary-500"
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="">Select Type</option>
                <option value="Paye">Paye</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Rate Type <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-primary text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-core-primary-500"
                onChange={(e) => setFormData({ ...formData, rateType: e.target.value })}
              >
                <option value="">Select Rate Type</option>
                <option value="Hourly">Hourly</option>
                <option value="Daily">Daily</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Rate (£) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-primary text-sm sm:text-base placeholder-muted focus:outline-none focus:ring-2 focus:ring-core-primary-500"
                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                VAT % <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-primary text-sm sm:text-base placeholder-muted focus:outline-none focus:ring-2 focus:ring-core-primary-500"
                onChange={(e) => setFormData({ ...formData, vat: e.target.value })}
              />
            </div>
          </div>
        );
      } else if (type === 'timesheet') {
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-primary text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-core-primary-500"
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Hours <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="0.0"
                step="0.5"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-primary text-sm sm:text-base placeholder-muted focus:outline-none focus:ring-2 focus:ring-core-primary-500"
                onChange={(e) => setFormData({ ...formData, hours: parseFloat(e.target.value) })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-primary mb-2">
                Project <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter project name"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-primary text-sm sm:text-base placeholder-muted focus:outline-none focus:ring-2 focus:ring-core-primary-500"
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-primary mb-2">
                Practice <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter practice name"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-primary text-sm sm:text-base placeholder-muted focus:outline-none focus:ring-2 focus:ring-core-primary-500"
                onChange={(e) => setFormData({ ...formData, practice: e.target.value })}
              />
            </div>
          </div>
        );
      } else if (type === 'expense') {
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-primary text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-core-primary-500"
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Amount (£) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-primary text-sm sm:text-base placeholder-muted focus:outline-none focus:ring-2 focus:ring-core-primary-500"
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-primary mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter expense description"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-primary text-sm sm:text-base placeholder-muted focus:outline-none focus:ring-2 focus:ring-core-primary-500"
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-primary mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-primary text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-core-primary-500"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Select Category</option>
                <option value="Transport">Transport</option>
                <option value="Parking">Parking</option>
                <option value="Mileage">Mileage</option>
                <option value="Meals">Meals</option>
                <option value="Equipment">Equipment</option>
                <option value="Professional Development">Professional Development</option>
              </select>
            </div>
          </div>
        );
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
        <div className="bg-secondary rounded-xl shadow-2xl max-w-3xl w-full my-4">
          <div className="sticky top-0 bg-secondary border-b border-border px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-xl">
            <h3 className="text-lg sm:text-xl font-bold text-primary">
              Add New {type === 'project' ? 'Project' : type === 'timesheet' ? 'Entry' : 'Expense'}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-primary rounded-lg transition-colors">
              <X size={20} className="text-secondary" />
            </button>
          </div>
          <div className="p-4 sm:p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
            {renderFields()}
          </div>
          <div className="sticky bottom-0 bg-secondary border-t border-border px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3 rounded-b-xl">
            <button
              onClick={onClose}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-secondary hover:bg-core-primary-50 hover:text-core-primary-500 hover:border-core-primary-500 transition-all duration-200 text-sm sm:text-base"
            >
              <X size={18} />
              <span className="font-medium">Cancel</span>
            </button>
            <button
              onClick={onSave}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-core-primary-500 text-white rounded-lg hover:bg-core-primary-600 transition-colors duration-200 shadow-sm text-sm sm:text-base"
            >
              <Check size={18} />
              <span className="font-medium">Add {type === 'project' ? 'Project' : type === 'timesheet' ? 'Entry' : 'Expense'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const filteredData = getFilteredData();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-primary">Timesheet Management</h2>
        <p className="text-secondary text-xs sm:text-sm">Track projects, hours, and expenses efficiently</p>
      </div>

      {/* Sub Tabs */}
      <div className="border-b border-border -mx-3 sm:mx-0">
        <div className="flex gap-1 overflow-x-auto px-3 sm:px-0 scrollbar-hide">
          {[
            { id: 'project-mapping', label: 'Projects', icon: Briefcase, shortLabel: 'Projects' },
            { id: 'timesheet', label: 'Timesheet', icon: Clock, shortLabel: 'Hours' },
            { id: 'expenses', label: 'Expenses', icon: DollarSign, shortLabel: 'Expenses' }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 font-semibold text-xs sm:text-sm whitespace-nowrap border-b-2 transition-all duration-200 ${
                  activeSubTab === tab.id
                    ? 'border-core-primary-500 text-core-primary-500 bg-core-primary-50'
                    : 'border-transparent text-secondary hover:text-core-primary-500 hover:bg-core-primary-50/50'
                }`}
              >
                <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input
            type="text"
            placeholder={`Search ${activeSubTab === 'project-mapping' ? 'projects' : activeSubTab === 'timesheet' ? 'entries' : 'expenses'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-primary text-sm sm:text-base placeholder-muted focus:outline-none focus:ring-2 focus:ring-core-primary-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={handleExport}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-sm text-sm sm:text-base"
          >
            <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="font-medium">Export</span>
          </button>
          <button
            onClick={() => { setShowAddModal(true); setModalType(activeSubTab === 'project-mapping' ? 'project' : activeSubTab === 'timesheet' ? 'timesheet' : 'expense'); }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-core-primary-500 text-white rounded-lg hover:bg-core-primary-600 transition-colors duration-200 shadow-sm text-sm sm:text-base"
          >
            <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="font-medium hidden sm:inline">Add {activeSubTab === 'project-mapping' ? 'Project' : activeSubTab === 'timesheet' ? 'Entry' : 'Expense'}</span>
            <span className="font-medium sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Project Mapping Content */}
      {activeSubTab === 'project-mapping' && (
        <div className="space-y-4">
          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-core-primary-50 border border-core-primary-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow">
              <div className="text-xl sm:text-2xl font-bold text-core-primary-600">{projectMappings.length}</div>
              <div className="text-xs sm:text-sm text-core-primary-700 mt-1">Total Projects</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                {projectMappings.filter(p => p.type === 'Paye').length}
              </div>
              <div className="text-xs sm:text-sm text-blue-700 mt-1">PAYE Projects</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">
                {projectMappings.filter(p => p.type === 'Contract').length}
              </div>
              <div className="text-xs sm:text-sm text-purple-700 mt-1">Contract Projects</div>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {filteredData.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-primary rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-core-primary-50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Project</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Practice</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Rate</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Rate Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">VAT %</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredData.map((mapping) => (
                    <tr key={mapping.id} className="hover:bg-core-primary-50/30 transition-colors duration-150">
                      <td className="px-4 py-3 text-primary font-medium">{mapping.project}</td>
                      <td className="px-4 py-3 text-secondary">{mapping.practice}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          mapping.type === 'Paye' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-purple-100 text-purple-700 border-purple-200'
                        }`}>
                          {mapping.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-primary font-semibold">£{mapping.rate}</td>
                      <td className="px-4 py-3 text-secondary">{mapping.rateType}</td>
                      <td className="px-4 py-3 text-secondary">{mapping.vat}%</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => handleDeleteProject(mapping.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Delete Project"
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
        </div>
      )}

      {/* Timesheet Content */}
      {activeSubTab === 'timesheet' && (
        <div className="space-y-4">
          {/* Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <div className="bg-core-primary-50 border border-core-primary-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow">
              <div className="text-xl sm:text-2xl font-bold text-core-primary-600">
                {timesheetEntries.reduce((sum, e) => sum + e.hours, 0).toFixed(1)}
              </div>
              <div className="text-xs sm:text-sm text-core-primary-700 mt-1">Total Hours</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow">
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {timesheetEntries.filter(e => e.status === 'Approved').reduce((sum, e) => sum + e.hours, 0).toFixed(1)}
              </div>
              <div className="text-xs sm:text-sm text-green-700 mt-1">Approved</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow">
              <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                {timesheetEntries.filter(e => e.status === 'Pending').reduce((sum, e) => sum + e.hours, 0).toFixed(1)}
              </div>
              <div className="text-xs sm:text-sm text-yellow-700 mt-1">Pending</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow">
              <div className="text-xl sm:text-2xl font-bold text-red-600">
                {timesheetEntries.filter(e => e.status === 'Rejected').reduce((sum, e) => sum + e.hours, 0).toFixed(1)}
              </div>
              <div className="text-xs sm:text-sm text-red-700 mt-1">Rejected</div>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {filteredData.map((entry) => (
              <TimesheetCard key={entry.id} entry={entry} />
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-primary rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-core-primary-50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Project</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Practice</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Hours</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Approver</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredData.map((entry) => (
                    <tr key={entry.id} className="hover:bg-core-primary-50/30 transition-colors duration-150">
                      <td className="px-4 py-3 text-primary font-medium">{entry.date}</td>
                      <td className="px-4 py-3 text-secondary">{entry.project}</td>
                      <td className="px-4 py-3 text-secondary">{entry.practice}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-primary">{entry.hours}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(entry.status)}`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-secondary">{entry.approver}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => handleDeleteTimesheet(entry.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Delete Entry"
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
        </div>
      )}

      {/* Expenses Content */}
      {activeSubTab === 'expenses' && (
        <div className="space-y-4">
          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-core-primary-50 border border-core-primary-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow">
              <div className="text-xl sm:text-2xl font-bold text-core-primary-600">
                £{expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0).toFixed(2)}
              </div>
              <div className="text-xs sm:text-sm text-core-primary-700 mt-1">Total Expenses</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow">
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                £{expenses.filter(e => e.status === 'Approved').reduce((sum, e) => sum + parseFloat(e.amount), 0).toFixed(2)}
              </div>
              <div className="text-xs sm:text-sm text-green-700 mt-1">Approved</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow">
              <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                £{expenses.filter(e => e.status === 'Pending').reduce((sum, e) => sum + parseFloat(e.amount), 0).toFixed(2)}
              </div>
              <div className="text-xs sm:text-sm text-yellow-700 mt-1">Pending</div>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {filteredData.map((expense) => (
              <ExpenseCard key={expense.id} expense={expense} />
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-primary rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-core-primary-50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Description</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredData.map((expense) => (
                    <tr key={expense.id} className="hover:bg-core-primary-50/30 transition-colors duration-150">
                      <td className="px-4 py-3 text-primary font-medium">{expense.date}</td>
                      <td className="px-4 py-3 text-secondary">{expense.description}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-violet-100 text-violet-700 border-violet-200">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-primary font-semibold">£{expense.amount}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(expense.status)}`}>
                          {expense.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Delete Expense"
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
        </div>
      )}

      {/* Empty State */}
      {filteredData.length === 0 && (
        <div className="text-center py-12 bg-secondary rounded-xl border border-border">
          <div className="w-16 h-16 bg-core-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            {activeSubTab === 'project-mapping' && <Briefcase className="text-core-primary-500" size={28} />}
            {activeSubTab === 'timesheet' && <Clock className="text-core-primary-500" size={28} />}
            {activeSubTab === 'expenses' && <DollarSign className="text-core-primary-500" size={28} />}
          </div>
          <p className="text-lg font-medium text-primary mb-1">No {activeSubTab === 'project-mapping' ? 'projects' : activeSubTab === 'timesheet' ? 'entries' : 'expenses'} found</p>
          <p className="text-sm text-secondary">Try adjusting your search or add a new one</p>
        </div>
      )}

      {/* Modal */}
      {showAddModal && (
        <Modal
          onClose={() => { setShowAddModal(false); setFormData({}); }}
          onSave={() => {
            if (modalType === 'project') handleAddProject();
            else if (modalType === 'timesheet') handleAddTimesheet();
            else if (modalType === 'expense') handleAddExpense();
          }}
          type={modalType}
        />
      )}
    </div>
  );
};

export default TimesheetTab;