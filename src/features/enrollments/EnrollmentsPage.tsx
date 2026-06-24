import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { toast } from '../../components/Toast';
import { useTranslation } from 'react-i18next';
import {
  ClipboardList,
  Search,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  X,
  Award,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { EnrollStudentDto, CompleteEnrollmentDto, UpdateEnrollmentProgressDto } from '../../types/api';

export default function EnrollmentsPage() {
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'dropped'>('all');
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<number | null>(null);

  // Modals
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [progressModalOpen, setProgressModalOpen] = useState(false);

  // Form states
  const [enrollStudentId, setEnrollStudentId] = useState('');
  const [enrollCourseId, setEnrollCourseId] = useState('');

  const [formFinalGrade, setFormFinalGrade] = useState('90');
  const [formProgressPercent, setFormProgressPercent] = useState('50');

  // 1. Fetching Enrollments
  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['enrollments', activeTab],
    queryFn: () => {
      if (activeTab === 'active') return apiService.enrollments.getActive();
      if (activeTab === 'completed') return apiService.enrollments.getCompleted();
      if (activeTab === 'dropped') return apiService.enrollments.getDropped();
      return apiService.enrollments.getAll();
    },
  });

  // Fetch individual enrollment details
  const { data: enrollmentDetail } = useQuery({
    queryKey: ['enrollment', selectedEnrollmentId],
    queryFn: () => apiService.enrollments.getById(selectedEnrollmentId!),
    enabled: selectedEnrollmentId !== null,
  });

  // Mutations
  const enrollMutation = useMutation({
    mutationFn: (dto: EnrollStudentDto) => apiService.enrollments.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['enrollmentStats'] });
      toast.success(t('enrollments.enrollSuccess'), t('enrollments.enrollSuccessDesc'));
      setEnrollModalOpen(false);
      setEnrollStudentId('');
      setEnrollCourseId('');
    },
    onError: (err: any) => {
      toast.error(t('common.error'), err.response?.data?.message || err.message);
    },
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: CompleteEnrollmentDto }) =>
      apiService.enrollments.complete(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['enrollment', selectedEnrollmentId] });
      queryClient.invalidateQueries({ queryKey: ['enrollmentStats'] });
      toast.success(t('common.success'), t('enrollments.completeSuccessDesc'));
      setCompleteModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(t('common.error'), err.response?.data?.message || err.message);
    },
  });

  const progressMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateEnrollmentProgressDto }) =>
      apiService.enrollments.updateProgress(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['enrollment', selectedEnrollmentId] });
      toast.success(t('common.success'), t('enrollments.progressSuccessDesc'));
      setProgressModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(t('common.error'), err.response?.data?.message || err.message);
    },
  });

  const dropMutation = useMutation({
    mutationFn: (id: number) => apiService.enrollments.drop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['enrollment', selectedEnrollmentId] });
      queryClient.invalidateQueries({ queryKey: ['enrollmentStats'] });
      toast.success(t('enrollments.dropped'), t('enrollments.dropSuccessDesc'));
    },
    onError: (err: any) => {
      toast.error(t('common.error'), err.response?.data?.message || err.message);
    },
  });

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    enrollMutation.mutate({
      studentId: parseInt(enrollStudentId.trim()),
      courseId: parseInt(enrollCourseId.trim()),
    });
  };

  const handleProgressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollmentId) return;
    progressMutation.mutate({
      id: selectedEnrollmentId,
      dto: {
        progressPercent: parseInt(formProgressPercent),
      },
    });
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollmentId) return;
    completeMutation.mutate({
      id: selectedEnrollmentId,
      dto: {
        finalGrade: parseFloat(formFinalGrade),
      },
    });
  };

  const filteredEnrollments = enrollments
    ? enrollments.filter((en) => {
        const query = searchQuery.toLowerCase();
        return (
          en.studentName?.toLowerCase().includes(query) ||
          en.courseTitle?.toLowerCase().includes(query) ||
          en.enrollmentId.toString().includes(query)
        );
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{t('enrollments.directoryTitle')}</h1>
          <p className="text-xs text-zinc-500 mt-0.5">{t('dashboard.resourcesSubtitle')}</p>
        </div>
        <button
          onClick={() => setEnrollModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white dark:text-zinc-950 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('enrollments.enrollStudentButton')}</span>
        </button>
      </div>

      {/* Filters and search row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-100/60 dark:bg-zinc-900/40 p-1.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
        <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl w-fit flex-wrap gap-1">
          <button
            onClick={() => {
              setActiveTab('all');
              setSelectedEnrollmentId(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            {t('common.all')}
          </button>
          <button
            onClick={() => {
              setActiveTab('active');
              setSelectedEnrollmentId(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            {t('common.active')}
          </button>
          <button
            onClick={() => {
              setActiveTab('completed');
              setSelectedEnrollmentId(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            {t('enrollments.completed')}
          </button>
          <button
            onClick={() => {
              setActiveTab('dropped');
              setSelectedEnrollmentId(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'dropped'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            {t('enrollments.dropped')}
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-2.5 w-4 h-4 text-zinc-400`} />
          <input
            type="text"
            placeholder={t('enrollments.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-50 transition-all`}
          />
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Ledger List */}
        <div className={`lg:col-span-2 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4 ${selectedEnrollmentId ? 'hidden lg:block' : 'block'}`}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
            {t('enrollments.directoryTitle')} ({filteredEnrollments.length})
          </h2>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
              <p className="text-xs text-zinc-400">{t('enrollments.loadingList')}</p>
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
              <ClipboardList className="w-8 h-8 text-zinc-300 mx-auto" />
              <p className="text-xs font-medium text-zinc-400">{t('enrollments.noEnrollments')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`w-full ${isRtl ? 'text-right' : 'text-left'} text-xs`}>
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-2">{t('common.id')}</th>
                    <th className="py-3 px-2">{t('dashboard.tableStudent')}</th>
                    <th className="py-3 px-2">{t('dashboard.tableCourse')}</th>
                    <th className="py-3 px-2">{t('dashboard.tableProgress')}</th>
                    <th className={`py-3 px-2 ${isRtl ? 'text-left' : 'text-right'}`}>{t('common.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/40 font-medium">
                  {filteredEnrollments.map((en) => {
                    const isSelected = selectedEnrollmentId === en.enrollmentId;
                    return (
                      <tr
                        key={en.enrollmentId}
                        onClick={() => setSelectedEnrollmentId(en.enrollmentId)}
                        className={`hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-all cursor-pointer ${
                          isSelected ? 'bg-zinc-100/60 dark:bg-zinc-800/40' : ''
                        }`}
                      >
                        <td className="py-3.5 px-2 font-mono font-semibold text-zinc-500">{en.enrollmentId}</td>
                        <td className="py-3.5 px-2 font-bold text-zinc-800 dark:text-zinc-200">{en.studentName || `ID: ${en.studentId}`}</td>
                        <td className="py-3.5 px-2 text-zinc-600 dark:text-zinc-400">{en.courseTitle || `ID: ${en.courseId}`}</td>
                        <td className="py-3.5 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden shrink-0">
                              <div className="h-full bg-zinc-950 dark:bg-zinc-100" style={{ width: `${en.progressPercent}%` }} />
                            </div>
                            <span className="text-[10px] font-mono text-zinc-500">{en.progressPercent}%</span>
                          </div>
                        </td>
                        <td className={`py-3.5 px-2 ${isRtl ? 'text-left' : 'text-right'}`}>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              en.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                                : en.status === 'Active'
                                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                                : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                            }`}
                          >
                            {en.status === 'Active' ? t('common.active') : en.status === 'Completed' ? t('enrollments.completed') : t('enrollments.dropped')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Detail Workspace panel */}
        <div className={`p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-6 overflow-y-auto max-h-[80vh] ${selectedEnrollmentId ? 'block' : 'hidden lg:block'}`}>
          {!selectedEnrollmentId ? (
            <div className="h-full py-16 flex flex-col items-center justify-center text-center gap-3">
              <ClipboardList className="w-10 h-10 text-zinc-300" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider">{t('enrollments.detailsPlaceholderTitle')}</h3>
                <p className="text-xs text-zinc-400 max-w-xs mt-1 leading-relaxed">
                  {t('enrollments.detailsPlaceholderDesc')}
                </p>
              </div>
            </div>
          ) : !enrollmentDetail ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
              <p className="text-xs text-zinc-400">{t('common.loading')}</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in text-xs">
              {/* Back button for mobile screens */}
              <button
                onClick={() => setSelectedEnrollmentId(null)}
                className="lg:hidden mb-4 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                <span>{t('students.backToFaculty')}</span>
              </button>

              {/* Header */}
              <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] font-mono font-bold text-zinc-400">{t('enrollments.enrollmentId')}: {enrollmentDetail.enrollmentId}</span>
                <h2 className="text-base font-bold tracking-tight mt-0.5">{enrollmentDetail.studentName}</h2>
                <p className="text-zinc-500 mt-1 leading-relaxed">
                  {t('enrollments.enrolledIn')}: <span className="font-bold text-zinc-800 dark:text-zinc-200">{enrollmentDetail.courseTitle}</span>
                </p>

                {/* Workflow Action states */}
                {enrollmentDetail.status === 'Active' && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        setFormProgressPercent(enrollmentDetail.progressPercent.toString());
                        setProgressModalOpen(true);
                      }}
                      className="flex-1 py-1.5 px-2.5 rounded-xl font-bold uppercase tracking-wider text-[10px] border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 text-center cursor-pointer hover:bg-zinc-100"
                    >
                      {t('enrollments.setProgress')}
                    </button>
                    <button
                      onClick={() => {
                        setFormFinalGrade('90');
                        setCompleteModalOpen(true);
                      }}
                      className="flex-1 py-1.5 px-2.5 rounded-xl font-bold uppercase tracking-wider text-[10px] border border-emerald-200 text-emerald-600 dark:border-emerald-950 dark:text-emerald-400 text-center cursor-pointer hover:bg-emerald-50/40"
                    >
                      {t('enrollments.markComplete')}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(t('enrollments.dropConfirm'))) {
                          dropMutation.mutate(enrollmentDetail.enrollmentId);
                        }
                      }}
                      className="flex-1 py-1.5 px-2.5 rounded-xl font-bold uppercase tracking-wider text-[10px] border border-rose-200 text-rose-600 dark:border-rose-950 dark:text-rose-400 text-center cursor-pointer hover:bg-rose-50/40"
                    >
                      {t('enrollments.dropClass')}
                    </button>
                  </div>
                )}
              </div>

              {/* Progress visual */}
              <div className="space-y-2">
                <div className="flex justify-between font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider text-[9px]">
                  <span>Syllabus Work Completed</span>
                  <span>{enrollmentDetail.progressPercent}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-950 dark:bg-zinc-100 rounded-full" style={{ width: `${enrollmentDetail.progressPercent}%` }} />
                </div>
              </div>

              {/* Status information */}
              <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-3">
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[9px]">{t('common.status')}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    enrollmentDetail.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                      : enrollmentDetail.status === 'Active'
                      ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                      : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                  }`}>
                    {enrollmentDetail.status === 'Active' ? t('common.active') : enrollmentDetail.status === 'Completed' ? t('enrollments.completed') : t('enrollments.dropped')}
                  </span>
                </div>

                {enrollmentDetail.finalGrade !== null && (
                  <div className="flex justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60 items-center">
                    <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[9px]">Final Grade Awarded</span>
                    <span className="text-base font-bold text-emerald-500 font-mono">{enrollmentDetail.finalGrade}</span>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-zinc-400 block font-semibold uppercase tracking-wider text-[9px]">{t('enrollments.enrollmentDate')}</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{new Date(enrollmentDetail.enrollmentDate).toLocaleDateString(i18n.language)}</span>
                  </span>
                </div>
                {enrollmentDetail.completionDate && (
                  <div className="space-y-1">
                    <span className="text-zinc-400 block font-semibold uppercase tracking-wider text-[9px]">Completion Date</span>
                    <span className="font-bold text-emerald-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{new Date(enrollmentDetail.completionDate).toLocaleDateString(i18n.language)}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ====================================
          MODAL: ENROLL STUDENT
          ==================================== */}
      {enrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-w-sm w-full rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider">{t('enrollments.enrollStudentButton')}</h3>
              <button onClick={() => setEnrollModalOpen(false)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">{t('enrollments.studentId')}</label>
                <div className="relative">
                  <span className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center text-zinc-400`}>
                    <GraduationCap className="w-4 h-4" />
                  </span>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1"
                    value={enrollStudentId}
                    onChange={(e) => setEnrollStudentId(e.target.value)}
                    className={`w-full ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">{t('enrollments.courseId')}</label>
                <div className="relative">
                  <span className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center text-zinc-400`}>
                    <BookOpen className="w-4 h-4" />
                  </span>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5"
                    value={enrollCourseId}
                    onChange={(e) => setEnrollCourseId(e.target.value)}
                    className={`w-full ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={enrollMutation.isPending}
                className="w-full py-2.5 text-xs font-semibold text-white dark:text-zinc-950 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer shadow-md"
              >
                {enrollMutation.isPending ? t('common.loading') : t('enrollments.enrollStudentButton')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================
          MODAL: UPDATE PROGRESS PERCENT
          ==================================== */}
      {progressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-w-xs w-full rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider">{t('enrollments.setProgress')}</h3>
              <button onClick={() => setProgressModalOpen(false)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProgressSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Completion Percent (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={formProgressPercent}
                  onChange={(e) => setFormProgressPercent(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={progressMutation.isPending}
                className="w-full py-2.5 text-xs font-semibold text-white dark:text-zinc-950 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer shadow-md"
              >
                {progressMutation.isPending ? t('common.loading') : t('common.save')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================
          MODAL: FINALIZE & GRADE
          ==================================== */}
      {completeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-w-xs w-full rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider">{t('enrollments.markComplete')}</h3>
              <button onClick={() => setCompleteModalOpen(false)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Final Awarded Grade (Float/Int)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                  value={formFinalGrade}
                  onChange={(e) => setFormFinalGrade(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={completeMutation.isPending}
                className="w-full py-2.5 text-xs font-semibold text-white dark:text-zinc-950 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer shadow-md"
              >
                {completeMutation.isPending ? t('common.loading') : t('common.save')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
