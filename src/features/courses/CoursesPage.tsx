import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { toast } from '../../components/Toast';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
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
  Archive,
  Hourglass,
  DollarSign,
  GraduationCap
} from 'lucide-react';
import { CreateCourseDto, UpdateCourseDto, CourseLevel, CourseStatus } from '../../types/api';

export default function CoursesPage() {
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [searchQuery, setSearchQuery] = useState('');

  // Tab states for endpoint-based filtering
  const [filterType, setFilterType] = useState<'status' | 'level'>('status');
  const [filterValue, setFilterValue] = useState<string>('all');

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [instructorModalOpen, setInstructorModalOpen] = useState(false);

  // Form states - Course
  const [formTitle, setFormTitle] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState(199);
  const [formLevel, setFormLevel] = useState<CourseLevel>('Beginner');
  const [formStatus, setFormStatus] = useState<CourseStatus>('Draft');
  const [formDuration, setFormDuration] = useState(40);
  const [formInstructorId, setFormInstructorId] = useState(1);

  // Instructor assignment state
  const [newInstructorId, setNewInstructorId] = useState<string>('');

  // 1. Fetch Courses based on backend filter endpoint chosen
  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses', filterType, filterValue],
    queryFn: () => {
      if (filterType === 'status') {
        if (filterValue === 'published') return apiService.courses.getPublished();
        if (filterValue === 'draft') return apiService.courses.getDrafts();
        if (filterValue === 'archived') return apiService.courses.getArchived();
      }
      if (filterType === 'level') {
        if (filterValue === 'beginner') return apiService.courses.getBeginner();
        if (filterValue === 'intermediate') return apiService.courses.getIntermediate();
        if (filterValue === 'advanced') return apiService.courses.getAdvanced();
      }
      return apiService.courses.getAll();
    },
  });

  // Selected course details
  const { data: courseDetail } = useQuery({
    queryKey: ['course', selectedCourseId],
    queryFn: () => apiService.courses.getById(selectedCourseId!),
    enabled: selectedCourseId !== null,
  });

  // Fetch linked instructor details
  const { data: courseInstructor } = useQuery({
    queryKey: ['courseInstructor', selectedCourseId],
    queryFn: async () => {
      try {
        return await apiService.courses.getInstructor(selectedCourseId!);
      } catch (err: any) {
        if (err.response?.status === 404 || err.response?.status === 500) {
          return null;
        }
        throw err;
      }
    },
    enabled: selectedCourseId !== null,
  });

  const { data: courseEnrollments } = useQuery({
    queryKey: ['courseEnrollments', selectedCourseId],
    queryFn: async () => {
      try {
        return await apiService.courses.getEnrollments(selectedCourseId!);
      } catch (err: any) {
        if (err.response?.status === 404 || err.response?.status === 500) {
          return [];
        }
        throw err;
      }
    },
    enabled: selectedCourseId !== null,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (dto: CreateCourseDto) => apiService.courses.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success(t('courses.addCourseSuccess'), t('courses.addCourseSuccessDesc'));
      setCreateModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(t('common.error'), err.response?.data?.message || err.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateCourseDto }) =>
      apiService.courses.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', selectedCourseId] });
      toast.success(t('courses.updateCourseSuccess'), t('courses.updateCourseSuccessDesc'));
      setEditModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(t('common.error'), err.response?.data?.message || err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiService.courses.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setSelectedCourseId(null);
      toast.success(t('courses.deleteCourseSuccess'), t('courses.deleteCourseSuccessDesc'));
    },
    onError: (err: any) => {
      toast.error(t('common.error'), err.response?.data?.message || err.message);
    },
  });

  const assignInstructorMutation = useMutation({
    mutationFn: ({ courseId, instructorId }: { courseId: number; instructorId: number }) =>
      apiService.courses.changeInstructor(courseId, { instructorId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', selectedCourseId] });
      queryClient.invalidateQueries({ queryKey: ['courseInstructor', selectedCourseId] });
      toast.success(t('courses.updateCourseSuccess'), t('courses.updateCourseSuccessDesc'));
      setInstructorModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(t('common.error'), err.response?.data?.message || err.message);
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: number) => apiService.courses.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', selectedCourseId] });
      toast.success(t('common.success'), t('courses.updateCourseSuccessDesc'));
    },
    onError: (err: any) => {
      toast.error(t('common.error'), err.response?.data?.message || err.message);
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: (id: number) => apiService.courses.unpublish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', selectedCourseId] });
      toast.success(t('common.success'), t('courses.updateCourseSuccessDesc'));
    },
    onError: (err: any) => {
      toast.error(t('common.error'), err.response?.data?.message || err.message);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: number) => apiService.courses.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', selectedCourseId] });
      toast.success(t('common.success'), t('courses.updateCourseSuccessDesc'));
    },
    onError: (err: any) => {
      toast.error(t('common.error'), err.response?.data?.message || err.message);
    },
  });

  const resetForm = () => {
    setFormTitle('');
    setFormCode('');
    setFormDescription('');
    setFormPrice(199);
    setFormLevel('Beginner');
    setFormStatus('Draft');
    setFormDuration(40);
    setFormInstructorId(1);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      title: formTitle,
      code: formCode,
      description: formDescription,
      price: formPrice,
      level: formLevel,
      status: formStatus,
      durationHours: formDuration,
      instructorId: formInstructorId,
    });
  };

  const handleEditOpen = () => {
    if (!courseDetail) return;
    setFormTitle(courseDetail.title || '');
    setFormCode(courseDetail.code || '');
    setFormDescription(courseDetail.description || '');
    setFormPrice(courseDetail.price);
    setFormLevel(courseDetail.level);
    setFormStatus(courseDetail.status);
    setFormDuration(courseDetail.durationHours);
    setFormInstructorId(courseDetail.instructorId);
    setEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    updateMutation.mutate({
      id: selectedCourseId,
      dto: {
        title: formTitle,
        code: formCode,
        description: formDescription,
        price: formPrice,
        level: formLevel,
        durationHours: formDuration,
        instructorId: formInstructorId,
      },
    });
  };

  const handleAssignInstructorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !newInstructorId.trim()) return;
    assignInstructorMutation.mutate({
      courseId: selectedCourseId,
      instructorId: parseInt(newInstructorId.trim()),
    });
  };

  const filteredCourses = courses
    ? courses.filter((crs) => {
        const query = searchQuery.toLowerCase();
        return (
          crs.title?.toLowerCase().includes(query) ||
          crs.code?.toLowerCase().includes(query) ||
          crs.courseId.toString().includes(query)
        );
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{t('courses.directoryTitle')}</h1>
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
          <span>{t('courses.addCourse')}</span>
        </button>
      </div>

      {/* Filter Tabs & Search Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-100/60 dark:bg-zinc-900/40 p-1.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
        <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl w-fit flex-wrap gap-1">
          <button
            onClick={() => {
              setFilterType('status');
              setFilterValue('all');
              setSelectedCourseId(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filterType === 'status' && filterValue === 'all'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            {t('courses.allSyllabus')}
          </button>

          {/* Status Specifics */}
          <button
            onClick={() => {
              setFilterType('status');
              setFilterValue('published');
              setSelectedCourseId(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filterType === 'status' && filterValue === 'published'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            {t('courses.published')}
          </button>
          <button
            onClick={() => {
              setFilterType('status');
              setFilterValue('draft');
              setSelectedCourseId(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filterType === 'status' && filterValue === 'draft'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            {t('courses.drafts')}
          </button>
          <button
            onClick={() => {
              setFilterType('status');
              setFilterValue('archived');
              setSelectedCourseId(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filterType === 'status' && filterValue === 'archived'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            {t('courses.archived')}
          </button>

          {/* Difficulty levels */}
          <button
            onClick={() => {
              setFilterType('level');
              setFilterValue('beginner');
              setSelectedCourseId(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filterType === 'level' && filterValue === 'beginner'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            {t('courses.beginner')}
          </button>
          <button
            onClick={() => {
              setFilterType('level');
              setFilterValue('intermediate');
              setSelectedCourseId(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filterType === 'level' && filterValue === 'intermediate'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            {t('courses.intermediate')}
          </button>
          <button
            onClick={() => {
              setFilterType('level');
              setFilterValue('advanced');
              setSelectedCourseId(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filterType === 'level' && filterValue === 'advanced'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            {t('courses.advanced')}
          </button>
        </div>

        {/* Search Input */}
        <div className="relative max-w-sm w-full">
          <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-2.5 w-4 h-4 text-zinc-400`} />
          <input
            type="text"
            placeholder={t('courses.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-50 transition-all`}
          />
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left list table */}
        <div className={`lg:col-span-2 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4 ${selectedCourseId ? 'hidden lg:block' : 'block'}`}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
            {t('courses.directoryTitle')} ({filteredCourses.length})
          </h2>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
              <p className="text-xs text-zinc-400">{t('courses.loadingList')}</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
              <BookOpen className="w-8 h-8 text-zinc-300 mx-auto" />
              <p className="text-xs font-medium text-zinc-400">{t('courses.noCourses')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`w-full ${isRtl ? 'text-right' : 'text-left'} text-xs`}>
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-2">{t('courses.code')}</th>
                    <th className="py-3 px-2">{t('courses.addCourse')}</th>
                    <th className="py-3 px-2">{t('courses.difficultyLevel')}</th>
                    <th className={`py-3 px-2 ${isRtl ? 'text-left' : 'text-right'}`}>{t('courses.pricing')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/40 font-medium">
                  {filteredCourses.map((crs) => {
                    const isSelected = selectedCourseId === crs.courseId;
                    return (
                      <tr
                        key={crs.courseId}
                        onClick={() => setSelectedCourseId(crs.courseId)}
                        className={`hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-all cursor-pointer ${
                          isSelected ? 'bg-zinc-100/60 dark:bg-zinc-800/40' : ''
                        }`}
                      >
                        <td className="py-3.5 px-2 font-mono font-semibold text-zinc-500">{crs.code}</td>
                        <td className="py-3.5 px-2">
                          <div>
                            <p className="font-semibold text-zinc-800 dark:text-zinc-200">{crs.title}</p>
                            <span className="text-[9px] uppercase tracking-wider text-zinc-400 mt-0.5 inline-block">ID: {crs.courseId}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              crs.level === 'Beginner'
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                                : crs.level === 'Intermediate'
                                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                                : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400'
                            }`}
                          >
                            {crs.level === 'Beginner' ? t('courses.beginner') : crs.level === 'Intermediate' ? t('courses.intermediate') : t('courses.advanced')}
                          </span>
                        </td>
                        <td className={`py-3.5 px-2 font-mono font-bold text-zinc-800 dark:text-zinc-200 ${isRtl ? 'text-left' : 'text-right'}`}>
                          ${crs.price}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right workspace details */}
        <div className={`p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-6 overflow-y-auto max-h-[80vh] ${selectedCourseId ? 'block' : 'hidden lg:block'}`}>
          {!selectedCourseId ? (
            <div className="h-full py-16 flex flex-col items-center justify-center text-center gap-3">
              <BookOpen className="w-10 h-10 text-zinc-300" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider">{t('courses.detailsPlaceholderTitle')}</h3>
                <p className="text-xs text-zinc-400 max-w-xs mt-1 leading-relaxed">
                  {t('courses.detailsPlaceholderDesc')}
                </p>
              </div>
            </div>
          ) : !courseDetail ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
              <p className="text-xs text-zinc-400">{t('common.loading')}</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in text-xs">
              {/* Back button for mobile */}
              <button
                onClick={() => setSelectedCourseId(null)}
                className="lg:hidden mb-4 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                <span>{t('courses.backToFaculty')}</span>
              </button>

              {/* Course detail header */}
              <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-zinc-400">{t('courses.code')}: {courseDetail.code}</span>
                    <h2 className="text-base font-bold tracking-tight mt-0.5">{courseDetail.title}</h2>
                    <p className="text-[11px] text-zinc-400 mt-1 uppercase font-bold tracking-wider">
                      {t('courses.difficultyLevel')}: {courseDetail.level === 'Beginner' ? t('courses.beginner') : courseDetail.level === 'Intermediate' ? t('courses.intermediate') : t('courses.advanced')}
                    </p>
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
                        if (confirm(t('courses.deleteConfirm'))) {
                          deleteMutation.mutate(courseDetail.courseId);
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
                  {courseDetail.status === 'Draft' && (
                    <button
                      onClick={() => publishMutation.mutate(courseDetail.courseId)}
                      className="flex-1 py-1 px-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Publish</span>
                    </button>
                  )}
                  {courseDetail.status === 'Published' && (
                    <button
                      onClick={() => unpublishMutation.mutate(courseDetail.courseId)}
                      className="flex-1 py-1 px-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Revert to Draft</span>
                    </button>
                  )}
                  {courseDetail.status !== 'Archived' && (
                    <button
                      onClick={() => archiveMutation.mutate(courseDetail.courseId)}
                      className="flex-1 py-1 px-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Archive</span>
                    </button>
                  )}
                </div>

                {/* Status Toggle Info */}
                <div className="flex gap-2 mt-4">
                  <span
                    className={`flex-1 py-1.5 px-3 rounded-xl text-center text-[10px] font-bold uppercase tracking-wider border ${
                      courseDetail.status === 'Published'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                        : courseDetail.status === 'Draft'
                        ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-500 dark:bg-zinc-900/40 dark:text-zinc-400'
                    }`}
                  >
                    {courseDetail.status === 'Published' ? t('courses.published') : courseDetail.status === 'Draft' ? t('courses.draft') : t('courses.archived')}
                  </span>
                  <button
                    onClick={() => {
                      setNewInstructorId(courseDetail.instructorId?.toString() || '');
                      setInstructorModalOpen(true);
                    }}
                    className="flex-1 py-1.5 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>{t('courses.instructor')}</span>
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1 p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-100 dark:border-zinc-800/40">
                  <span className="text-zinc-400 block font-semibold uppercase tracking-wider text-[9px]">{t('courses.pricing')}</span>
                  <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-0.5">
                    <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{courseDetail.price}</span>
                  </span>
                </div>
                <div className="space-y-1 p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-100 dark:border-zinc-800/40">
                  <span className="text-zinc-400 block font-semibold uppercase tracking-wider text-[9px]">{t('courses.duration')}</span>
                  <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                    <Hourglass className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{courseDetail.durationHours} hrs</span>
                  </span>
                </div>
              </div>

              {/* Description bio */}
              <div className="space-y-1.5">
                <span className="text-zinc-400 block font-semibold uppercase tracking-wider text-[9px]">{t('courses.description')}</span>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                  {courseDetail.description || 'No descriptive summary provided.'}
                </p>
              </div>

              {/* Instructor linked card */}
              <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30 text-xs">
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">{t('courses.instructor')}</span>
                <p className="font-bold text-zinc-800 dark:text-zinc-200">
                  {courseInstructor?.fullName || `Instructor ID: ${courseDetail.instructorId}`}
                </p>
              </div>

              {/* Enrollment student checklist list */}
              <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  {t('courses.enrolledStudents')} ({courseEnrollments?.length || 0})
                </h4>

                {courseEnrollments?.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">No students registered in this syllabus yet.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {courseEnrollments?.map((en) => (
                      <div key={en.enrollmentId} className="p-2.5 border border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/40 dark:bg-zinc-900/10 rounded-lg text-xs flex justify-between items-center">
                        <div>
                          <p className="font-bold text-zinc-800 dark:text-zinc-200">{en.studentName}</p>
                          <span className="text-[9px] text-zinc-400 block mt-0.5">ID: {en.studentId}</span>
                        </div>
                        <span className="text-[10px] font-mono font-semibold text-zinc-500">
                          {en.progressPercent}%
                        </span>
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
          MODAL: CREATE COURSE
          ==================================== */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider">{t('courses.addCourse')}</h3>
              <button onClick={() => setCreateModalOpen(false)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('courses.addCourse')}</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="E.g. Fullstack Web Development"
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('courses.code')}</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="CS-101"
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('courses.description')}</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Provide brief course syllabus content..."
                  className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('courses.pricing')} ($)</label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('courses.duration')} (Hrs)</label>
                  <input
                    type="number"
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('courses.instructor')} ID</label>
                  <input
                    type="number"
                    value={formInstructorId}
                    onChange={(e) => setFormInstructorId(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('courses.difficultyLevel')}</label>
                  <select
                    value={formLevel}
                    onChange={(e) => setFormLevel(e.target.value as CourseLevel)}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  >
                    <option value="Beginner">{t('courses.beginner')}</option>
                    <option value="Intermediate">{t('courses.intermediate')}</option>
                    <option value="Advanced">{t('courses.advanced')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('common.status')}</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as CourseStatus)}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none font-semibold text-zinc-700 dark:text-zinc-300"
                  >
                    <option value="Draft">{t('courses.draft')}</option>
                    <option value="Published">{t('courses.published')}</option>
                    <option value="Archived">{t('courses.archived')}</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full py-2.5 text-xs font-semibold text-white dark:text-zinc-950 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {createMutation.isPending ? t('common.loading') : t('courses.addCourse')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================
          MODAL: EDIT COURSE
          ==================================== */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider">{t('courses.editCourse')}</h3>
              <button onClick={() => setEditModalOpen(false)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('courses.addCourse')}</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('courses.code')}</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('courses.description')}</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('courses.pricing')} ($)</label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('courses.duration')} (Hrs)</label>
                  <input
                    type="number"
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('courses.instructor')} ID</label>
                  <input
                    type="number"
                    value={formInstructorId}
                    onChange={(e) => setFormInstructorId(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{t('courses.difficultyLevel')}</label>
                  <select
                    value={formLevel}
                    onChange={(e) => setFormLevel(e.target.value as CourseLevel)}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  >
                    <option value="Beginner">{t('courses.beginner')}</option>
                    <option value="Intermediate">{t('courses.intermediate')}</option>
                    <option value="Advanced">{t('courses.advanced')}</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full py-2.5 text-xs font-semibold text-white dark:text-zinc-950 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {updateMutation.isPending ? t('common.loading') : t('common.save')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================
          MODAL: ASSIGN INSTRUCTOR
          ==================================== */}
      {instructorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-w-sm w-full rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider">{t('courses.instructor')}</h3>
              <button onClick={() => setInstructorModalOpen(false)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignInstructorSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">{t('courses.instructor')} ID</label>
                <input
                  type="number"
                  required
                  placeholder="E.g. 3"
                  value={newInstructorId}
                  onChange={(e) => setNewInstructorId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none font-mono"
                />
                <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed">
                  Provide the integer Faculty ID of the instructor who will be assigned primary teaching load for this syllabus.
                </p>
              </div>

              <button
                type="submit"
                disabled={assignInstructorMutation.isPending}
                className="w-full py-2.5 text-xs font-semibold text-white dark:text-zinc-950 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer shadow-md"
              >
                {assignInstructorMutation.isPending ? t('common.loading') : t('common.save')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
