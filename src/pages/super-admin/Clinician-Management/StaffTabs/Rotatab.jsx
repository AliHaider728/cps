import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Download, Copy, Plus, Save } from 'lucide-react';

const RotaTab = ({ staffData }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0)); // January 2026
  const [selectedView, setSelectedView] = useState('monthly');
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    project: 'Arc Bucks PCN EA',
    practice: 'Arc Bucks PCN EA',
    hours: '',
    rate: '20.00',
    additionalHours: false,
    timesheetFor: 'Select Timesheet',
    paymentType: 'Per Hour',
    comment: ''
  });

  const projects = ['Arc Bucks PCN EA', 'Director', 'Annual Leave', 'PCN Coverage', 'Emergency Shifts'];
  const practices = ['Arc Bucks PCN EA', 'Practice A', 'Practice B', 'Practice C'];

  // Status filters
  const statusFilters = [
    { label: 'Draft Not Submitted', value: 'draft', color: 'bg-amber-500', count: 2 },
    { label: 'Submitted', value: 'submitted', color: 'bg-slate-500', count: 1 },
    { label: 'Authorised', value: 'authorised', color: 'bg-emerald-500', count: 4 },
    { label: 'Rejected', value: 'rejected', color: 'bg-rose-500', count: 1 },
    { label: 'Invoiced', value: 'invoiced', color: 'bg-sky-500', count: 0 },
    { label: 'Paid', value: 'paid', color: 'bg-blue-600', count: 2 },
    { label: 'Leave', value: 'leave', color: 'bg-violet-500', count: 0 }
  ];

  // Sample rota data with status
  const rotaData = {
    '2026-01-01': { status: 'authorised', hours: 8, project: 'Arc Bucks PCN EA' },
    '2026-01-02': { status: 'authorised', hours: 8, project: 'Arc Bucks PCN EA' },
    '2026-01-03': { status: 'submitted', hours: 8, project: 'Arc Bucks PCN EA' },
    '2026-01-07': { status: 'draft', hours: 6, project: 'Annual Leave' },
    '2026-01-08': { status: 'draft', hours: 6, project: 'Annual Leave' },
    '2026-01-14': { status: 'authorised', hours: 8, project: 'PCN Coverage' },
    '2026-01-15': { status: 'authorised', hours: 8, project: 'Arc Bucks PCN EA' },
    '2026-01-21': { status: 'paid', hours: 8, project: 'Arc Bucks PCN EA' },
    '2026-01-22': { status: 'paid', hours: 8, project: 'Arc Bucks PCN EA' },
    '2026-01-28': { status: 'rejected', hours: 8, project: 'Emergency Shifts' }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getDateKey = (day) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-amber-50 border-amber-400',
      submitted: 'bg-slate-50 border-slate-400',
      authorised: 'bg-emerald-50 border-emerald-400',
      rejected: 'bg-rose-50 border-rose-400',
      invoiced: 'bg-sky-50 border-sky-400',
      paid: 'bg-blue-50 border-blue-500',
      leave: 'bg-violet-50 border-violet-400'
    };
    return colors[status] || 'bg-gray-50 border-gray-300';
  };

  // Calculate totals
  const totalHours = Object.values(rotaData).reduce((sum, entry) => sum + entry.hours, 0);
  const totalBilled = totalHours * 20; // Assuming £20/hour
  const totalExpenses = 0; // No expenses in this example

  const handleDayClick = (day) => {
    setSelectedDate(day);
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Status Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
          <span className="font-semibold text-slate-700">Status Overview</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((status, index) => (
            <button
              key={index}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 ${status.color} hover:scale-105`}
            >
              <span>{status.label}</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
                {status.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Totals Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-slate-500">Total Hours</div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar size={20} className="text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800">{totalHours}</div>
          <div className="text-xs text-slate-400 mt-1">This month</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-slate-500">Total Billed</div>
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <span className="text-emerald-600 font-bold text-lg">£</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800">£{totalBilled}</div>
          <div className="text-xs text-slate-400 mt-1">@ £20.00/hour</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-slate-500">Expenses Claimed</div>
            <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
              <Download size={20} className="text-sky-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800">£{totalExpenses}</div>
          <div className="text-xs text-slate-400 mt-1">Additional costs</div>
        </div>
      </div>

      {/* Main Layout: Calendar + Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar - Takes 5 columns */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Calendar Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4 flex items-center justify-between">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} className="text-white" />
              </button>
              <h3 className="text-lg font-bold text-white">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronRight size={20} className="text-white" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
              {/* Day Names */}
              <div className="grid grid-cols-7 gap-2 mb-3">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-slate-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {/* Empty cells */}
                {[...Array(startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1)].map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square"></div>
                ))}

                {/* Days */}
                {[...Array(daysInMonth)].map((_, i) => {
                  const day = i + 1;
                  const dateKey = getDateKey(day);
                  const hasEvent = rotaData[dateKey];

                  return (
                    <button
                      key={day}
                      onClick={() => handleDayClick(day)}
                      className={`aspect-square border-2 rounded-xl p-2 hover:border-blue-400 hover:shadow-md transition-all duration-200 text-sm ${
                        hasEvent 
                          ? `${getStatusColor(hasEvent.status)}` 
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className={`font-semibold ${hasEvent ? 'text-slate-700' : 'text-slate-400'}`}>
                        {day}
                      </div>
                      {hasEvent && (
                        <div className="text-[10px] font-bold mt-1 text-slate-600">
                          {hasEvent.hours}h
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Form - Takes 7 columns */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Plus size={20} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Timesheet Entry</h3>
              </div>
              <div className="text-sm font-medium text-slate-500 bg-slate-100 px-4 py-2 rounded-lg">
                Date: 26/1/2026
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Project */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Project<span className="text-rose-500 ml-1">*</span>
                </label>
                <select
                  value={formData.project}
                  onChange={(e) => setFormData({...formData, project: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  {projects.map((project) => (
                    <option key={project} value={project}>{project}</option>
                  ))}
                </select>
              </div>

              {/* Practice */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Practice<span className="text-rose-500 ml-1">*</span>
                </label>
                <select
                  value={formData.practice}
                  onChange={(e) => setFormData({...formData, practice: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  {practices.map((practice) => (
                    <option key={practice} value={practice}>{practice}</option>
                  ))}
                </select>
              </div>

              {/* Hours */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Hours<span className="text-rose-500 ml-1">*</span>
                </label>
                <input
                  type="number"
                  value={formData.hours}
                  onChange={(e) => setFormData({...formData, hours: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter hours"
                />
              </div>

              {/* Rate */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center justify-between">
                  <span>Rate</span>
                  <span className="text-slate-400 font-normal">£20.00/hour</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={formData.rate}
                    onChange={(e) => setFormData({...formData, rate: e.target.value})}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <label className="flex items-center gap-2 text-sm whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={formData.additionalHours}
                      onChange={(e) => setFormData({...formData, additionalHours: e.target.checked})}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-slate-600">Additional?</span>
                  </label>
                </div>
              </div>

              {/* Timesheet For */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Timesheet for<span className="text-rose-500 ml-1">*</span>
                </label>
                <select
                  value={formData.timesheetFor}
                  onChange={(e) => setFormData({...formData, timesheetFor: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option>Select Timesheet</option>
                </select>
              </div>

              {/* Payment Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Payment Type
                </label>
                <div className="flex gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentType"
                      value="Per Hour"
                      checked={formData.paymentType === 'Per Hour'}
                      onChange={(e) => setFormData({...formData, paymentType: e.target.value})}
                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-600">Per Hour</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentType"
                      value="Locums Contractor"
                      checked={formData.paymentType === 'Locums Contractor'}
                      onChange={(e) => setFormData({...formData, paymentType: e.target.value})}
                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-600">Locums Contractor</span>
                  </label>
                </div>
              </div>

              {/* Comment */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Comment
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({...formData, comment: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                  placeholder="Add any comments..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-5 border-t border-slate-200">
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium border border-slate-200">
                  <Copy size={16} />
                  Copy
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium border border-slate-200">
                  Paste
                </button>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-sm hover:shadow-md">
                  <Save size={16} />
                  Save
                </button>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-sm hover:shadow-md">
                  <Plus size={16} />
                  Save & New
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RotaTab;