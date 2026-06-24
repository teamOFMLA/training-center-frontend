import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { toast } from '../../components/Toast';
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
  UserCheck,
  CheckCircle,
  AlertCircle,
  Archive,
  Hourglass,
  DollarSign,
  GraduationCap
} from 'lucide-react';
import { CreateCourseDto, UpdateCourseDto, CourseLevel, CourseStatus } from '../../types/api';

export default function CoursesPage() {
  const queryClient = useQueryClient();
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
      } else if (filterType === 'level') {
        if (filterValue === 'beginner') return apiService.courses.getBeginner();
        if (filterValue === 'intermediate') return apiService.courses.getIntermediate();
        if (filterValue === 'advanced') return apiService.courses.getAdvanced();
      }
      return apiService.courses.getAll();
    },
  });

  // Load active instructors for dropdowns
  const { data: instructors } = useQuery({
    queryKey: ['activeInstructorsDropdown'],
    queryFn: apiService.instructors.getActive,
  });

  // Course Details Sub-queries
  const { data: courseDetail } = useQuery({
    queryKey: ['course', selectedCourseId],
    queryFn: () => apiService.courses.getById(selectedCourseId!),
    enabled: selectedCourseId !== null,
  });

  const { data: courseInstructor } = useQuery({
    queryKey: ['courseInstructor', selectedCourseId],
    queryFn: () => apiService.courses.getInstructor(selectedCourseId!),
    enabled: selectedCourseId !== null,
  });

  const { data: courseEnrollments } = useQuery({
    queryKey: ['courseEnrollments', selectedCourseId],
    queryFn: () => apiService.courses.getEnrollments(selectedCourseId!),
    enabled: selectedCourseId !== null,
  });

  // 2. Mutations
  const createMutation = useMutation({
    mutationFn: apiService.courses.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course Created', 'New syllabus course draft saved.');
      setCreateModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error('Failed to Create Course', err.response?.data?.message || 'Check course details.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCourseDto }) =>
      apiService.courses.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', selectedCourseId] });
      toast.success('Course Updated', 'Course syllabus saved.');
      setEditModalOpen(false);
    },
    onError: (err: any) => {
      toast.error('Update Failed', err.response?.data?.message || 'Error occurred.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: apiService.courses.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course Deleted', 'Course record successfully removed.');
      setSelectedCourseId(null);
    },
    onError: (err: any) => {
      toast.error('Deletion Failed', err.response?.data?.message || 'Failed to delete course.');
    },
  });

  // Publication State Mutations
  const publishMutation = useMutation({
    mutationFn: apiService.courses.publish,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', selectedCourseId] });
      toast.success('Course Published', 'Course syllabus is now visible to students.');
    },
    onError: (err: any) => {
      toast.error('Publish Failed', err.response?.data?.message || 'Conflict occurred.');
    },
  });

  const archiveMutation = useMutation({
    mutationFn: apiService.courses.archive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', selectedCourseId] });
      toast.success('Course Archived', 'Course set to Archive state.');
    },
    onError: (err: any) => {
      toast.error('Archive Failed', err.response?.data?.message || 'Conflict occurred.');
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: apiService.courses.unpublish,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', selectedCourseId] });
      toast.success('Moved to Draft', 'Course syllabus returned to Draft state.');
    },
    onError: (err: any) => {
      toast.error('Unpublish Failed', err.response?.data?.message || 'Conflict occurred.');
    },
  });

  // Change Instructor Mutation
  const changeInstructorMutation = useMutation({
    mutationFn: ({ id, instructorId }: { id: number; instructorId: number }) =>
      apiService.courses.changeInstructor(id, { instructorId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseInstructor', selectedCourseId] });
      toast.success('Instructor Changed', 'New faculty assigned to course successfully.');
      setInstructorModalOpen(false);
    },
    onError: (err: any) => {
      toast.error('Failed to Change Instructor', err.response?.data?.message || 'Check IDs.');
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
    setFormInstructorId(instructors?.[0]?.instructorId || 1);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateCourseDto = {
      title: formTitle,
      code: formCode,
      description: formDescription,
      price: Number(formPrice),
      level: formLevel,
      status: formStatus,
      durationHours: Number(formDuration),
      instructorId: Number(formInstructorId),
    };
    createMutation.mutate(payload);
  };

  const handleEditOpen = () => {
    if (!courseDetail) return;
    setFormTitle(courseDetail.title || '');
    setFormCode(courseDetail.code || '');
    setFormDescription(courseDetail.description || '');
    setFormPrice(courseDetail.price);
    setFormLevel(courseDetail.level);
    setFormDuration(courseDetail.durationHours);
    setFormInstructorId(courseDetail.instructorId);
    setEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    const payload: UpdateCourseDto = {
      title: formTitle,
      code: formCode,
      description: formDescription,
      price: Number(formPrice),
      level: formLevel,
      durationHours: Number(formDuration),
      instructorId: Number(formInstructorId),
    };
    updateMutation.mutate({ id: selectedCourseId, data: payload });
  };

  const handleChangeInstructorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !newInstructorId) return;
    changeInstructorMutation.mutate({ id: selectedCourseId, instructorId: Number(newInstructorId) });
  };

  const filteredCourses = courses?.filter((crs) => {
    const query = searchQuery.toLowerCase();
    return (
      crs.title?.toLowerCase().includes(query) ||
      crs.code?.toLowerCase().includes(query) ||
      crs.courseId.toString().includes(query)
    );
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Courses Syllabus</h1>
          <p className="text-xs text-zinc-500 mt-1">Manage corporate syllabus catalogs, levels, prices, and instructor workloads</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setCreateModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white dark:text-zinc-950 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Course
        </button>
      </div>

      {/* Tabs and Search Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
        {/* API endpoints filters tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-950 rounded-xl">
          <button
            onClick={() => {
              setFilterType('status');
              setFilterValue('all');
              setSelectedCourseId(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterType === 'status' && filterValue === 'all'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            All Syllabus
          </button>

          {/* Status Specifics */}
          <button
            onClick={() => {
              setFilterType('status');
              setFilterValue('published');
              setSelectedCourseId(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterType === 'status' && filterValue === 'published'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Published
          </button>
          <button
            onClick={() => {
              setFilterType('status');
              setFilterValue('draft');
              setSelectedCourseId(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterType === 'status' && filterValue === 'draft'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Drafts
          </button>
          <button
            onClick={() => {
              setFilterType('status');
              setFilterValue('archived');
              setSelectedCourseId(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterType === 'status' && filterValue === 'archived'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Archived
          </button>

          {/* Difficulty levels */}
          <button
            onClick={() => {
              setFilterType('level');
              setFilterValue('beginner');
              setSelectedCourseId(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterType === 'level' && filterValue === 'beginner'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Beginner
          </button>
          <button
            onClick={() => {
              setFilterType('level');
              setFilterValue('intermediate');
              setSelectedCourseId(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterType === 'level' && filterValue === 'intermediate'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Intermediate
          </button>
          <button
            onClick={() => {
              setFilterType('level');
              setFilterValue('advanced');
              setSelectedCourseId(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterType === 'level' && filterValue === 'advanced'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Advanced
          </button>
        </div>

        {/* Search Input */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search course code or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-50 transition-all"
          />
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left list table */}
        <div className={`lg:col-span-2 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4 ${selectedCourseId ? 'hidden lg:block' : 'block'}`}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Course Offerings Directory ({filteredCourses.length})</h2>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
              <p className="text-xs text-zinc-400">Loading catalog offerings...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
              <BookOpen className="w-8 h-8 text-zinc-300 mx-auto" />
              <p className="text-xs font-medium text-zinc-400">No courses matches query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-2">Code</th>
                    <th className="py-3 px-2">Course Title</th>
                    <th className="py-3 px-2">Difficulty Level</th>
                    <th className="py-3 px-2 text-right">Pricing</th>
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
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              crs.level === 'Beginner'
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                                : crs.level === 'Intermediate'
                                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                                : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400'
                            }`}
                          >
                            {crs.level}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-right font-mono font-bold text-zinc-800 dark:text-zinc-200">
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

        {/* Right workspace detail */}
        <div className={`p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-6 overflow-y-auto max-h-[80vh] ${selectedCourseId ? 'block' : 'hidden lg:block'}`}>
          {!selectedCourseId ? (
            <div className="h-full py-16 flex flex-col items-center justify-center text-center gap-3">
              <BookOpen className="w-10 h-10 text-zinc-300" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider">Syllabus Workspace</h3>
                <p className="text-xs text-zinc-400 max-w-xs mt-1 leading-relaxed">
                  Select a syllabus offering to review description details, publication status toggles, course attendee rosters, and assigned faculty advisors.
                </p>
              </div>
            </div>
          ) : !courseDetail ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
              <p className="text-xs text-zinc-400">Fetching syllabus ledger...</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Back button for mobile screens */}
              <button
                onClick={() => setSelectedCourseId(null)}
                className="lg:hidden mb-4 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Syllabus Directory
              </button>

              {/* Header */}
              <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-zinc-400">COURSE ID: {courseDetail.courseId}</span>
                    <h2 className="text-base font-bold tracking-tight mt-0.5">{courseDetail.title}</h2>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{courseDetail.description || 'No syllabus description provided.'}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={handleEditOpen}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
                      title="Edit Course"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you absolutely sure you want to delete this course syllabus? This removes all active student enrollments.')) {
                          deleteMutation.mutate(courseDetail.courseId);
                        }
                      }}
                      className="p-1.5 rounded-lg border border-rose-200/50 dark:border-rose-900/30 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600"
                      title="Delete Course"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Status Switch Controls */}
                <div className="flex gap-1.5 mt-4">
                  {courseDetail.status !== 'Published' && (
                    <button
                      onClick={() => publishMutation.mutate(courseDetail.courseId)}
                      className="flex-1 py-1.5 px-2 rounded-xl text-[9px] font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Publish
                    </button>
                  )}
                  {courseDetail.status !== 'Draft' && (
                    <button
                      onClick={() => unpublishMutation.mutate(courseDetail.courseId)}
                      className="flex-1 py-1.5 px-2 rounded-xl text-[9px] font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1"
                    >
                      <Hourglass className="w-3 h-3" />
                      Move Draft
                    </button>
                  )}
                  {courseDetail.status !== 'Archived' && (
                    <button
                      onClick={() => archiveMutation.mutate(courseDetail.courseId)}
                      className="flex-1 py-1.5 px-2 rounded-xl text-[9px] font-bold uppercase tracking-wider border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1"
                    >
                      <Archive className="w-3 h-3" />
                      Archive
                    </button>
                  )}
                </div>
              </div>

              {/* Stats detail */}
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-zinc-400 block font-semibold uppercase tracking-wider text-[9px]">Level</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block">{courseDetail.level}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-zinc-400 block font-semibold uppercase tracking-wider text-[9px]">Syllabus Hours</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block">{courseDetail.durationHours} hrs</span>
                </div>
                <div className="space-y-1">
                  <span className="text-zinc-400 block font-semibold uppercase tracking-wider text-[9px]">Price</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-0.5">
                    <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
                    {courseDetail.price}
                  </span>
                </div>
              </div>

              {/* Status Banner */}
              <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs">
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Catalog Status state</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  courseDetail.status === 'Published'
                    ? 'bg-emerald-50 text-emerald-600'
                    : courseDetail.status === 'Draft'
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-rose-50 text-rose-600'
                }`}>
                  {courseDetail.status}
                </span>
              </div>

              {/* Assigned Instructor Workspace details */}
              <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">Assigned Faculty</span>
                  <button
                    onClick={() => {
                      setNewInstructorId(courseDetail.instructorId.toString());
                      setInstructorModalOpen(true);
                    }}
                    className="text-[10px] font-bold text-zinc-600 hover:text-zinc-900"
                  >
                    Change Faculty
                  </button>
                </div>
                {courseInstructor ? (
                  <div>
                    <p className="font-bold text-zinc-800 dark:text-zinc-200">{courseInstructor.fullName}</p>
                    <p className="text-[10px] text-zinc-500">{courseInstructor.email}</p>
                  </div>
                ) : (
                  <p className="text-zinc-500 italic">No instructor assigned (Instructor ID: {courseDetail.instructorId})</p>
                )}
              </div>

              {/* Enrollment student roster */}
              <div className="space-y-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-zinc-400" />
                  Course Attendees Roster ({courseEnrollments?.length || 0})
                </h4>

                {courseEnrollments?.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">No students registered in this course syllabus.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {courseEnrollments?.map((en) => (
                      <div key={en.enrollmentId} className="p-2 border border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-lg text-xs flex justify-between items-center">
                        <div>
                          <p className="font-bold text-zinc-800 dark:text-zinc-200">{en.studentName}</p>
                          <span className="text-[9px] text-zinc-400 uppercase font-semibold">Progress: {en.progressPercent}%</span>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          en.status === 'Completed' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'
                        }`}>
                          {en.status}
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
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider">Create Course Syllabus</h3>
              <button onClick={() => setCreateModalOpen(false)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Course Title</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Fullstack Web Systems"
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Course Code</label>
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
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Syllabus Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Focuses on distributed system, Rest API web paradigms, MVC frameworks, database, etc."
                  className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Price ($)</label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Syllabus Hours</label>
                  <input
                    type="number"
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Difficulty</label>
                  <select
                    value={formLevel}
                    onChange={(e) => setFormLevel(e.target.value as CourseLevel)}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none font-semibold text-zinc-700"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Instructor Faculty ID</label>
                  <input
                    type="number"
                    value={formInstructorId}
                    onChange={(e) => setFormInstructorId(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Status State</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as CourseStatus)}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none font-semibold text-zinc-700"
                  >
                    <option value="Draft">Draft (Offline)</option>
                    <option value="Published">Published (Active)</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full py-2.5 text-xs font-semibold text-white dark:text-zinc-950 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer shadow-md"
              >
                {createMutation.isPending ? 'Saving Course...' : 'Register Syllabus Draft'}
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
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider">Edit Course Syllabus</h3>
              <button onClick={() => setEditModalOpen(false)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Course Title</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Course Code</label>
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
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Syllabus Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Price ($)</label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Syllabus Hours</label>
                  <input
                    type="number"
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Difficulty</label>
                  <select
                    value={formLevel}
                    onChange={(e) => setFormLevel(e.target.value as CourseLevel)}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Instructor Faculty ID</label>
                <input
                  type="number"
                  value={formInstructorId}
                  onChange={(e) => setFormInstructorId(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full py-2.5 text-xs font-semibold text-white dark:text-zinc-950 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer shadow-md"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Syllabus Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================
          MODAL: CHANGE INSTRUCTOR
          ==================================== */}
      {instructorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-w-sm w-full rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider">Assign New Faculty</h3>
              <button onClick={() => setInstructorModalOpen(false)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleChangeInstructorSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Faculty Instructor ID</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 3"
                  value={newInstructorId}
                  onChange={(e) => setNewInstructorId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                />
                <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed">
                  Provide the integer database key of the instructor who will oversee this course and sign off on grades.
                </p>
              </div>

              <button
                type="submit"
                disabled={changeInstructorMutation.isPending}
                className="w-full py-2.5 text-xs font-semibold text-white dark:text-zinc-950 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer shadow-md"
              >
                {changeInstructorMutation.isPending ? 'Saving...' : 'Re-Assign Faculty Leader'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
