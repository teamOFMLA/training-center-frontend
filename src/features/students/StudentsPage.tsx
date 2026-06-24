import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { toast } from '../../components/Toast';
import { useTranslation } from 'react-i18next';
import {
  GraduationCap,
  Search,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Phone,
  X,
  UserCheck,
  UserX,
  Award,
  ChevronRight,
  ChevronLeft,
  Loader2,
  FileText,
  Linkedin,
  MapPin,
  ClipboardList
} from 'lucide-react';
import { CreateStudentDto, UpdateStudentDto, CreateStudentProfileDto, UpdateStudentProfileDto, StudentStatus } from '../../types/api';

export default function StudentsPage() {
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'suspended' | 'graduated'>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  // Modal controls
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Form states - Student
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDOB, setFormDOB] = useState('2000-01-01');
  const [formStatus, setFormStatus] = useState<StudentStatus>('Active');

  // Form states - Profile
  const [profAddress, setProfAddress] = useState('');
  const [profCity, setProfCity] = useState('');
  const [profCountry, setProfCountry] = useState('');
  const [profBio, setProfBio] = useState('');
  const [profLinkedIn, setProfLinkedIn] = useState('');

  // 1. Fetch Students
  const { data: students, isLoading } = useQuery({
    queryKey: ['students', activeTab],
    queryFn: () => {
      if (activeTab === 'active') return apiService.students.getActive();
      if (activeTab === 'suspended') return apiService.students.getSuspended();
      if (activeTab === 'graduated') return apiService.students.getGraduated();
      return apiService.students.getAll();
    },
  });

  // Selected student details (only runs if selectedStudentId is not null)
  const { data: studentDetail } = useQuery({
    queryKey: ['student', selectedStudentId],
    queryFn: () => apiService.students.getById(selectedStudentId!),
    enabled: selectedStudentId !== null,
  });

  const { data: studentProfile } = useQuery({
    queryKey: ['studentProfile', selectedStudentId],
    queryFn: async () => {
      try {
        return await apiService.students.getProfile(selectedStudentId!);
      } catch (err: any) {
        if (err.response?.status === 404 || err.response?.status === 500) {
          return null;
        }
        throw err;
      }
    },
    enabled: selectedStudentId !== null,
  });

  const { data: studentEnrollments } = useQuery({
    queryKey: ['studentEnrollments', selectedStudentId],
    queryFn: async () => {
      try {
        return await apiService.students.getEnrollments(selectedStudentId!);
      } catch (err: any) {
        if (err.response?.status === 404 || err.response?.status === 500) {
          return [];
        }
        throw err;
      }
    },
    enabled: selectedStudentId !== null,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (dto: CreateStudentDto) => apiService.students.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success(t('students.addStudentSuccess'), t('students.addStudentSuccessDesc'));
      setCreateModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(t('common.error'), err.response?.data?.message || err.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateStudentDto }) =>
      apiService.students.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', selectedStudentId] });
      toast.success(t('students.updateStudentSuccess'), t('students.updateStudentSuccessDesc'));
      setEditModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(t('common.error'), err.response?.data?.message || err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiService.students.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setSelectedStudentId(null);
      toast.success(t('students.deleteStudentSuccess'), t('students.deleteStudentSuccessDesc'));
    },
    onError: (err: any) => {
      toast.error(t('common.error'), err.response?.data?.message || err.message);
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: number) => apiService.students.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', selectedStudentId] });
      toast.success(t('common.success'), t('students.updateStudentSuccessDesc'));
    },
    onError: (err: any) => {
      toast.error(t('common.error'), err.response?.data?.message || err.message);
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (id: number) => apiService.students.suspend(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', selectedStudentId] });
      toast.success(t('common.success'), t('students.updateStudentSuccessDesc'));
    },
    onError: (err: any) => {
      toast.error(t('common.error'), err.response?.data?.message || err.message);
    },
  });

  const graduateMutation = useMutation({
    mutationFn: (id: number) => apiService.students.graduate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', selectedStudentId] });
      toast.success(t('common.success'), t('students.updateStudentSuccessDesc'));
    },
    onError: (err: any) => {
      toast.error(t('common.error'), err.response?.data?.message || err.message);
    },
  });

  const saveProfileMutation = useMutation({
    mutationFn: ({ id, dto, exists }: { id: number; dto: CreateStudentProfileDto; exists: boolean }) =>
      exists
        ? apiService.students.updateProfile(id, dto)
        : apiService.students.createProfile(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile', selectedStudentId] });
      toast.success(t('students.updateProfileSuccess'), t('students.updateProfileSuccessDesc'));
      setProfileModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(t('common.error'), err.response?.data?.message || err.message);
    },
  });

  const deleteProfileMutation = useMutation({
    mutationFn: (id: number) => apiService.students.deleteProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile', selectedStudentId] });
      toast.success(t('students.deleteProfileSuccess'), t('students.deleteProfileSuccessDesc'));
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
    setFormPhone('');
    setFormDOB('2000-01-01');
    setFormStatus('Active');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      firstName: formFirstName,
      lastName: formLastName,
      email: formEmail,
      password: formPassword || 'StudentPass123!',
      phoneNumber: formPhone || null,
      dateOfBirth: formDOB,
      status: formStatus,
    });
  };

  const handleEditOpen = () => {
    if (!studentDetail) return;
    const names = (studentDetail.fullName || '').split(' ');
    setFormFirstName(names[0] || '');
    setFormLastName(names.slice(1).join(' ') || '');
    setFormEmail(studentDetail.email);
    setFormPassword('');
    setFormPhone(studentDetail.phoneNumber || '');
    setFormStatus(studentDetail.status);
    setEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    updateMutation.mutate({
      id: selectedStudentId,
      dto: {
        firstName: formFirstName,
        lastName: formLastName,
        phoneNumber: formPhone || null,
        status: formStatus,
        password: formPassword.trim() ? formPassword : null,
      },
    });
  };

  const handleProfileOpen = () => {
    if (studentProfile) {
      setProfAddress(studentProfile.address || '');
      setProfCity(studentProfile.city || '');
      setProfCountry(studentProfile.country || '');
      setProfBio(studentProfile.bio || '');
      setProfLinkedIn(studentProfile.linkedInUrl || '');
    } else {
      setProfAddress('');
      setProfCity('');
      setProfCountry('');
      setProfBio('');
      setProfLinkedIn('');
    }
    setProfileModalOpen(true);
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    saveProfileMutation.mutate({
      id: selectedStudentId,
      exists: !!studentProfile,
      dto: {
        address: profAddress || null,
        city: profCity || null,
        country: profCountry || null,
        bio: profBio || null,
        linkedInUrl: profLinkedIn || null,
      },
    });
  };

  const filteredStudents = students
    ? students.filter((std) => {
        const query = searchQuery.toLowerCase();
        return (
          std.fullName.toLowerCase().includes(query) ||
          std.email.toLowerCase().includes(query) ||
          std.studentId.toString().includes(query)
        );
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{t('students.directoryTitle')}</h1>
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
          <span>{t('students.addStudent')}</span>
        </button>
      </div>

      {/* Filter Tabs & Search Box */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-100/60 dark:bg-zinc-900/40 p-1.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
        <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl w-fit flex-wrap gap-1">
          <button
            onClick={() => {
              setActiveTab('all');
              setSelectedStudentId(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            {t('common.all')}
          </button>
          <button
            onClick={() => {
              setActiveTab('active');
              setSelectedStudentId(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            {t('common.active')}
          </button>
          <button
            onClick={() => {
              setActiveTab('suspended');
              setSelectedStudentId(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'suspended'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            {t('students.suspendedStatus')}
          </button>
          <button
            onClick={() => {
              setActiveTab('graduated');
              setSelectedStudentId(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'graduated'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            {t('students.graduatedStatus')}
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-2.5 w-4 h-4 text-zinc-400`} />
          <input
            type="text"
            placeholder={t('students.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-50 transition-all`}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side Student List */}
        <div className={`lg:col-span-2 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4 ${selectedStudentId ? 'hidden lg:block' : 'block'}`}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
            {t('students.directoryTitle')} ({filteredStudents.length})
          </h2>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
              <p className="text-xs text-zinc-400">{t('students.loadingList')}</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
              <GraduationCap className="w-8 h-8 text-zinc-300 mx-auto" />
              <p className="text-xs font-medium text-zinc-400">{t('students.noStudents')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`w-full ${isRtl ? 'text-right' : 'text-left'} text-xs`}>
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-2">{t('common.id')}</th>
                    <th className="py-3 px-2">{t('students.addStudent')}</th>
                    <th className="py-3 px-2">{t('students.phone')}</th>
                    <th className="py-3 px-2">{t('common.status')}</th>
                    <th className={`py-3 px-2 ${isRtl ? 'text-left' : 'text-right'}`}>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/40 font-medium">
                  {filteredStudents.map((std) => {
                    const isSelected = selectedStudentId === std.studentId;
                    return (
                      <tr
                        key={std.studentId}
                        onClick={() => setSelectedStudentId(std.studentId)}
                        className={`hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-all cursor-pointer ${
                          isSelected ? 'bg-zinc-100/60 dark:bg-zinc-800/40' : ''
                        }`}
                      >
                        <td className="py-3.5 px-2 font-mono font-semibold text-zinc-500">{std.studentId}</td>
                        <td className="py-3.5 px-2">
                          <div>
                            <p className="font-semibold text-zinc-800 dark:text-zinc-200">{std.fullName}</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">{std.email}</p>
                          </div>
                        </td>
                        <td className="py-3.5 px-2 text-zinc-500 font-mono">{std.phoneNumber || 'N/A'}</td>
                        <td className="py-3.5 px-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              std.status === 'Active'
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                                : std.status === 'Suspended'
                                ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400'
                                : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {std.status === 'Active' ? t('common.active') : std.status === 'Suspended' ? t('students.suspendedStatus') : t('students.graduatedStatus')}
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

        {/* Right Side Detail workspace */}
        <div className={`p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-6 overflow-y-auto max-h-[80vh] ${selectedStudentId ? 'block' : 'hidden lg:block'}`}>
          {!selectedStudentId ? (
            <div className="h-full py-16 flex flex-col items-center justify-center text-center gap-3">
              <GraduationCap className="w-10 h-10 text-zinc-300" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider">{t('students.detailsPlaceholderTitle')}</h3>
                <p className="text-xs text-zinc-400 max-w-xs mt-1 leading-relaxed">
                  {t('students.detailsPlaceholderDesc')}
                </p>
              </div>
            </div>
          ) : !studentDetail ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
              <p className="text-xs text-zinc-400">{t('common.loading')}</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Back button for mobile screens */}
              <button
                onClick={() => setSelectedStudentId(null)}
                className="lg:hidden mb-4 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                <span>{t('students.backToFaculty')}</span>
              </button>

              {/* Workspace Header */}
              <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-zinc-400">{t('students.studentId')}: {studentDetail.studentId}</span>
                    <h2 className="text-base font-bold tracking-tight mt-0.5">{studentDetail.fullName}</h2>
                    <p className="text-xs text-zinc-400">{studentDetail.email}</p>
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
                        if (confirm(t('students.deleteConfirm'))) {
                          deleteMutation.mutate(studentDetail.studentId);
                        }
                      }}
                      className="p-1.5 rounded-lg border border-rose-200/50 dark:border-rose-900/30 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 cursor-pointer"
                      title={t('common.delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {studentDetail.status !== 'Active' && (
                    <button
                      onClick={() => activateMutation.mutate(studentDetail.studentId)}
                      className="flex-1 py-1 px-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <UserCheck className="w-3 h-3" />
                      <span>{t('common.active')}</span>
                    </button>
                  )}
                  {studentDetail.status !== 'Suspended' && (
                    <button
                      onClick={() => suspendMutation.mutate(studentDetail.studentId)}
                      className="flex-1 py-1 px-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <UserX className="w-3 h-3" />
                      <span>{t('students.suspendedStatus')}</span>
                    </button>
                  )}
                  {studentDetail.status !== 'Graduated' && (
                    <button
                      onClick={() => graduateMutation.mutate(studentDetail.studentId)}
                      className="flex-1 py-1 px-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Award className="w-3 h-3" />
                      <span>{t('students.graduatedStatus')}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* DOB, Phone, Date */}
              <div className="grid grid-cols-2 gap-4 text-xs pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="space-y-1">
                  <span className="text-zinc-400 block font-semibold uppercase tracking-wider text-[9px]">{t('students.dob')}</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{new Date(studentDetail.dateOfBirth).toLocaleDateString(i18n.language)}</span>
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-zinc-400 block font-semibold uppercase tracking-wider text-[9px]">{t('students.registeredAt')}</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {new Date(studentDetail.registeredAt).toLocaleDateString(i18n.language)}
                  </span>
                </div>
              </div>

              {/* DEMOGRAPHIC PROFILE CARD */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{t('students.biographicProfile')}</span>
                  </h4>
                  <button
                    onClick={handleProfileOpen}
                    className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                  >
                    {studentProfile ? t('students.editProfile') : t('students.createProfile')}
                  </button>
                </div>

                {!studentProfile ? (
                  <div className="p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400">
                    No linked bio demographic profile found.
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/20 text-xs space-y-3.5 relative">
                    {/* Bio */}
                    {studentProfile.bio && (
                      <p className="text-zinc-600 dark:text-zinc-400 italic leading-relaxed">
                        "{studentProfile.bio}"
                      </p>
                    )}

                    {/* LinkedIn, City */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                      {(studentProfile.city || studentProfile.country) && (
                        <div className="flex items-center gap-1.5 text-zinc-500">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>
                            {studentProfile.address ? `${studentProfile.address}, ` : ''}
                            {studentProfile.city}
                            {studentProfile.country ? ` (${studentProfile.country})` : ''}
                          </span>
                        </div>
                      )}

                      {studentProfile.linkedInUrl && (
                        <div className="flex items-center gap-1.5 text-zinc-500">
                          <Linkedin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <a
                            href={studentProfile.linkedInUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-blue-600 dark:text-blue-400 font-semibold truncate"
                          >
                            LinkedIn Profile
                          </a>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this demographic profile?')) {
                          deleteProfileMutation.mutate(studentDetail.studentId);
                        }
                      }}
                      className={`absolute top-2 ${isRtl ? 'left-2' : 'right-2'} p-1 text-zinc-300 hover:text-rose-500 rounded cursor-pointer`}
                      title="Clear Profile"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* ENROLLMENT HISTORICAL TIMELINE */}
              <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <ClipboardList className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{t('students.courseHistory')} ({studentEnrollments?.length || 0})</span>
                </h4>

                {studentEnrollments?.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">No courses attended yet.</p>
                ) : (
                  <div className="space-y-2.5 max-h-48 overflow-y-auto">
                    {studentEnrollments?.map((en) => (
                      <div key={en.enrollmentId} className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs space-y-2">
                        <div className="flex justify-between items-start gap-1">
                          <p className="font-bold text-zinc-800 dark:text-zinc-200">{en.courseTitle || `ID: ${en.courseId}`}</p>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              en.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-500'
                                : en.status === 'Active'
                                ? 'bg-amber-50 text-amber-500'
                                : 'bg-rose-50 text-rose-500'
                            }`}
                          >
                            {en.status === 'Active' ? t('common.active') : en.status === 'Completed' ? t('enrollments.completed') : t('enrollments.dropped')}
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px] text-zinc-400">
                          <span>{t('dashboard.tableDate')}: {new Date(en.enrollmentDate).toLocaleDateString(i18n.language)}</span>
                          {en.finalGrade !== null && (
                            <span className="font-bold text-emerald-500">GRADE: {en.finalGrade}</span>
                          )}
                        </div>
                        {/* Progress */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] text-zinc-400 font-semibold uppercase">
                            <span>Syllabus Progress</span>
                            <span>{en.progressPercent}%</span>
                          </div>
                          <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-zinc-950 dark:bg-zinc-100" style={{ width: `${en.progressPercent}%` }} />
                          </div>
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
          MODAL: REGISTER STUDENT
          ==================================== */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider">{t('students.addStudent')}</h3>
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
                    placeholder="John"
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
                    placeholder="Smith"
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
                  placeholder="john.smith@edu.com"
                  className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('login.passwordLabel')}</label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Keep blank for default StudentPass123!"
                  className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('students.phone')}</label>
                  <input
                    type="text"
                    placeholder="e.g. +1 555-0199"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('students.dob')}</label>
                  <input
                    type="date"
                    required
                    value={formDOB}
                    onChange={(e) => setFormDOB(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('common.status')}</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as StudentStatus)}
                  className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  <option value="Active">{t('common.active')}</option>
                  <option value="Suspended">{t('students.suspendedStatus')}</option>
                  <option value="Graduated">{t('students.graduatedStatus')}</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full py-2.5 text-xs font-semibold text-white dark:text-zinc-950 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer shadow-md"
              >
                {createMutation.isPending ? t('common.loading') : t('students.addStudent')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================
          MODAL: EDIT STUDENT ACCOUNT
          ==================================== */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider">{t('students.editStudent')}</h3>
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
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('login.passwordLabel')}</label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Leave blank to preserve current credentials"
                  className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('students.phone')}</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('common.status')}</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as StudentStatus)}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  >
                    <option value="Active">{t('common.active')}</option>
                    <option value="Suspended">{t('students.suspendedStatus')}</option>
                    <option value="Graduated">{t('students.graduatedStatus')}</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full py-2.5 text-xs font-semibold text-white dark:text-zinc-950 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer shadow-md"
              >
                {updateMutation.isPending ? t('common.loading') : t('common.save')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================
          MODAL: MANAGE BIOGRAPHIC PROFILE
          ==================================== */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider">{t('students.biographicProfile')}</h3>
              <button onClick={() => setProfileModalOpen(false)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('students.address')}</label>
                <input
                  type="text"
                  placeholder="123 Main Street"
                  value={profAddress}
                  onChange={(e) => setProfAddress(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('students.city')}</label>
                  <input
                    type="text"
                    placeholder="New York"
                    value={profCity}
                    onChange={(e) => setProfCity(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('students.country')}</label>
                  <input
                    type="text"
                    placeholder="United States"
                    value={profCountry}
                    onChange={(e) => setProfCountry(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('students.bio')}</label>
                <textarea
                  rows={3}
                  placeholder="Ambitious learner focused on fullstack web engineering..."
                  value={profBio}
                  onChange={(e) => setProfBio(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={profLinkedIn}
                  onChange={(e) => setProfLinkedIn(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={saveProfileMutation.isPending}
                className="w-full py-2.5 text-xs font-semibold text-white dark:text-zinc-950 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer shadow-md"
              >
                {saveProfileMutation.isPending ? t('common.loading') : t('common.save')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
