import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { toast } from '../../components/Toast';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
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
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

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

  const { data: subordinates } = useQuery({
    queryKey: ['instructorSubordinates', selectedInstructorId],
    queryFn: async () => {
      try {
        return await apiService.instructors.getSubordinates(selectedInstructorId!);
      } catch (err: any) {
        if (err.response?.status === 404 || err.response?.status === 500) {
          return [];
        }
        throw err;
      }
    },
    enabled: selectedInstructorId !== null,
  });

  const { data: assignedCourses } = useQuery({
    queryKey: ['instructorCourses', selectedInstructorId],
    queryFn: async () => {
      try {
        return await apiService.instructors.getCourses(selectedInstructorId!);
      } catch (err: any) {
        if (err.response?.status === 404 || err.response?.status === 500) {
          return [];
        }
        throw err;
      }
    },
    enabled: selectedInstructorId !== null,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (dto: CreateInstructorDto) => apiService.instructors.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      toast.success(t('instructors.addFacultySuccess'), t('instructors.addFacultySuccessDesc'));
      setCreateModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(t('common.error'), err.response?.data?.message || err.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateInstructorDto }) =>
      apiService.instructors.update(id, dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', selectedInstructorId] });
      toast.success(t('instructors.updateFacultySuccess'), t('instructors.updateFacultySuccessDesc'));
      setEditModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(t('common.error'), err.response?.data?.message || err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiService.instructors.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      setSelectedInstructorId(null);
      toast.success(t('instructors.deleteFacultySuccess'), t('instructors.deleteFacultySuccessDesc'));
    },
    onError: (err: any) => {
      toast.error(t('common.error'), err.response?.data?.message || err.message);
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: number) => apiService.instructors.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', selectedInstructorId] });
      toast.success(t('common.success'), t('instructors.updateFacultySuccessDesc'));
    },
    onError: (err: any) => {
      toast.error(t('common.error'), err.response?.data?.message || err.message);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => apiService.instructors.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', selectedInstructorId] });
      toast.success(t('common.success'), t('instructors.updateFacultySuccessDesc'));
    },
    onError: (err: any) => {
      toast.error(t('common.error'), err.response?.data?.message || err.message);
    },
  });

  const assignManagerMutation = useMutation({
    mutationFn: ({ instructorId, managerId }: { instructorId: number; managerId: number | null }) =>
      apiService.instructors.assignManager(instructorId, { managerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', selectedInstructorId] });
      toast.success(t('instructors.updateFacultySuccess'), t('instructors.updateFacultySuccessDesc'));
      setManagerModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(t('common.error'), err.response?.data?.message || err.message);
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
    const managerVal = formManagerId.trim() ? parseInt(formManagerId.trim()) : null;
    createMutation.mutate({
      firstName: formFirstName,
      lastName: formLastName,
      email: formEmail,
      password: formPassword || 'TempPass123!',
      salary: formSalary,
      hireDate: formHireDate,
      managerId: managerVal,
      isActive: formIsActive,
    });
  };

  const handleEditOpen = () => {
    if (!instructorDetail) return;
    const names = (instructorDetail.fullName || '').split(' ');
    setFormFirstName(names[0] || '');
    setFormLastName(names.slice(1).join(' ') || '');
    setFormEmail(instructorDetail.email);
    setFormPassword('');
    setFormSalary(instructorDetail.salary);
    setFormIsActive(instructorDetail.isActive);
    setFormManagerId(instructorDetail.managerId?.toString() || '');
    setEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstructorId) return;
    const managerVal = formManagerId.trim() ? parseInt(formManagerId.trim()) : null;
    updateMutation.mutate({
      id: selectedInstructorId,
      dto: {
        firstName: formFirstName,
        lastName: formLastName,
        salary: formSalary,
        isActive: formIsActive,
        password: formPassword.trim() ? formPassword : null,
        managerId: managerVal,
      },
    });
  };

  const handleAssignManagerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstructorId) return;
    const managerVal = selectedManagerId.trim() ? parseInt(selectedManagerId.trim()) : null;
    assignManagerMutation.mutate({
      instructorId: selectedInstructorId,
      managerId: managerVal,
    });
  };

  // Filter local instructors list based on Search query
  const filteredInstructors = instructors
    ? instructors.filter((ins) => {
        const query = searchQuery.toLowerCase();
        return (
          ins.fullName.toLowerCase().includes(query) ||
          ins.email.toLowerCase().includes(query) ||
          ins.instructorId.toString().includes(query)
        );
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Upper header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{t('instructors.directoryTitle')}</h1>
          <p className="text-xs text-zinc-500 mt-0.5">{t('dashboard.resourcesSubtitle')}</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setCreateModalOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white dark:text-zinc-950 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('instructors.addInstructor')}</span>
        </button>
      </div>

      {/* Filter tabs & Search area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-100/60 dark:bg-zinc-900/40 p-1.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            {t('common.all')}
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            {t('common.active')}
          </button>
          <button
            onClick={() => setActiveTab('inactive')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'inactive'
                ? 'bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            {t('common.inactive')}
          </button>
        </div>

        {/* Search Input */}
        <div className="relative max-w-sm w-full">
          <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-2.5 w-4 h-4 text-zinc-400`} />
          <input
            type="text"
            placeholder={t('instructors.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-50 transition-all`}
          />
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Instructors List Table */}
        <div className={`lg:col-span-2 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4 ${selectedInstructorId ? 'hidden lg:block' : 'block'}`}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
            {t('instructors.directoryTitle')} ({filteredInstructors.length})
          </h2>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
              <p className="text-xs text-zinc-400">{t('instructors.loadingList')}</p>
            </div>
          ) : filteredInstructors.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
              <Users className="w-8 h-8 text-zinc-300 mx-auto" />
              <p className="text-xs font-medium text-zinc-400">{t('instructors.noInstructors')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`w-full ${isRtl ? 'text-right' : 'text-left'} text-xs`}>
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-2">{t('common.id')}</th>
                    <th className="py-3 px-2">{t('instructors.addInstructor')}</th>
                    <th className="py-3 px-2">{t('common.status')}</th>
                    <th className={`py-3 px-2 ${isRtl ? 'text-left' : 'text-right'}`}>{t('common.actions')}</th>
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
                            {ins.isActive ? t('instructors.activeStatus') : t('instructors.inactiveStatus')}
                          </span>
                        </td>
                        <td className={`py-3.5 px-2 ${isRtl ? 'text-left' : 'text-right'}`}>
                          {isRtl ? (
                            <ChevronLeft className="w-4 h-4 text-zinc-400 inline" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-zinc-400 inline" />
                          )}
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
                <h3 className="text-xs font-bold uppercase tracking-wider">{t('instructors.detailsPlaceholderTitle')}</h3>
                <p className="text-xs text-zinc-400 max-w-xs mt-1 leading-relaxed">
                  {t('instructors.detailsPlaceholderDesc')}
                </p>
              </div>
            </div>
          ) : !instructorDetail ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
              <p className="text-xs text-zinc-400">{t('common.loading')}</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Back button for mobile screens */}
              <button
                onClick={() => setSelectedInstructorId(null)}
                className="lg:hidden mb-4 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                <span>{t('instructors.backToFaculty')}</span>
              </button>

              {/* Workspace Header */}
              <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-zinc-400">{t('instructors.instructorId')}: {instructorDetail.instructorId}</span>
                    <h2 className="text-base font-bold tracking-tight mt-0.5">{instructorDetail.fullName}</h2>
                    <p className="text-xs text-zinc-400">{instructorDetail.email}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={handleEditOpen}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 cursor-pointer"
                      title={t('common.edit')}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(t('instructors.deleteConfirm'))) {
                          deleteMutation.mutate(instructorDetail.instructorId);
                        }
                      }}
                      className="p-1.5 rounded-lg border border-rose-200/50 dark:border-rose-900/30 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 cursor-pointer"
                      title={t('common.delete')}
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
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-rose-200 dark:border-rose-900/30 bg-rose-50/40 dark:bg-rose-950/10 text-rose-600 dark:text-rose-400 cursor-pointer"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>{t('common.inactive')}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => activateMutation.mutate(instructorDetail.instructorId)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/40 dark:bg-emerald-950/10 text-emerald-600 dark:text-emerald-400 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{t('common.active')}</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedManagerId(instructorDetail.managerId?.toString() || '');
                      setManagerModalOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>{t('instructors.manager')}</span>
                  </button>
                </div>
              </div>

              {/* Salary & Hire details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-zinc-400 block font-semibold uppercase tracking-wider text-[9px]">{t('instructors.salary')}</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">${instructorDetail.salary.toLocaleString()}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-zinc-400 block font-semibold uppercase tracking-wider text-[9px]">{t('instructors.hireDate')}</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>{new Date(instructorDetail.hireDate).toLocaleDateString(i18n.language)}</span>
                  </span>
                </div>
              </div>

              {/* Manager assignment status */}
              <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs">
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">{t('instructors.manager')}</span>
                {instructorDetail.managerId ? (
                  <p className="font-bold text-zinc-800 dark:text-zinc-200">{t('instructors.manager')}: {instructorDetail.managerId}</p>
                ) : (
                  <p className="text-zinc-500 font-medium">{t('instructors.managerNone')}</p>
                )}
              </div>

              {/* Subordinates section */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  {t('instructors.subordinatesTitle')} ({subordinates?.length || 0})
                </h4>
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
                        <span className="text-[9px] font-bold uppercase text-emerald-500">{sub.isActive ? t('instructors.activeStatus') : t('instructors.inactiveStatus')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assigned Course list */}
              <div className="space-y-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{t('courses.directoryTitle')} ({assignedCourses?.length || 0})</span>
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
                            {crs.status === 'Published' ? t('courses.published') : crs.status === 'Draft' ? t('courses.draft') : t('courses.archived')}
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
              <h3 className="text-sm font-bold uppercase tracking-wider">{t('instructors.addInstructor')}</h3>
              <button onClick={() => setCreateModalOpen(false)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('instructors.firstName')}</label>
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
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('instructors.lastName')}</label>
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
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('instructors.email')}</label>
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
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('login.passwordLabel')}</label>
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
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('instructors.salary')}</label>
                  <input
                    type="number"
                    value={formSalary}
                    onChange={(e) => setFormSalary(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('instructors.hireDate')}</label>
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
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('instructors.managerPlaceholder')}</label>
                  <input
                    type="number"
                    placeholder="e.g. 1"
                    value={formManagerId}
                    onChange={(e) => setFormManagerId(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('common.status')}</label>
                  <select
                    value={formIsActive ? 'true' : 'false'}
                    onChange={(e) => setFormIsActive(e.target.value === 'true')}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none font-semibold text-zinc-700 dark:text-zinc-300"
                  >
                    <option value="true">{t('instructors.activeStatus')}</option>
                    <option value="false">{t('instructors.inactiveStatus')}</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full py-2.5 text-xs font-semibold text-white dark:text-zinc-950 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {createMutation.isPending ? t('instructors.savingFaculty') : t('instructors.addInstructor')}
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
              <h3 className="text-sm font-bold uppercase tracking-wider">{t('instructors.editInstructor')}</h3>
              <button onClick={() => setEditModalOpen(false)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('instructors.firstName')}</label>
                  <input
                    type="text"
                    required
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('instructors.lastName')}</label>
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
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('instructors.email')}</label>
                <input
                  type="email"
                  required
                  disabled
                  value={formEmail}
                  className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/60 text-zinc-500 cursor-not-allowed focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('login.passwordLabel')}</label>
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
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('instructors.salary')}</label>
                  <input
                    type="number"
                    value={formSalary}
                    onChange={(e) => setFormSalary(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('common.status')}</label>
                  <select
                    value={formIsActive ? 'true' : 'false'}
                    onChange={(e) => setFormIsActive(e.target.value === 'true')}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  >
                    <option value="true">{t('instructors.activeStatus')}</option>
                    <option value="false">{t('instructors.inactiveStatus')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('instructors.managerPlaceholder')}</label>
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
                {updateMutation.isPending ? t('instructors.savingFaculty') : t('instructors.editInstructor')}
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
              <h3 className="text-sm font-bold uppercase tracking-wider">{t('instructors.manager')}</h3>
              <button onClick={() => setManagerModalOpen(false)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignManagerSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">{t('instructors.manager')}</label>
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
                {assignManagerMutation.isPending ? t('common.loading') : t('common.save')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
