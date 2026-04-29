import React, { useState } from 'react';
import { FileText, Plus, Edit2, Trash2, Download, Search, Eye, Upload, Check, X, Save, AlertCircle, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

const DocumentTab = ({ staffData }) => {
  const minimalPdfContent = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj
4 0 obj << /Length 55 >> stream
BT /F1 24 Tf 100 700 Td (Dummy PDF Document) Tj ET
endstream endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000074 00000 n 
0000000120 00000 n 
0000000223 00000 n 
trailer << /Size 5 /Root 1 0 R >>
startxref
310
%%EOF`;

  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: 'Indemnity Insurance Certificate',
      category: 'Insurance',
      type: 'PDF',
      size: '2.4 MB',
      uploadedDate: '2026-01-20',
      expiryDate: '2027-01-20',
      status: 'Valid',
      uploadedBy: 'Noor Ul Hameed',
      notes: 'Professional indemnity insurance coverage',
      verified: true,
      mandatory: true,
      file: null
    },
    {
      id: 2,
      name: 'GPhC Registration Certificate',
      category: 'Certification',
      type: 'PDF',
      size: '1.8 MB',
      uploadedDate: '2025-11-25',
      expiryDate: '2026-11-25',
      status: 'Valid',
      uploadedBy: 'Noor Ul Hameed',
      notes: 'General Pharmaceutical Council registration',
      verified: true,
      mandatory: true,
      file: null
    },
    {
      id: 3,
      name: 'DBS Check Certificate',
      category: 'Background Check',
      type: 'PDF',
      size: '1.2 MB',
      uploadedDate: '2025-09-15',
      expiryDate: '2028-09-15',
      status: 'Valid',
      uploadedBy: 'Saba Kazmi',
      notes: 'Enhanced DBS clearance obtained',
      verified: true,
      mandatory: true,
      file: null
    },
    {
      id: 4,
      name: 'Health Screening Form',
      category: 'Medical',
      type: 'XLSX',
      size: '856 KB',
      uploadedDate: '2025-05-29',
      expiryDate: '2026-05-29',
      status: 'Valid',
      uploadedBy: 'Saba Kazmi',
      notes: 'Annual health check completed',
      verified: true,
      mandatory: true,
      file: null
    },
    {
      id: 5,
      name: 'Right to Work Documents',
      category: 'Employment',
      type: 'PDF',
      size: '3.1 MB',
      uploadedDate: '2025-03-10',
      expiryDate: '2030-03-10',
      status: 'Valid',
      uploadedBy: 'Abdul Hoque',
      notes: 'Passport and visa documentation',
      verified: true,
      mandatory: true,
      file: null
    },
    {
      id: 6,
      name: 'Hepatitis B Vaccination Record',
      category: 'Medical',
      type: 'PDF',
      size: '654 KB',
      uploadedDate: '2025-02-20',
      expiryDate: null,
      status: 'Valid',
      uploadedBy: 'Saba Kazmi',
      notes: 'Full vaccination course completed',
      verified: true,
      mandatory: false,
      file: null
    },
    {
      id: 7,
      name: 'Professional CV',
      category: 'Employment',
      type: 'XLSX',
      size: '425 KB',
      uploadedDate: '2025-01-15',
      expiryDate: null,
      status: 'Valid',
      uploadedBy: 'Abdul Hoque',
      notes: 'Updated CV with recent experience',
      verified: false,
      mandatory: false,
      file: null
    },
    {
      id: 8,
      name: 'Professional References',
      category: 'Employment',
      type: 'PDF',
      size: '1.1 MB',
      uploadedDate: '2025-01-10',
      expiryDate: null,
      status: 'Valid',
      uploadedBy: 'Abdul Hoque',
      notes: 'Two professional references provided',
      verified: true,
      mandatory: false,
      file: null
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Certification',
    type: 'PDF',
    expiryDate: '',
    notes: '',
    mandatory: false,
    file: null,
    fileName: '',
    size: ''
  });

  const categories = ['All', 'Certification', 'Insurance', 'Medical', 'Background Check', 'Employment', 'Training', 'Other'];
  const statuses = ['All', 'Valid', 'Expiring Soon', 'Expired', 'Pending Review'];
  const fileTypes = ['PDF', 'XLSX'];

  // Get status based on expiry date
  const calculateStatus = (expiryDate) => {
    if (!expiryDate) return 'Valid';
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'Expired';
    if (daysUntilExpiry <= 30) return 'Expiring Soon';
    return 'Valid';
  };

  // Get status color (dark mode compatible)
  const getStatusColor = (status) => {
    switch(status) {
      case 'Valid':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'Expiring Soon':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'Expired':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'Pending Review':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    }
  };

  // Get file type icon color
  const getFileTypeColor = (type) => {
    const colors = {
      'PDF': 'text-red-500 dark:text-red-400',
      'XLSX': 'text-green-500 dark:text-green-400'
    };
    return colors[type] || 'text-gray-500 dark:text-gray-400';
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.notes.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'All' || doc.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || doc.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit');
        return;
      }
      const ext = file.name.split('.').pop().toUpperCase();
      if (!fileTypes.includes(ext)) {
        alert('Only PDF and XLSX files are supported');
        return;
      }
      setFormData({
        ...formData,
        file,
        fileName: file.name,
        type: ext,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      });
    }
  };

  // Add new document
  const handleAdd = () => {
    if (!formData.name.trim() || !formData.file) {
      alert('Please enter document name and upload a file');
      return;
    }

    const newDocument = {
      id: Math.max(...documents.map(d => d.id), 0) + 1,
      name: formData.name,
      category: formData.category,
      type: formData.type,
      size: formData.size,
      uploadedDate: new Date().toISOString().split('T')[0],
      expiryDate: formData.expiryDate || null,
      status: calculateStatus(formData.expiryDate),
      uploadedBy: 'Current User',
      notes: formData.notes,
      verified: false,
      mandatory: formData.mandatory,
      file: formData.file
    };

    setDocuments([newDocument, ...documents]);
    resetForm();
  };

  // Update document
  const handleUpdate = () => {
    if (!formData.name.trim()) {
      alert('Please enter document name');
      return;
    }

    setDocuments(documents.map(doc =>
      doc.id === editingDocument.id
        ? {
            ...doc,
            name: formData.name,
            category: formData.category,
            type: formData.type,
            expiryDate: formData.expiryDate || null,
            status: calculateStatus(formData.expiryDate),
            notes: formData.notes,
            mandatory: formData.mandatory,
            file: formData.file || doc.file,
            size: formData.size || doc.size
          }
        : doc
    ));
    resetForm();
  };

  // Delete document
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setDocuments(documents.filter(doc => doc.id !== id));
    }
  };

  // Edit document
  const handleEdit = (doc) => {
    setEditingDocument(doc);
    setFormData({
      name: doc.name,
      category: doc.category,
      type: doc.type,
      expiryDate: doc.expiryDate || '',
      notes: doc.notes,
      mandatory: doc.mandatory,
      file: doc.file,
      fileName: doc.name,
      size: doc.size
    });
    setShowModal(true);
  };

  // View document
  const handleView = (doc) => {
    setViewingDocument(doc);
    setShowViewModal(true);
  };

  // Toggle verification
  const handleToggleVerification = (id) => {
    setDocuments(documents.map(doc =>
      doc.id === id ? { ...doc, verified: !doc.verified } : doc
    ));
  };

  // Download document
  const handleDownload = (doc) => {
    try {
      let blob;
      let mimeType;
      let extension = doc.type.toLowerCase();

      if (doc.file) {
        blob = doc.file;
        mimeType = doc.file.type;
      } else {
        if (doc.type === 'PDF') {
          blob = new Blob([minimalPdfContent], { type: 'application/pdf' });
          mimeType = 'application/pdf';
        } else if (doc.type === 'XLSX') {
          const wb = XLSX.utils.book_new();
          const ws = XLSX.utils.aoa_to_sheet([['Document: ' + doc.name], ['Generated for demonstration']]);
          XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
          const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        }
      }

      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${doc.name}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert('File not available for download.');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Certification',
      type: 'PDF',
      expiryDate: '',
      notes: '',
      mandatory: false,
      file: null,
      fileName: '',
      size: ''
    });
    setEditingDocument(null);
    setShowModal(false);
  };

  // Export to Excel
  const handleExport = () => {
    try {
      const exportData = documents.map(doc => ({
        'Document Name': doc.name,
        'Category': doc.category,
        'Type': doc.type,
        'Size': doc.size,
        'Uploaded Date': doc.uploadedDate,
        'Expiry Date': doc.expiryDate || 'N/A',
        'Status': doc.status,
        'Uploaded By': doc.uploadedBy,
        'Verified': doc.verified ? 'Yes' : 'No',
        'Mandatory': doc.mandatory ? 'Yes' : 'No',
        'Notes': doc.notes
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Documents');
      
      ws['!cols'] = [
        { wch: 35 }, { wch: 18 }, { wch: 8 }, { wch: 10 }, { wch: 14 },
        { wch: 14 }, { wch: 15 }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 40 }
      ];

      XLSX.writeFile(wb, `${staffData?.name || 'Staff'}_Documents.xlsx`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  // Calculate statistics
  const stats = {
    total: documents.length,
    valid: documents.filter(d => d.status === 'Valid').length,
    expiring: documents.filter(d => d.status === 'Expiring Soon').length,
    expired: documents.filter(d => d.status === 'Expired').length,
    verified: documents.filter(d => d.verified).length,
    mandatory: documents.filter(d => d.mandatory).length
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-primary">Document Management</h2>
          <p className="text-secondary text-xs sm:text-sm mt-1">Manage staff documents and certifications</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 shadow-sm text-sm"
          >
            <Download size={14} className="sm:w-4 sm:h-4" />
            <span className="font-medium">Export</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-core-primary-500 hover:bg-core-primary-600 text-white rounded-lg transition-colors duration-200 shadow-sm text-sm"
          >
            <Plus size={14} className="sm:w-4 sm:h-4" />
            <span className="font-medium">Upload Document</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        <div className="bg-primary rounded-lg sm:rounded-xl border border-border p-3 sm:p-4 hover:shadow-md transition-shadow">
          <div className="text-xl sm:text-2xl font-bold text-core-primary-500">{stats.total}</div>
          <div className="text-xs sm:text-sm text-secondary mt-1">Total</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg sm:rounded-xl border border-green-200 dark:border-green-800 p-3 sm:p-4 hover:shadow-md transition-shadow">
          <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{stats.valid}</div>
          <div className="text-xs sm:text-sm text-green-700 dark:text-green-500 mt-1">Valid</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg sm:rounded-xl border border-yellow-200 dark:border-yellow-800 p-3 sm:p-4 hover:shadow-md transition-shadow">
          <div className="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.expiring}</div>
          <div className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-500 mt-1">Expiring</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg sm:rounded-xl border border-red-200 dark:border-red-800 p-3 sm:p-4 hover:shadow-md transition-shadow">
          <div className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">{stats.expired}</div>
          <div className="text-xs sm:text-sm text-red-700 dark:text-red-500 mt-1">Expired</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg sm:rounded-xl border border-blue-200 dark:border-blue-800 p-3 sm:p-4 hover:shadow-md transition-shadow">
          <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.verified}</div>
          <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-500 mt-1">Verified</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg sm:rounded-xl border border-purple-200 dark:border-purple-800 p-3 sm:p-4 hover:shadow-md transition-shadow">
          <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.mandatory}</div>
          <div className="text-xs sm:text-sm text-purple-700 dark:text-purple-500 mt-1">Mandatory</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-sm sm:text-base text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-core-primary-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 sm:px-4 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-sm sm:text-base text-primary focus:outline-none focus:ring-2 focus:ring-core-primary-500"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 sm:px-4 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-sm sm:text-base text-primary focus:outline-none focus:ring-2 focus:ring-core-primary-500"
        >
          {statuses.map(status => (
            <option key={status} value={status}>{status === 'All' ? 'All Statuses' : status}</option>
          ))}
        </select>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-primary rounded-lg sm:rounded-xl border border-border p-4 sm:p-5 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-core-primary-500/10 transition-all duration-200 group"
            >
              {/* Document Header */}
              <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className={`p-2.5 sm:p-3 rounded-lg bg-gray-50 dark:bg-gray-800 ${getFileTypeColor(doc.type)}`}>
                  <FileText size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-primary text-sm sm:text-base mb-1 truncate group-hover:text-core-primary-500 transition-colors">
                    {doc.name}
                  </h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center">
                    <span className="text-xs text-muted">{doc.type} • {doc.size}</span>
                    {doc.mandatory && (
                      <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                        Mandatory
                      </span>
                    )}
                    {doc.verified && (
                      <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        <CheckCircle size={10} className="sm:w-3 sm:h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Info */}
              <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary">Category:</span>
                  <span className="font-medium text-primary">{doc.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Uploaded:</span>
                  <span className="text-primary">{doc.uploadedDate}</span>
                </div>
                {doc.expiryDate && (
                  <div className="flex justify-between">
                    <span className="text-secondary">Expires:</span>
                    <span className="text-primary">{doc.expiryDate}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-secondary">Status:</span>
                  <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-medium border ${getStatusColor(doc.status)}`}>
                    {doc.status}
                  </span>
                </div>
              </div>

              {/* Document Actions */}
              <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-border">
                <div className="text-xs text-muted truncate mr-2">
                  By {doc.uploadedBy}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleView(doc)}
                    className="p-1.5 sm:p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200"
                    title="View Details"
                  >
                    <Eye size={14} className="sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleVerification(doc.id)}
                    className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                      doc.verified 
                        ? 'text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30' 
                        : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    title={doc.verified ? 'Verified' : 'Mark as Verified'}
                  >
                    <CheckCircle size={14} className="sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(doc)}
                    className="p-1.5 sm:p-2 text-core-primary-500 hover:bg-core-primary-50 dark:hover:bg-core-primary-900/30 rounded-lg transition-all duration-200"
                    title="Edit Document"
                  >
                    <Edit2 size={14} className="sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 sm:p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200"
                    title="Delete Document"
                  >
                    <Trash2 size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-primary rounded-xl border border-border p-8 sm:p-12 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-core-primary-50 dark:bg-core-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <FileText className="text-core-primary-500" size={32} />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2">No Documents Found</h3>
          <p className="text-sm sm:text-base text-secondary mb-4 sm:mb-6">
            {searchTerm || filterCategory !== 'All' || filterStatus !== 'All'
              ? 'No documents match your current filters'
              : 'No documents have been uploaded for this staff member'}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 sm:px-6 py-2 sm:py-2.5 bg-core-primary-500 text-white rounded-lg hover:bg-core-primary-600 transition-colors duration-200 text-sm sm:text-base"
          >
            Upload First Document
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-secondary rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-secondary border-b border-border px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold text-primary">
                {editingDocument ? 'Edit Document' : 'Upload New Document'}
              </h3>
              <button onClick={resetForm} className="p-1.5 sm:p-2 hover:bg-primary rounded-lg transition-colors">
                <X size={18} className="sm:w-5 sm:h-5 text-secondary" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {/* Document Name */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-primary mb-2">
                  Document Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Indemnity Insurance Certificate"
                  className="w-full px-3 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-sm sm:text-base text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-core-primary-500"
                />
              </div>

              {/* Category and Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-primary mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-sm sm:text-base text-primary focus:outline-none focus:ring-2 focus:ring-core-primary-500"
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-primary mb-2">File Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    disabled={!!formData.file}
                    className="w-full px-3 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-sm sm:text-base text-primary focus:outline-none focus:ring-2 focus:ring-core-primary-500"
                  >
                    {fileTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-primary mb-2">
                  Upload File <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 sm:p-8 text-center hover:border-core-primary-500 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.xlsx"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload size={32} className="sm:w-10 sm:h-10 mx-auto text-muted mb-2 sm:mb-3" />
                  <p className="text-sm sm:text-base text-primary font-medium mb-1">
                    {formData.fileName ? formData.fileName : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-muted">PDF, XLSX (Max 10MB)</p>
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-primary mb-2">
                  Expiry Date <span className="text-xs text-muted">(optional)</span>
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-sm sm:text-base text-primary focus:outline-none focus:ring-2 focus:ring-core-primary-500"
                />
              </div>

              {/* Mandatory Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="mandatory"
                  checked={formData.mandatory}
                  onChange={(e) => setFormData({ ...formData, mandatory: e.target.checked })}
                  className="w-4 h-4 text-core-primary-500 border-border rounded focus:ring-2 focus:ring-core-primary-500"
                />
                <label htmlFor="mandatory" className="text-xs sm:text-sm font-medium text-primary cursor-pointer">
                  Mark as mandatory document
                </label>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-primary mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Additional information about this document..."
                  className="w-full px-3 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-sm sm:text-base text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-core-primary-500 resize-none"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-secondary border-t border-border px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-end gap-2 sm:gap-3">
              <button
                onClick={resetForm}
                className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-sm sm:text-base text-secondary hover:bg-core-primary-50 dark:hover:bg-core-primary-900/20 hover:text-core-primary-500 hover:border-core-primary-500 transition-all duration-200"
              >
                <X size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="font-medium">Cancel</span>
              </button>
              <button
                onClick={editingDocument ? handleUpdate : handleAdd}
                className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-core-primary-500 text-white rounded-lg hover:bg-core-primary-600 transition-colors duration-200 shadow-sm text-sm sm:text-base"
              >
                <Save size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="font-medium">{editingDocument ? 'Update' : 'Upload'} Document</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && viewingDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-secondary rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-core-primary-50 dark:bg-core-primary-900/20 border-b border-border px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0">
              <h3 className="text-lg sm:text-xl font-bold text-primary">Document Details</h3>
              <button onClick={() => setShowViewModal(false)} className="p-1.5 sm:p-2 hover:bg-primary rounded-lg transition-colors">
                <X size={18} className="sm:w-5 sm:h-5 text-secondary" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border">
                <div className={`p-3 sm:p-4 rounded-lg bg-gray-50 dark:bg-gray-800 ${getFileTypeColor(viewingDocument.type)}`}>
                  <FileText size={24} className="sm:w-8 sm:h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-primary mb-1 truncate">{viewingDocument.name}</h3>
                  <p className="text-xs sm:text-sm text-muted">{viewingDocument.type} • {viewingDocument.size}</p>
                </div>
                <span className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(viewingDocument.status)}`}>
                  {viewingDocument.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <div className="text-xs text-muted mb-1">Category</div>
                  <div className="font-medium text-sm sm:text-base text-primary">{viewingDocument.category}</div>
                </div>
                <div>
                  <div className="text-xs text-muted mb-1">Uploaded Date</div>
                  <div className="font-medium text-sm sm:text-base text-primary">{viewingDocument.uploadedDate}</div>
                </div>
                {viewingDocument.expiryDate && (
                  <div>
                    <div className="text-xs text-muted mb-1">Expiry Date</div>
                    <div className="font-medium text-sm sm:text-base text-primary">{viewingDocument.expiryDate}</div>
                  </div>
                )}
                <div>
                  <div className="text-xs text-muted mb-1">Uploaded By</div>
                  <div className="font-medium text-sm sm:text-base text-primary">{viewingDocument.uploadedBy}</div>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {viewingDocument.verified && (
                  <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    <CheckCircle size={12} className="sm:w-[14px] sm:h-[14px]" />
                    Verified
                  </span>
                )}
                {viewingDocument.mandatory && (
                  <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                    <AlertCircle size={12} className="sm:w-[14px] sm:h-[14px]" />
                    Mandatory
                  </span>
                )}
              </div>

              {viewingDocument.notes && (
                <div>
                  <div className="text-xs text-muted mb-2">Notes</div>
                  <div className="text-sm sm:text-base text-primary bg-primary border border-border rounded-lg p-2 sm:p-3">
                    {viewingDocument.notes}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border px-4 sm:px-6 py-3 sm:py-4 flex justify-end gap-2 sm:gap-3 sticky bottom-0 bg-secondary">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-primary border border-border rounded-lg text-sm sm:text-base text-secondary hover:bg-core-primary-50 dark:hover:bg-core-primary-900/20 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => handleDownload(viewingDocument)}
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-core-primary-500 text-white rounded-lg hover:bg-core-primary-600 transition-colors text-sm sm:text-base"
              >
                <Download size={14} className="sm:w-4 sm:h-4 inline mr-1.5 sm:mr-2" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentTab;