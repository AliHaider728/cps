import React, { useState } from 'react';
import { Archive, Plus, Trash2, Download, Search, Eye, RotateCcw, X, AlertTriangle, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';

const ArchiveTab = ({ staffData }) => {
  const [archivedItems, setArchivedItems] = useState([
    {
      id: 1,
      itemType: 'Document',
      itemName: 'Old Indemnity Insurance (2024)',
      category: 'Insurance',
      archivedDate: '2026-01-20',
      archivedBy: 'Noor Ul Hameed',
      reason: 'Replaced with new certificate',
      originalDate: '2024-01-15',
      notes: 'Superseded by 2026 certificate',
      canRestore: false
    },
    {
      id: 2,
      itemType: 'Training',
      itemName: 'Basic Life Support - Expired',
      category: 'Clinical',
      archivedDate: '2025-12-01',
      archivedBy: 'Saba Kazmi',
      reason: 'Training expired and renewed',
      originalDate: '2023-12-01',
      notes: 'New training completed',
      canRestore: false
    },
    {
      id: 3,
      itemType: 'Note',
      itemName: 'Performance Review Q1 2024',
      category: 'Performance',
      archivedDate: '2025-10-15',
      archivedBy: 'Arslan Shahroz',
      reason: 'Completed review cycle',
      originalDate: '2024-03-20',
      notes: 'Historical record',
      canRestore: true
    },
    {
      id: 4,
      itemType: 'Document',
      itemName: 'Previous Employment Contract',
      category: 'Employment',
      archivedDate: '2025-09-10',
      archivedBy: 'Abdul Hoque',
      reason: 'Contract ended',
      originalDate: '2023-01-15',
      notes: 'Replaced with new contract',
      canRestore: false
    },
    {
      id: 5,
      itemType: 'Invoice',
      itemName: 'INV-2024-045',
      category: 'Financial',
      archivedDate: '2025-08-20',
      archivedBy: 'System',
      reason: 'Older than 12 months',
      originalDate: '2024-07-15',
      notes: 'Auto-archived paid invoice',
      canRestore: true
    },
    {
      id: 6,
      itemType: 'Training',
      itemName: 'Fire Safety 2023',
      category: 'Mandatory',
      archivedDate: '2025-06-15',
      archivedBy: 'Saba Kazmi',
      reason: 'Training expired',
      originalDate: '2023-06-10',
      notes: 'Completed renewal training',
      canRestore: false
    },
    {
      id: 7,
      itemType: 'Leave',
      itemName: 'Annual Leave - Summer 2024',
      category: 'Leave',
      archivedDate: '2025-01-05',
      archivedBy: 'System',
      reason: 'Leave completed',
      originalDate: '2024-08-01',
      notes: 'Historical leave record',
      canRestore: true
    },
    {
      id: 8,
      itemType: 'Document',
      itemName: 'DBS Check 2022',
      category: 'Background Check',
      archivedDate: '2024-11-30',
      archivedBy: 'Saba Kazmi',
      reason: 'Replaced with new DBS',
      originalDate: '2022-11-20',
      notes: 'New enhanced DBS obtained',
      canRestore: false
    },
    {
      id: 9,
      itemType: 'Note',
      itemName: 'Training Feedback - Data Security',
      category: 'Training',
      archivedDate: '2024-09-12',
      archivedBy: 'Noor Ul Hameed',
      reason: 'Old feedback',
      originalDate: '2024-05-10',
      notes: 'Positive feedback recorded',
      canRestore: true
    },
    {
      id: 10,
      itemType: 'Timesheet',
      itemName: 'Timesheet Week 15-2024',
      category: 'Timesheet',
      archivedDate: '2024-08-01',
      archivedBy: 'System',
      reason: 'Auto-archived approved timesheet',
      originalDate: '2024-04-15',
      notes: 'Approved and paid',
      canRestore: false
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);

  const itemTypes = ['All', 'Document', 'Training', 'Note', 'Invoice', 'Leave', 'Timesheet'];
  const categories = ['All', 'Insurance', 'Clinical', 'Performance', 'Employment', 'Financial', 'Mandatory', 'Leave', 'Background Check', 'Training', 'Timesheet'];

  // Get item type color
  const getItemTypeColor = (type) => {
    const colors = {
      'Document': 'bg-blue-100 text-blue-700 border-blue-200',
      'Training': 'bg-purple-100 text-purple-700 border-purple-200',
      'Note': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Invoice': 'bg-green-100 text-green-700 border-green-200',
      'Leave': 'bg-orange-100 text-orange-700 border-orange-200',
      'Timesheet': 'bg-pink-100 text-pink-700 border-pink-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Filter archived items
  const filteredItems = archivedItems.filter(item => {
    const matchesSearch = 
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'All' || item.itemType === filterType;
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  // Restore item
  const handleRestore = (id) => {
    const item = archivedItems.find(i => i.id === id);
    if (!item.canRestore) {
      alert('This item cannot be restored as it has been permanently superseded.');
      return;
    }
    
    if (window.confirm(`Are you sure you want to restore "${item.itemName}"?`)) {
      setArchivedItems(archivedItems.filter(i => i.id !== id));
      alert('Item restored successfully!');
    }
  };

  // Permanently delete item
  const handlePermanentDelete = (id) => {
    if (window.confirm('Are you sure you want to permanently delete this item? This action cannot be undone.')) {
      setArchivedItems(archivedItems.filter(item => item.id !== id));
    }
  };

  // View item details
  const handleView = (item) => {
    setViewingItem(item);
    setShowViewModal(true);
  };

  // Export to Excel
  const handleExport = () => {
    try {
      const exportData = archivedItems.map(item => ({
        'Item Type': item.itemType,
        'Item Name': item.itemName,
        'Category': item.category,
        'Original Date': item.originalDate,
        'Archived Date': item.archivedDate,
        'Archived By': item.archivedBy,
        'Reason': item.reason,
        'Can Restore': item.canRestore ? 'Yes' : 'No',
        'Notes': item.notes
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Archived Items');
      
      ws['!cols'] = [
        { wch: 12 }, { wch: 35 }, { wch: 20 }, { wch: 14 }, { wch: 14 },
        { wch: 20 }, { wch: 30 }, { wch: 12 }, { wch: 40 }
      ];

      XLSX.writeFile(wb, `${staffData?.name || 'Staff'}_Archived_Items.xlsx`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  // Clear all archived items
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to permanently delete ALL archived items? This action cannot be undone.')) {
      setArchivedItems([]);
    }
  };

  // Calculate statistics
  const stats = {
    total: archivedItems.length,
    documents: archivedItems.filter(i => i.itemType === 'Document').length,
    training: archivedItems.filter(i => i.itemType === 'Training').length,
    notes: archivedItems.filter(i => i.itemType === 'Note').length,
    invoices: archivedItems.filter(i => i.itemType === 'Invoice').length,
    restorable: archivedItems.filter(i => i.canRestore).length
  };

  // Mobile Card Component
  const ArchiveCard = ({ item }) => (
    <div className="bg-primary rounded-lg border border-border p-4 space-y-3 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getItemTypeColor(item.itemType)} mb-2`}>
            {item.itemType}
          </span>
          <h4 className="font-medium text-sm text-primary truncate flex items-center gap-2">
            <Archive size={14} className="text-gray-400 flex-shrink-0" />
            <span className="truncate">{item.itemName}</span>
          </h4>
          <p className="text-xs text-secondary mt-1">{item.category}</p>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={() => handleView(item)} className="text-blue-500 p-1.5 hover:bg-blue-50 rounded-lg transition-colors">
            <Eye size={14} />
          </button>
          {item.canRestore && (
            <button onClick={() => handleRestore(item.id)} className="text-green-500 p-1.5 hover:bg-green-50 rounded-lg transition-colors">
              <RotateCcw size={14} />
            </button>
          )}
          <button onClick={() => handlePermanentDelete(item.id)} className="text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="text-xs text-secondary space-y-1 pt-2 border-t border-border">
        <div>Archived: {item.archivedDate}</div>
        <div className="line-clamp-2">Reason: {item.reason}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-primary">Archived Items</h2>
          <p className="text-secondary text-xs sm:text-sm mt-1">View and manage archived staff records</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {archivedItems.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-sm text-sm"
            >
              <Trash2 size={16} />
              <span className="font-medium">Clear All</span>
            </button>
          )}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-sm text-sm"
          >
            <Download size={16} />
            <span className="font-medium">Export</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        <div className="bg-primary rounded-lg sm:rounded-xl border border-border p-3 sm:p-4 hover:shadow-md transition-shadow">
          <div className="text-xl sm:text-2xl font-bold text-core-primary-500">{stats.total}</div>
          <div className="text-xs sm:text-sm text-secondary mt-1">Total Items</div>
        </div>
        <div className="bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200 p-3 sm:p-4 hover:shadow-md transition-shadow">
          <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.documents}</div>
          <div className="text-xs sm:text-sm text-blue-700 mt-1">Documents</div>
        </div>
        <div className="bg-purple-50 rounded-lg sm:rounded-xl border border-purple-200 p-3 sm:p-4 hover:shadow-md transition-shadow">
          <div className="text-xl sm:text-2xl font-bold text-purple-600">{stats.training}</div>
          <div className="text-xs sm:text-sm text-purple-700 mt-1">Training</div>
        </div>
        <div className="bg-yellow-50 rounded-lg sm:rounded-xl border border-yellow-200 p-3 sm:p-4 hover:shadow-md transition-shadow">
          <div className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.notes}</div>
          <div className="text-xs sm:text-sm text-yellow-700 mt-1">Notes</div>
        </div>
        <div className="bg-green-50 rounded-lg sm:rounded-xl border border-green-200 p-3 sm:p-4 hover:shadow-md transition-shadow">
          <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.invoices}</div>
          <div className="text-xs sm:text-sm text-green-700 mt-1">Invoices</div>
        </div>
        <div className="bg-orange-50 rounded-lg sm:rounded-xl border border-orange-200 p-3 sm:p-4 hover:shadow-md transition-shadow">
          <div className="text-xl sm:text-2xl font-bold text-orange-600">{stats.restorable}</div>
          <div className="text-xs sm:text-sm text-orange-700 mt-1">Restorable</div>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
        <AlertTriangle size={18} className="text-yellow-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-medium text-yellow-800 mb-1 text-sm sm:text-base">Archived Items Information</h4>
          <p className="text-xs sm:text-sm text-yellow-700">
            Items are archived when they are replaced, expired, or no longer needed. Some items can be restored, 
            while others have been permanently superseded.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input
            type="text"
            placeholder="Search archived items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-sm sm:text-base text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-core-primary-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-sm sm:text-base text-primary focus:outline-none focus:ring-2 focus:ring-core-primary-500"
        >
          {itemTypes.map(type => (
            <option key={type} value={type}>{type === 'All' ? 'All Types' : type}</option>
          ))}
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-sm sm:text-base text-primary focus:outline-none focus:ring-2 focus:ring-core-primary-500"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
          ))}
        </select>
      </div>

      {/* Archived Items */}
      {filteredItems.length > 0 ? (
        <>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {filteredItems.map((item) => (
              <ArchiveCard key={item.id} item={item} />
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-primary rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-core-primary-50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Item Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Archived Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Reason</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-core-primary-50/30 transition-colors duration-150">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getItemTypeColor(item.itemType)}`}>
                          {item.itemType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Archive size={16} className="text-gray-400" />
                          <span className="font-medium text-primary">{item.itemName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-secondary">{item.category}</td>
                      <td className="px-4 py-3 text-secondary">{item.archivedDate}</td>
                      <td className="px-4 py-3 text-secondary max-w-xs truncate" title={item.reason}>
                        {item.reason}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(item)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          {item.canRestore && (
                            <button
                              onClick={() => handleRestore(item.id)}
                              className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-all duration-200"
                              title="Restore Item"
                            >
                              <RotateCcw size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handlePermanentDelete(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Permanently Delete"
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
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Archive className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2">No Archived Items</h3>
          <p className="text-sm sm:text-base text-secondary">
            {searchTerm || filterType !== 'All' || filterCategory !== 'All'
              ? 'No archived items match your current filters'
              : 'There are no archived items for this staff member'}
          </p>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && viewingItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-secondary rounded-xl shadow-2xl max-w-2xl w-full my-4">
            <div className="bg-core-primary-50 border-b border-border px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 rounded-t-xl">
              <h3 className="text-lg sm:text-xl font-bold text-primary">Archived Item Details</h3>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-primary rounded-lg transition-colors">
                <X size={20} className="text-secondary" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 max-h-[calc(90vh-140px)] overflow-y-auto">
              <div className="flex items-center gap-3 sm:gap-4 pb-4 border-b border-border">
                <div className="p-3 sm:p-4 rounded-lg bg-gray-100 text-gray-600">
                  <Archive size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-primary mb-1 truncate">{viewingItem.itemName}</h3>
                  <div className="flex gap-2 flex-wrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getItemTypeColor(viewingItem.itemType)}`}>
                      {viewingItem.itemType}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                      {viewingItem.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted mb-1">Original Date</div>
                  <div className="font-medium text-sm text-primary">{viewingItem.originalDate}</div>
                </div>
                <div>
                  <div className="text-xs text-muted mb-1">Archived Date</div>
                  <div className="font-medium text-sm text-primary">{viewingItem.archivedDate}</div>
                </div>
                <div>
                  <div className="text-xs text-muted mb-1">Archived By</div>
                  <div className="font-medium text-sm text-primary">{viewingItem.archivedBy}</div>
                </div>
                <div>
                  <div className="text-xs text-muted mb-1">Can Restore</div>
                  <div className="font-medium text-sm text-primary">
                    {viewingItem.canRestore ? (
                      <span className="text-green-600">Yes</span>
                    ) : (
                      <span className="text-red-600">No (Superseded)</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-muted mb-2">Reason for Archiving</div>
                <div className="text-sm text-primary bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  {viewingItem.reason}
                </div>
              </div>

              {viewingItem.notes && (
                <div>
                  <div className="text-xs text-muted mb-2">Additional Notes</div>
                  <div className="text-sm text-primary bg-primary border border-border rounded-lg p-3">
                    {viewingItem.notes}
                  </div>
                </div>
              )}

              {!viewingItem.canRestore && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
                  <AlertTriangle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm text-red-800 mb-1">Cannot Restore</h4>
                    <p className="text-xs text-red-700">
                      This item has been permanently superseded and cannot be restored. It is kept for historical reference only.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 sticky bottom-0 bg-secondary rounded-b-xl">
              <button
                onClick={() => setShowViewModal(false)}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-sm text-secondary hover:bg-core-primary-50 transition-colors"
              >
                Close
              </button>
              {viewingItem.canRestore && (
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleRestore(viewingItem.id);
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                >
                  <RotateCcw size={16} />
                  Restore Item
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchiveTab;