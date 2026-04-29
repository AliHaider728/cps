import React, { useState , useRef } from 'react';
import { Camera, X, Search, Edit2, Save } from 'lucide-react';

const PersonalInfoTab = ({ staffData, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  // State management for dynamic fields
  const [selectedApprovers, setSelectedApprovers] = useState([
    { id: 1, name: 'Zara Ahmed' },
    { id: 4, name: 'Dr. Bilal Khan' }
  ]);
  
  const [approverSearch, setApproverSearch] = useState('');
  const [showApproverDropdown, setShowApproverDropdown] = useState(false);
  
  const [selectedTeams, setSelectedTeams] = useState([
    { id: 1, name: 'Pharmacy Team' }
  ]);
  
  const [teamSearch, setTeamSearch] = useState('');
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  
  const [selectedViewTeams, setSelectedViewTeams] = useState([
    { id: 2, name: 'Clinical Operations' }
  ]);
  
  const [viewTeamSearch, setViewTeamSearch] = useState('');
  const [showViewTeamDropdown, setShowViewTeamDropdown] = useState(false);

  const [selectedDocumentGroup, setSelectedDocumentGroup] = useState('');
  const [selectedTrainingGroup, setSelectedTrainingGroup] = useState('');

  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Mock data for dropdowns
  const availableApprovers = [
    { id: 1, name: 'Zara Ahmed' },
    { id: 2, name: 'Omar Farooq' },
    { id: 3, name: 'Sana Malik' },
    { id: 4, name: 'Dr. Bilal Khan' },
    { id: 5, name: 'Amina Raza' },
    { id: 6, name: 'Tariq Jamil' },
    { id: 7, name: 'Nida Hussain' },
    { id: 8, name: 'Rehan Siddiqui' }
  ];

  const availableTeams = [
    { id: 1, name: 'Pharmacy Team' },
    { id: 2, name: 'Clinical Operations' },
    { id: 3, name: 'Admin & HR' },
    { id: 4, name: 'Management' },
    { id: 5, name: 'Compliance' },
    { id: 6, name: 'Finance Team' }
  ];

  const documentGroups = [
    'Core Compliance Docs',
    'Identity Verification',
    'Professional Registrations',
    'Insurance & Liability',
    'CPD & Training Records',
    'Health Screening',
    'Regulatory Filings'
  ];

  const trainingGroups = [
    'Pharmacist CPD',
    'Health & Safety Induction',
    'Data Protection & GDPR',
    'Leadership Development',
    'Mandatory Annual Refreshers',
    'Specialty Modules'
  ];

  // Handlers
  const filteredApprovers = availableApprovers.filter(approver => 
    !selectedApprovers.find(s => s.id === approver.id) &&
    approver.name.toLowerCase().includes(approverSearch.toLowerCase())
  );

  const addApprover = (approver) => {
    setSelectedApprovers([...selectedApprovers, approver]);
    setApproverSearch('');
    setShowApproverDropdown(false);
  };

  const removeApprover = (id) => {
    if (isEditing) {
      setSelectedApprovers(selectedApprovers.filter(a => a.id !== id));
    }
  };

  const filteredTeams = availableTeams.filter(team => 
    !selectedTeams.find(s => s.id === team.id) &&
    team.name.toLowerCase().includes(teamSearch.toLowerCase())
  );

  const addTeam = (team) => {
    setSelectedTeams([...selectedTeams, team]);
    setTeamSearch('');
    setShowTeamDropdown(false);
  };

  const removeTeam = (id) => {
    if (isEditing) {
      setSelectedTeams(selectedTeams.filter(t => t.id !== id));
    }
  };

  const filteredViewTeams = availableTeams.filter(team => 
    !selectedViewTeams.find(s => s.id === team.id) &&
    team.name.toLowerCase().includes(viewTeamSearch.toLowerCase())
  );

  const addViewTeam = (team) => {
    setSelectedViewTeams([...selectedViewTeams, team]);
    setViewTeamSearch('');
    setShowViewTeamDropdown(false);
  };

  const removeViewTeam = (id) => {
    if (isEditing) {
      setSelectedViewTeams(selectedViewTeams.filter(t => t.id !== id));
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    if (onUpdate) {
      onUpdate({
        // collect all form data
        photoPreview: photoPreview
      });
    }
  };

  return (
    <div className="bg-primary min-h-screen">
      {/* Header with Edit Button */}
      <div className="bg-secondary border-b border-[var(--border-color)] px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-primary">Staff Detail - Personal Information</h2>
          <p className="text-sm text-secondary">Ali Hassan - Pharmacist - Pharmacy Team</p>
        </div>
        <div className="flex gap-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium"
            >
              <Edit2 size={18} />
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                <Save size={18} />
                Save
              </button>
            </>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Grid changed to single column for better control */}
        <div className="space-y-6">
          {/* Top Section: Basic Info + Right Column Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information - Takes 2 columns */}
            <div className="lg:col-span-2">
              <div className="bg-secondary rounded-lg border border-[var(--border-color)] p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Employee Code
                    </label>
                    <input
                      type="text"
                      defaultValue="PK7890"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Region
                    </label>
                    <select
                      defaultValue="Islamabad Capital Territory"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option>Select Region</option>
                      <option>Islamabad Capital Territory</option>
                      <option>Punjab</option>
                      <option>Sindh</option>
                      <option>Khyber Pakhtunkhwa</option>
                      <option>Balochistan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Login Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      defaultValue="alihassan"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Office Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      defaultValue="ali.hassan@coreprescribingsolutions.co"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      defaultValue="Ali"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      defaultValue=""
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      defaultValue="Hassan"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Birth Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      defaultValue="1992-07-20"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      defaultValue="Pharmacy Team"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option>Pharmacy Team</option>
                      <option>Clinical Operations</option>
                      <option>Admin & HR</option>
                      <option>Management</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Line Manager <span className="text-red-500">*</span>
                    </label>
                    <select
                      defaultValue="Dr. Bilal Khan"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option>Dr. Bilal Khan</option>
                      <option>Zara Ahmed</option>
                      <option>Sana Malik</option>
                      <option>Omar Farooq</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      defaultValue="Pharmacist"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      defaultValue="Male"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      defaultValue="Employed"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option>Employed</option>
                      <option>Limited Company</option>
                      <option>Contractor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Mobile <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      defaultValue="03451234567"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      defaultValue="Working"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option>Working</option>
                      <option>Left</option>
                      <option>On Leave</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Joining Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      defaultValue="2021-06-15"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Address
                    </label>
                    <textarea
                      rows="2"
                      defaultValue="House #123, Street 10, F-8 Markaz, Islamabad"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Home Telephone
                    </label>
                    <input
                      type="tel"
                      defaultValue="051-87654321"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Review Date
                    </label>
                    <input
                      type="date"
                      defaultValue="2025-06-15"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Home Email
                    </label>
                    <input
                      type="email"
                      defaultValue="ali.hassan.personal@gmail.com"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Leaving Date
                    </label>
                    <input
                      type="date"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-secondary cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={false}
                        disabled={!isEditing}
                        className="w-4 h-4 text-blue-600 bg-primary border-[var(--border-color)] rounded focus:ring-blue-500 disabled:cursor-not-allowed"
                      />
                      Non Medical Prescriber
                    </label>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-secondary cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        disabled={!isEditing}
                        className="w-4 h-4 text-blue-600 bg-primary border-[var(--border-color)] rounded focus:ring-blue-500 disabled:cursor-not-allowed"
                      />
                      Access to Report System
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Checked On
                    </label>
                    <input
                      type="date"
                      defaultValue="2024-01-10"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Hour Per Week
                    </label>
                    <input
                      type="number"
                      defaultValue="40"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Hour Per Day
                    </label>
                    <input
                      type="number"
                      defaultValue="8"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Smartcard number
                    </label>
                    <input
                      type="text"
                      defaultValue="987654321098"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Team */}
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Team <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {selectedTeams.map(team => (
                          <span 
                            key={team.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm bg-blue-100 text-blue-700 border border-blue-200"
                          >
                            {team.name}
                            {isEditing && (
                              <button
                                onClick={() => removeTeam(team.id)}
                                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                      
                      {isEditing && (
                        <div className="relative">
                          <input
                            type="text"
                            value={teamSearch}
                            onChange={(e) => {
                              setTeamSearch(e.target.value);
                              setShowTeamDropdown(true);
                            }}
                            onFocus={() => setShowTeamDropdown(true)}
                            placeholder="Search teams..."
                            className="w-full px-4 py-2 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          
                          {showTeamDropdown && filteredTeams.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-secondary border border-[var(--border-color)] rounded-md shadow-lg max-h-48 overflow-y-auto">
                              {filteredTeams.map(team => (
                                <button
                                  key={team.id}
                                  onClick={() => addTeam(team)}
                                  className="w-full text-left px-4 py-2 hover:bg-blue-50 text-primary"
                                >
                                  {team.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* View Team */}
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      View Team
                    </label>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {selectedViewTeams.map(team => (
                          <span 
                            key={team.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm bg-green-100 text-green-700 border border-green-200"
                          >
                            {team.name}
                            {isEditing && (
                              <button
                                onClick={() => removeViewTeam(team.id)}
                                className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                      
                      {isEditing && (
                        <div className="relative">
                          <input
                            type="text"
                            value={viewTeamSearch}
                            onChange={(e) => {
                              setViewTeamSearch(e.target.value);
                              setShowViewTeamDropdown(true);
                            }}
                            onFocus={() => setShowViewTeamDropdown(true)}
                            placeholder="Search teams..."
                            className="w-full px-4 py-2 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          
                          {showViewTeamDropdown && filteredViewTeams.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-secondary border border-[var(--border-color)] rounded-md shadow-lg max-h-48 overflow-y-auto">
                              {filteredViewTeams.map(team => (
                                <button
                                  key={team.id}
                                  onClick={() => addViewTeam(team)}
                                  className="w-full text-left px-4 py-2 hover:bg-green-50 text-primary"
                                >
                                  {team.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Clinician Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      defaultValue="Clinical"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option>Non Clinical</option>
                      <option>Clinical</option>
                      <option>Medical</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-secondary cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={false}
                        disabled={!isEditing}
                        className="w-4 h-4 text-blue-600 bg-primary border-[var(--border-color)] rounded focus:ring-blue-500 disabled:cursor-not-allowed"
                      />
                      Line Manager
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Valid GPhC Reg
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          disabled={!isEditing}
                          className="w-4 h-4 text-blue-600 bg-primary border-[var(--border-color)] rounded focus:ring-blue-500 disabled:cursor-not-allowed"
                        />
                        <span className="text-sm text-secondary">Yes</span>
                      </label>
                      <input
                        type="text"
                        defaultValue="7654321"
                        disabled={!isEditing}
                        className="flex-1 px-4 py-2 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Exp. Date
                    </label>
                    <input
                      type="date"
                      defaultValue="2028-05-31"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Checked On
                    </label>
                    <input
                      type="date"
                      defaultValue="2024-11-20"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-2 text-sm font-medium text-secondary cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={false}
                        disabled={!isEditing}
                        className="w-4 h-4 text-blue-600 bg-primary border-[var(--border-color)] rounded focus:ring-blue-500 disabled:cursor-not-allowed"
                      />
                      GPhC/NMC N/A
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Notice Period
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        defaultValue="4"
                        disabled={!isEditing}
                        className="flex-1 px-4 py-2 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                      <span className="text-sm text-secondary">( Weeks )</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Photo and Other Fields */}
            <div className="space-y-6">
              {/* Photo Upload */}
              <div className="bg-secondary rounded-lg border border-[var(--border-color)] p-6 text-center">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile Preview"
                    className="w-32 h-32 mx-auto rounded-lg object-cover mb-4"
                  />
                ) : (
                  <div className="w-32 h-32 mx-auto bg-gray-300 rounded-lg flex items-center justify-center mb-4">
                    <Camera size={48} className="text-gray-500" />
                  </div>
                )}

                {isEditing && (
                  <>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                    >
                      <Camera size={16} />
                      <span className="text-sm font-medium">Upload Photo</span>
                    </button>

                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setPhotoPreview(reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </>
                )}
              </div>

              {/* Contractor Code */}
              <div className="bg-secondary rounded-lg border border-[var(--border-color)] p-5">
                <label className="block text-sm font-medium text-secondary mb-2">
                  Contractor Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  defaultValue="AH123"
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              {/* Cover Approver */}
              <div className="bg-secondary rounded-lg border border-[var(--border-color)] p-5">
                <label className="block text-sm font-medium text-secondary mb-3">
                  Cover Approver <span className="text-red-500">*</span>
                </label>
                
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {selectedApprovers.map(approver => (
                      <span 
                        key={approver.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm bg-blue-100 text-blue-700 border border-blue-200"
                      >
                        {approver.name}
                        {isEditing && (
                          <button
                            onClick={() => removeApprover(approver.id)}
                            className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                  
                  {isEditing && (
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" size={18} />
                        <input
                          type="text"
                          value={approverSearch}
                          onChange={(e) => {
                            setApproverSearch(e.target.value);
                            setShowApproverDropdown(true);
                          }}
                          onFocus={() => setShowApproverDropdown(true)}
                          placeholder="Search approvers..."
                          className="w-full pl-10 pr-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      {showApproverDropdown && filteredApprovers.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-secondary border border-[var(--border-color)] rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {filteredApprovers.map(approver => (
                            <button
                              key={approver.id}
                              onClick={() => addApprover(approver)}
                              className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-primary transition-colors border-b border-[var(--border-color)] last:border-b-0"
                            >
                              {approver.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* NI Number */}
              <div className="bg-secondary rounded-lg border border-[var(--border-color)] p-5">
                <label className="block text-sm font-medium text-secondary mb-2">
                  NI Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  defaultValue="AB123456C"
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              {/* Extension */}
              <div className="bg-secondary rounded-lg border border-[var(--border-color)] p-5">
                <label className="block text-sm font-medium text-secondary mb-2">
                  Extension
                </label>
                <input
                  type="text"
                  defaultValue="456"
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              {/* Emergency Contact Detail - 1 */}
              <div className="bg-secondary rounded-lg border border-[var(--border-color)] p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Emergency Contact Detail - 1</h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      defaultValue="Sara Hassan"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Home Telephone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      defaultValue="03457654321"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Work Telephone
                    </label>
                    <input
                      type="tel"
                      defaultValue="051-1112222"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Relationship <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      defaultValue="Wife"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows="2"
                      defaultValue="House #123, Street 10, F-8 Markaz, Islamabad"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact Detail - 2 */}
              <div className="bg-secondary rounded-lg border border-[var(--border-color)] p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Emergency Contact Detail - 2</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      defaultValue="Muhammad Raza"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Home Telephone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      defaultValue="03339876543"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Work Telephone
                    </label>
                    <input
                      type="tel"
                      defaultValue=""
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Relationship <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      defaultValue="Father"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows="2"
                      defaultValue="Village Pindi, Near Rawalpindi"
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Detail - FULL WIDTH */}
          <div className="bg-secondary rounded-lg border border-[var(--border-color)] p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Bank Detail</h3>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded">
              <p className="text-sm text-yellow-800">
                Please ensure your details are correct. If you need to amend your bank account details, you <strong>must</strong> contact us and request this by emailing compliance.coreprescribingsolutions@nhs.net with the details.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue="Ali Hassan"
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Account No
                </label>
                <input
                  type="text"
                  defaultValue="12345678"
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Limited Company Name (if applicable)
                </label>
                <input
                  type="text"
                  defaultValue=""
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Sort Code
                </label>
                <input
                  type="text"
                  defaultValue="12-34-56"
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary mb-2">
                  Address
                </label>
                <textarea
                  rows="2"
                  defaultValue="House #123, Street 10, F-8 Markaz, Islamabad"
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  defaultValue="Pharmacist"
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option>Pharmacist</option>
                  <option>Admin</option>
                  <option>Manager</option>
                  <option>Director</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Group <span className="text-red-500">*</span>
                </label>
                <select
                  defaultValue="Pharmacy Team"
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option>Pharmacy Team</option>
                  <option>Clinical Operations</option>
                  <option>Admin & HR</option>
                  <option>Management</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Document Group
                </label>
                <select
                  value={selectedDocumentGroup}
                  onChange={(e) => setSelectedDocumentGroup(e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">Select Document Group...</option>
                  {documentGroups.map((group, index) => (
                    <option key={index} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Training Group
                </label>
                <select
                  value={selectedTrainingGroup}
                  onChange={(e) => setSelectedTrainingGroup(e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">Select Training Group...</option>
                  {trainingGroups.map((group, index) => (
                    <option key={index} value={group}>{group}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Timesheet Detail - FULL WIDTH */}
          <div className="bg-secondary rounded-lg border border-[var(--border-color)] p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Timesheet Detail</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Company <span className="text-red-500">*</span>
                </label>
                <select
                  defaultValue="CPS"
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option>CPS</option>
                  <option>NHS</option>
                  <option>Private</option>
                </select>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm font-medium text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={false}
                    disabled={!isEditing}
                    className="w-4 h-4 text-blue-600 bg-primary border-[var(--border-color)] rounded focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                  Vat Registered
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  defaultValue="Bacs"
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option>Bacs</option>
                  <option>Cheque</option>
                  <option>Cash</option>
                  <option>Bank Transfer</option>
                </select>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm font-medium text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={false}
                    disabled={!isEditing}
                    className="w-4 h-4 text-blue-600 bg-primary border-[var(--border-color)] rounded focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                  Finance Controller
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Vat Registration No
                </label>
                <input
                  type="text"
                  defaultValue=""
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  NI Table Letter
                </label>
                <input
                  type="text"
                  defaultValue="A"
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 bg-primary border border-[var(--border-color)] rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoTab;