import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { toast } from '../../components/Toast';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Calendar,
  X,
  Award,
  BookOpen
} from 'lucide-react';
import { CreateInstructorDto, UpdateInstructorDto } from '../../types/api';

export default function InstructorsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedInstructorId, setSelectedInstructorId] = useState<number | null>(null);

  // Modal control states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [managerModalOpen, setManagerModalOpen] = useState(false);

  // Form states
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formSalary, setFormSalary] = useState(50000);
  const [formHireDate, setFormHireDate] = useState(new Date().toISOString().split('T')[0]);
  const [formManagerId, setFormManagerId] = useState<string>('');
  const [formIsActive, setFormIsActive] = useState(true);

  // Manager Assignment state
  const [selectedManagerId, setSelectedManagerId] = useState<string>('');

  // 1. Fetching Instructors
  const { data: instructors, isLoading } = useQuery({
    queryKey: ['instructors', activeTab],
    queryFn: () => {
      if (activeTab === 'active') return apiService.instructors.getActive();
      if (activeTab === 'inactive') return apiService.instructors.getInactive();
      return apiService.instructors.getAll();
    },
  });

  // Selected instructor detail queries (only run when selectedInstructorId is not null)
  const { data: instructorDetail } = useQuery({
    queryKey: ['instructor', selectedInstructorId],
    queryFn: () => apiService.instructors.getById(selectedInstructorId!),
    enabled: selectedInstructorId !== null,
  });

  const { data: assignedCourses } = useQuery({
    queryKey: ['instructorCourses', selectedInstructorId],
    queryFn: () => apiService.instructors.getCourses(selectedInstructorId!),
    enabled: selectedInstructorId !== null,
  });

  const { data: subordinates } = useQuery({
    queryKey: ['instructorSubordinates', selectedInstructorId],
    queryFn: () => apiService.instructors.getSubordinates(selectedInstructorId!),
    enabled: selectedInstructorId !== null,
  });

  // 2. Mutations
  const createMutation = useMutation({
    mutationFn: apiService.instructors.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      toast.success('Instructor Created', 'New instructor profile added successfully.');
      setCreateModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error('Creation Failed', err.response?.data?.message || 'Failed to create instructor.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateInstructorDto }) =>
      apiService.instructors.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', selectedInstructorId] });
      toast.success('Instructor Updated', 'Profile updated successfully.');
      setEditModalOpen(false);
    },
    onError: (err: any) => {
      toast.error('Update Failed', err.response?.data?.message || 'Failed to update instructor.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: apiService.instructors.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      toast.success('Instructor Deleted', 'Instructor profile removed successfully.');
      setSelectedInstructorId(null);
    },
    onError: (err: any) => {
      toast.error('Deletion Failed', err.response?.data?.message || 'Failed to delete instructor.');
    },
  });

  const activateMutation = useMutation({
    mutationFn: apiService.instructors.activate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', selectedInstructorId] });
      toast.success('Activated', 'Instructor has been activated.');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: apiService.instructors.deactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', selectedInstructorId] });
      toast.success('Deactivated', 'Instructor has been deactivated.');
    },
  });

  const assignManagerMutation = useMutation({
    mutationFn: ({ id, managerId }: { id: number; managerId: number | null }) =>
      apiService.instructors.assignManager(id, { managerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', selectedInstructorId] });
      toast.success('Hierarchy Updated', 'Manager assignment saved successfully.');
      setManagerModalOpen(false);
    },
    onError: (err: any) => {
      toast.error('Assignment Failed', err.response?.data?.message || 'Failed to assign manager.');
    },
  });

  const resetForm = () => {
    setFormFirstName('');
    setFormLastName('');
    setFormEmail('');
    setFormPassword('');
    setFormSalary(50000);
    setFormHireDate(new Date().toISOString().split('T')[0]);
    setFormManagerId('');
    setFormIsActive(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateInstructorDto = {
      firstName: formFirstName,
      lastName: formLastName,
      email: formEmail,
      password: formPassword || 'TempPass123!',
      salary: Number(formSalary),
      hireDate: formHireDate,
      managerId: formManagerId ? Number(formManagerId) : null,
      isActive: formIsActive,
    };
    createMutation.mutate(payload);
  };

  const handleEditOpen = () => {
    if (!instructorDetail) return;
    setFormFirstName(instructorDetail.fullName?.split(' ')[0] || '');
    setFormLastName(instructorDetail.fullName?.split(' ')[1] || '');
    setFormPassword('');
    setFormSalary(instructorDetail.salary);
    setFormManagerId(instructorDetail.managerId?.toString() || '');
    setFormIsActive(instructorDetail.isActive);
    setEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstructorId) return;
    const payload: UpdateInstructorDto = {
      firstName: formFirstName,
      lastName: formLastName,
      password: formPassword || null,
      salary: Number(formSalary),
      managerId: formManagerId ? Number(formManagerId) : null,
      isActive: formIsActive,
    };
    updateMutation.mutate({ id: selectedInstructorId, data: payload });
  };

  const handleAssignManagerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstructorId) return;
    assignManagerMutation.mutate({
      id: selectedInstructorId,
      managerId: selectedManagerId ? Number(selectedManagerId) : null,
    });
  };

  // Searching logic
  const filteredInstructors = instructors?.filter((ins) => {
    const query = searchQuery.toLowerCase();
    return (
      ins.fullName?.toLowerCase().includes(query) ||
      ins.email?.toLowerCase().includes(query) ||
      ins.instructorId.toString().includes(query)
    );
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header and top control triggers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Instructors Faculty</h1>
          <p className="text-xs text-zinc-500 mt-1">Manage corporate instructors, hierarchy subordinates, and assigned syllabus</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setCreateModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white dark:text-zinc-950 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Instructor
        </button>
      </div>

      {/* Tabs and search filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
        {/* Status filters */}
        <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl w-fit">
          <button
            onClick={() => {
              setActiveTab('all');
              setSelectedInstructorId(null);
            }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            All Faculty
          </button>
          <button
            onClick={() => {
              setActiveTab('active');
              setSelectedInstructorId(null);
            }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'active'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Active Only
          </button>
          <button
            onClick={() => {
              setActiveTab('inactive');
              setSelectedInstructorId(null);
            }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'inactive'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Inactive
          </button>
        </div>

        {/* Search Input */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by ID, name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-50 transition-all"
          />
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Instructors List Table */}
        <div className={`lg:col-span-2 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4 ${selectedInstructorId ? 'hidden lg:block' : 'block'}`}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Instructors Directory ({filteredInstructors.length})</h2>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
              <p className="text-xs text-zinc-400">Loading faculty roster...</p>
            </div>
          ) : filteredInstructors.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
              <Users className="w-8 h-8 text-zinc-300 mx-auto" />
              <p className="text-xs font-medium text-zinc-400">No instructors found matching criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-2">ID</th>
                    <th className="py-3 px-2">Instructor Name</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/40 font-medium">
                  {filteredInstructors.map((ins) => {
                    const isSelected = selectedInstructorId === ins.instructorId;
                    return (
                      <tr
                        key={ins.instructorId}
                        onClick={() => setSelectedInstructorId(ins.instructorId)}
                        className={`hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-all cursor-pointer ${
                          isSelected ? 'bg-zinc-100/60 dark:bg-zinc-800/40' : ''
                        }`}
                      >
                        <td className="py-3.5 px-2 font-mono font-semibold text-zinc-500">{ins.instructorId}</td>
                        <td className="py-3.5 px-2">
                          <div>
                            <p className="font-semibold text-zinc-800 dark:text-zinc-200">{ins.fullName}</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">{ins.email}</p>
                          </div>
                        </td>
                        <td className="py-3.5 px-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              ins.isActive
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {ins.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-right">
                          <ChevronRight className="w-4 h-4 text-zinc-400 inline" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side: Instructor Detail Workspace Panel */}
        <div className={`p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-6 overflow-y-auto max-h-[80vh] ${selectedInstructorId ? 'block' : 'hidden lg:block'}`}>
          {!selectedInstructorId ? (
            <div className="h-full py-16 flex flex-col items-center justify-center text-center gap-3">
              <Users className="w-10 h-10 text-zinc-300" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider">Faculty Workspace</h3>
                <p className="text-xs text-zinc-400 max-w-xs mt-1 leading-relaxed">
                  Select an instructor from the directory to review hire date, manager assignments, subordinate structures, and active syllabus.
                </p>
              </div>
            </div>
          ) : !instructorDetail ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
              <p className="text-xs text-zinc-400">Fetching workspace record...</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Back button for mobile screens */}
              <button
                onClick={() => setSelectedInstructorId(null)}
                className="lg:hidden mb-4 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Instructors Directory
              </button>

              {/* Workspace Header */}
              <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-zinc-400">INSTRUCTOR ID: {instructorDetail.instructorId}</span>
                    <h2 className="text-base font-bold tracking-tight mt-0.5">{instructorDetail.fullName}</h2>
                    <p className="text-xs text-zinc-400">{instructorDetail.email}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={handleEditOpen}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                      title="Edit Profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you absolutely sure you want to delete this instructor? This action is irreversible.')) {
                          deleteMutation.mutate(instructorDetail.instructorId);
                        }
                      }}
                      className="p-1.5 rounded-lg border border-rose-200/50 dark:border-rose-900/30 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400"
                      title="Delete Instructor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Main Action buttons for status toggle */}
                <div className="flex gap-2 mt-4">
                  {instructorDetail.isActive ? (
                    <button
                      onClick={() => deactivateMutation.mutate(instructorDetail.instructorId)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-rose-200 dark:border-rose-900/30 bg-rose-50/40 dark:bg-rose-950/10 text-rose-600 dark:text-rose-400"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => activateMutation.mutate(instructorDetail.instructorId)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/40 dark:bg-emerald-950/10 text-emerald-600 dark:text-emerald-400"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Activate
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedManagerId(instructorDetail.managerId?.toString() || '');
                      setManagerModalOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400"
                  >
                    <Award className="w-3.5 h-3.5" />
                    Set Manager
                  </button>
                </div>
              </div>

              {/* Salary & Hire details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-zinc-400 block font-semibold uppercase tracking-wider text-[9px]">Annual Salary</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">${instructorDetail.salary.toLocaleString()}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-zinc-400 block font-semibold uppercase tracking-wider text-[9px]">Hire Date</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    {new Date(instructorDetail.hireDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Manager assignment status */}
              <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs">
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Assigned Supervisor</span>
                {instructorDetail.managerId ? (
                  <p className="font-bold text-zinc-800 dark:text-zinc-200">Manager ID: {instructorDetail.managerId}</p>
                ) : (
                  <p className="text-zinc-500 font-medium">No manager assigned (Independent Faculty)</p>
                )}
              </div>

              {/* Subordinates section */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Subordinates ({subordinates?.length || 0})</h4>
                {subordinates?.length === 0 ? (
                  <p className="text-xs text-zinc-500 font-medium italic">No managed subordinates assigned.</p>
                ) : (
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {subordinates?.map((sub) => (
                      <div key={sub.instructorId} className="p-2 border border-zinc-100 dark:border-zinc-800/50 rounded-lg flex justify-between items-center text-xs">
                        <div>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200">{sub.fullName}</p>
                          <p className="text-[9px] text-zinc-400">{sub.email}</p>
                        </div>
                        <span className="text-[9px] font-bold uppercase text-emerald-500">{sub.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assigned Course list */}
              <div className="space-y-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                  Syllabus Courses Assigned ({assignedCourses?.length || 0})
                </h4>
                {assignedCourses?.length === 0 ? (
                  <p className="text-xs text-zinc-500 font-medium italic">No active courses assigned to this instructor.</p>
                ) : (
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {assignedCourses?.map((crs) => (
                      <div key={crs.courseId} className="p-2 border border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-lg text-xs">
                        <p className="font-bold text-zinc-800 dark:text-zinc-200">{crs.title}</p>
                        <div className="flex justify-between items-center mt-1 text-[9px] text-zinc-400 font-semibold uppercase">
                          <span>CODE: {crs.code}</span>
                          <span className={`px-1.5 py-0.5 rounded-full ${crs.status === 'Published' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                            {crs.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ====================================
          MODAL: CREATE INSTRUCTOR
          ==================================== */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider">New Instructor Registration</h3>
              <button onClick={() => setCreateModalOpen(false)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    placeholder="Jane"
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Email address</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="jane.doe@trainingcenter.com"
                  className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Security Password</label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Keep blank for default TempPass123!"
                  className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Annual Salary ($)</label>
                  <input
                    type="number"
                    value={formSalary}
                    onChange={(e) => setFormSalary(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Hire Date</label>
                  <input
                    type="date"
                    required
                    value={formHireDate}
                    onChange={(e) => setFormHireDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Manager Assign ID (Optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1"
                    value={formManagerId}
                    onChange={(e) => setFormManagerId(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Active Status</label>
                  <select
                    value={formIsActive ? 'true' : 'false'}
                    onChange={(e) => setFormIsActive(e.target.value === 'true')}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none font-semibold text-zinc-700"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full py-2.5 text-xs font-semibold text-white dark:text-zinc-950 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {createMutation.isPending ? 'Saving Instructor...' : 'Register Instructor'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================
          MODAL: EDIT INSTRUCTOR
          ==================================== */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider">Edit Instructor Profile</h3>
              <button onClick={() => setEditModalOpen(false)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Change Security Password (Optional)</label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Keep blank to leave unchanged"
                  className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Annual Salary ($)</label>
                  <input
                    type="number"
                    value={formSalary}
                    onChange={(e) => setFormSalary(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Active Status</label>
                  <select
                    value={formIsActive ? 'true' : 'false'}
                    onChange={(e) => setFormIsActive(e.target.value === 'true')}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Manager Assign ID (Optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 1"
                  value={formManagerId}
                  onChange={(e) => setFormManagerId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full py-2.5 text-xs font-semibold text-white dark:text-zinc-950 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Updating Profile...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================
          MODAL: ASSIGN MANAGER
          ==================================== */}
      {managerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-w-sm w-full rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider">Assign Instructor Manager</h3>
              <button onClick={() => setManagerModalOpen(false)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignManagerSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Manager ID Number</label>
                <input
                  type="number"
                  placeholder="e.g. 2 (Leave empty to remove manager)"
                  value={selectedManagerId}
                  onChange={(e) => setSelectedManagerId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                />
                <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed">
                  Provide the integer Supervisor ID of the instructor who will supervise this faculty member.
                </p>
              </div>

              <button
                type="submit"
                disabled={assignManagerMutation.isPending}
                className="w-full py-2.5 text-xs font-semibold text-white dark:text-zinc-950 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer shadow-md"
              >
                {assignManagerMutation.isPending ? 'Assigning...' : 'Save Hierarchy Manager'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
