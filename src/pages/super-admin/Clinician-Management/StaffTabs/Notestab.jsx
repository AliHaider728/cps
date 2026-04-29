import React, { useState } from 'react';
import { StickyNote, Plus, Edit2, Trash2, Download, Search, X, Save, User, Clock } from 'lucide-react';
import * as XLSX from 'xlsx';

const NotesTab = ({ staffData }) => {
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: 'Annual Performance Appraisal',
      content: 'Conducted yearly review. Strong progress in clinical accuracy and team collaboration. Suggested leadership course for next quarter.',
      category: 'Performance',
      priority: 'High',
      createdBy: 'James Anderson',
      createdDate: '2026-01-22',
      lastModified: '2026-01-22',
      tags: ['performance', 'review', 'leadership']
    },
    {
      id: 2,
      title: 'CPPE Training Completed',
      content: 'Finished CPPE Advanced Clinical Skills module with high score. Certificate saved in personnel file.',
      category: 'Training',
      priority: 'Medium',
      createdBy: 'Emma Thompson',
      createdDate: '2026-01-19',
      lastModified: '2026-01-19',
      tags: ['cppe', 'training', 'clinical']
    },
    {
      id: 3,
      title: 'Rota Adjustment Request',
      content: 'Requested reduced hours for 4 weeks due to childcare responsibilities. Agreed temporary change to rota.',
      category: 'Schedule',
      priority: 'Medium',
      createdBy: 'Oliver Harris',
      createdDate: '2026-01-17',
      lastModified: '2026-01-18',
      tags: ['rota', 'hours', 'family']
    },
    {
      id: 4,
      title: 'Positive Patient Compliment',
      content: 'Patient wrote a thank-you card praising professionalism, clear explanations, and caring attitude during consultation.',
      category: 'Feedback',
      priority: 'High',
      createdBy: 'Sophia Clark',
      createdDate: '2026-01-14',
      lastModified: '2026-01-14',
      tags: ['feedback', 'patient', 'positive']
    },
    {
      id: 5,
      title: 'New Dispensary Software Training Needed',
      content: 'Updated pharmacy system rolling out next month. Staff requires hands-on training session. Booked for Feb 5th.',
      category: 'Training',
      priority: 'High',
      createdBy: 'William Taylor',
      createdDate: '2026-01-11',
      lastModified: '2026-01-12',
      tags: ['training', 'software', 'dispensary']
    },
    {
      id: 6,
      title: 'Pre-registration Mentor Assignment',
      content: 'Appointed as tutor for pre-reg pharmacist. Demonstrating good supervisory and educational skills. Monthly meetings set.',
      category: 'Development',
      priority: 'Medium',
      createdBy: 'Charlotte Lewis',
      createdDate: '2026-01-09',
      lastModified: '2026-01-16',
      tags: ['mentor', 'pre-reg', 'development']
    },
    {
      id: 7,
      title: 'GPhC Renewal Confirmed',
      content: 'GPhC registration successfully renewed for another year. All CPD entries up to date. Next audit expected in 2027.',
      category: 'Compliance',
      priority: 'Low',
      createdBy: 'George Mitchell',
      createdDate: '2026-01-06',
      lastModified: '2026-01-06',
      tags: ['gphc', 'compliance', 'cpd']
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    priority: 'Medium',
    tags: ''
  });

  const categories = ['All', 'General', 'Performance', 'Training', 'Schedule', 'Feedback', 'Development', 'Compliance', 'Medical'];
  const priorities = ['All', 'High', 'Medium', 'Low'];

  // Get priority color
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'General': 'bg-gray-100 text-gray-700',
      'Performance': 'bg-blue-100 text-blue-700',
      'Training': 'bg-purple-100 text-purple-700',
      'Schedule': 'bg-orange-100 text-orange-700',
      'Feedback': 'bg-pink-100 text-pink-700',
      'Development': 'bg-indigo-100 text-indigo-700',
      'Compliance': 'bg-green-100 text-green-700',
      'Medical': 'bg-red-100 text-red-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  // Filter notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === 'All' || note.category === filterCategory;
    const matchesPriority = filterPriority === 'All' || note.priority === filterPriority;

    return matchesSearch && matchesCategory && matchesPriority;
  });

  // Add new note
  const handleAdd = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in title and content');
      return;
    }

    const newNote = {
      id: Math.max(...notes.map(n => n.id), 0) + 1,
      title: formData.title,
      content: formData.content,
      category: formData.category,
      priority: formData.priority,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
      createdBy: 'Current User',
      createdDate: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0]
    };

    setNotes([newNote, ...notes]);
    resetForm();
  };

  // Update note
  const handleUpdate = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in title and content');
      return;
    }

    setNotes(notes.map(note =>
      note.id === editingNote.id
        ? {
            ...note,
            title: formData.title,
            content: formData.content,
            category: formData.category,
            priority: formData.priority,
            tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
            lastModified: new Date().toISOString().split('T')[0]
          }
        : note
    ));
    resetForm();
  };

  // Delete note
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter(note => note.id !== id));
    }
  };

  // Edit note
  const handleEdit = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category,
      priority: note.priority,
      tags: note.tags.join(', ')
    });
    setShowModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'General',
      priority: 'Medium',
      tags: ''
    });
    setEditingNote(null);
    setShowModal(false);
  };

  // Export to Excel
  const handleExport = () => {
    const exportData = notes.map(note => ({
      'Title': note.title,
      'Content': note.content,
      'Category': note.category,
      'Priority': note.priority,
      'Tags': note.tags.join(', '),
      'Created By': note.createdBy,
      'Created Date': note.createdDate,
      'Last Modified': note.lastModified
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Notes');
    
    // Set column widths
    ws['!cols'] = [
      { wch: 30 }, { wch: 50 }, { wch: 15 }, { wch: 10 },
      { wch: 25 }, { wch: 20 }, { wch: 12 }, { wch: 12 }
    ];

    XLSX.writeFile(wb, `${staffData?.name || 'Staff'}_Notes.xlsx`);
  };

  // Calculate statistics
  const stats = {
    total: notes.length,
    high: notes.filter(n => n.priority === 'High').length,
    medium: notes.filter(n => n.priority === 'Medium').length,
    low: notes.filter(n => n.priority === 'Low').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary">Notes & Documentation</h2>
          <p className="text-secondary text-sm mt-1">Add and manage staff notes and important information</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-sm"
          >
            <Download size={16} />
            <span className="font-medium">Export</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-core-primary-500 text-white rounded-lg hover:bg-core-primary-600 transition-colors duration-200 shadow-sm"
          >
            <Plus size={16} />
            <span className="font-medium">Add Note</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-primary rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-core-primary-500">{stats.total}</div>
          <div className="text-sm text-secondary mt-1">Total Notes</div>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4 hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-red-600">{stats.high}</div>
          <div className="text-sm text-red-700 mt-1">High Priority</div>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-yellow-600">{stats.medium}</div>
          <div className="text-sm text-yellow-700 mt-1">Medium Priority</div>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4 hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-green-600">{stats.low}</div>
          <div className="text-sm text-green-700 mt-1">Low Priority</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="Search notes by title, content, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-primary border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-core-primary-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 bg-primary border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-core-primary-500"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
          ))}
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-4 py-2.5 bg-primary border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-core-primary-500"
        >
          {priorities.map(pri => (
            <option key={pri} value={pri}>{pri === 'All' ? 'All Priorities' : pri}</option>
          ))}
        </select>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="bg-primary rounded-xl border border-border p-5 hover:shadow-md transition-all duration-200 group"
            >
              {/* Note Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-primary text-lg mb-2 group-hover:text-core-primary-500 transition-colors">
                    {note.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(note.category)}`}>
                      {note.category}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(note.priority)}`}>
                      {note.priority}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                  <button
                    onClick={() => handleEdit(note)}
                    className="p-2 text-core-primary-500 hover:bg-core-primary-50 rounded-lg transition-all duration-200"
                    title="Edit Note"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Delete Note"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Note Content */}
              <p className="text-secondary text-sm mb-3 line-clamp-3">
                {note.content}
              </p>

              {/* Tags */}
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {note.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-core-primary-50 text-core-primary-700 border border-core-primary-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Note Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted">
                <div className="flex items-center gap-1">
                  <User size={12} />
                  <span>{note.createdBy}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{note.lastModified}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-primary rounded-xl border border-border p-12 text-center">
          <div className="w-20 h-20 bg-core-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <StickyNote className="text-core-primary-500" size={40} />
          </div>
          <h3 className="text-xl font-semibold text-primary mb-2">No Notes Found</h3>
          <p className="text-secondary mb-6">
            {searchTerm || filterCategory !== 'All' || filterPriority !== 'All' 
              ? 'No notes match your current filters' 
              : 'No notes have been added for this staff member'}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2.5 bg-core-primary-500 text-white rounded-lg hover:bg-core-primary-600 transition-colors duration-200"
          >
            Create First Note
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-secondary rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-secondary border-b border-border px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-primary">
                {editingNote ? 'Edit Note' : 'Add New Note'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-primary rounded-lg transition-colors"
              >
                <X size={20} className="text-secondary" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Note Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter a descriptive title..."
                  className="w-full px-3 py-2.5 bg-primary border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-core-primary-500"
                />
              </div>

              {/* Category and Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-primary border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-core-primary-500"
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2.5 bg-primary border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-core-primary-500"
                  >
                    {priorities.filter(p => p !== 'All').map(pri => (
                      <option key={pri} value={pri}>{pri}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  placeholder="Enter the note content..."
                  className="w-full px-3 py-2.5 bg-primary border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-core-primary-500 resize-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Tags <span className="text-xs text-muted">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g. training, performance, urgent"
                  className="w-full px-3 py-2.5 bg-primary border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-core-primary-500"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-secondary border-t border-border px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={resetForm}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary border border-border rounded-lg text-secondary hover:bg-core-primary-50 hover:text-core-primary-500 hover:border-core-primary-500 transition-all duration-200"
              >
                <X size={18} />
                <span className="font-medium">Cancel</span>
              </button>
              <button
                onClick={editingNote ? handleUpdate : handleAdd}
                className="flex items-center gap-2 px-6 py-2.5 bg-core-primary-500 text-white rounded-lg hover:bg-core-primary-600 transition-colors duration-200 shadow-sm"
              >
                <Save size={18} />
                <span className="font-medium">{editingNote ? 'Update' : 'Add'} Note</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesTab;