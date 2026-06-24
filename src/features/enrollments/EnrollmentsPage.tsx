import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { toast } from '../../components/Toast';
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

  // 2. Mutations
  const enrollMutation = useMutation({
    mutationFn: apiService.enrollments.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['enrollmentStats'] });
      toast.success('Registration Saved', 'Student enrolled in course syllabus successfully.');
      setEnrollModalOpen(false);
      setEnrollStudentId('');
      setEnrollCourseId('');
    },
    onError: (err: any) => {
      toast.error('Enrollment Failed', err.response?.data?.message || 'Check ID numbers.');
    },
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CompleteEnrollmentDto }) =>
      apiService.enrollments.complete(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['enrollmentStats'] });
      queryClient.invalidateQueries({ queryKey: ['enrollment', selectedEnrollmentId] });
      toast.success('Syllabus Completed', 'Course finalized and student grade recorded.');
      setCompleteModalOpen(false);
    },
    onError: (err: any) => {
      toast.error('Finalization Failed', err.response?.data?.message || 'Invalid parameters.');
    },
  });

  const progressMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEnrollmentProgressDto }) =>
      apiService.enrollments.updateProgress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['enrollment', selectedEnrollmentId] });
      toast.success('Progress Updated', 'Syllabus progress percentages updated.');
      setProgressModalOpen(false);
    },
    onError: (err: any) => {
      toast.error('Failed to Update Progress', err.response?.data?.message || 'Error occurred.');
    },
  });

  const dropMutation = useMutation({
    mutationFn: apiService.enrollments.drop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['enrollmentStats'] });
      queryClient.invalidateQueries({ queryKey: ['enrollment', selectedEnrollmentId] });
      toast.success('Student Dropped', 'Attendee discontinued from course syllabus successfully.');
    },
    onError: (err: any) => {
      toast.error('Action Failed', err.response?.data?.message || 'Conflict occurred.');
    },
  });

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollStudentId || !enrollCourseId) return;
    const payload: EnrollStudentDto = {
      studentId: Number(enrollStudentId),
      courseId: Number(enrollCourseId),
    };
    enrollMutation.mutate(payload);
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollmentId) return;
    completeMutation.mutate({
      id: selectedEnrollmentId,
      data: { finalGrade: Number(formFinalGrade) },
    });
  };

  const handleProgressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollmentId) return;
    progressMutation.mutate({
      id: selectedEnrollmentId,
      data: { progressPercent: Number(formProgressPercent) },
    });
  };

  const filteredEnrollments = enrollments?.filter((en) => {
    const query = searchQuery.toLowerCase();
    return (
      en.studentName?.toLowerCase().includes(query) ||
      en.courseTitle?.toLowerCase().includes(query) ||
      en.enrollmentId.toString().includes(query)
    );
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Enrollments Portal</h1>
          <p className="text-xs text-zinc-500 mt-1">Enroll students, record final grading, track class completion ratios, and drop records</p>
        </div>
        <button
          onClick={() => setEnrollModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white dark:text-zinc-950 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Enroll Attendee
        </button>
      </div>

      {/* Tabs and filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        {/* State Tabs */}
        <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl w-fit flex-wrap">
          <button
            onClick={() => {
              setActiveTab('all');
              setSelectedEnrollmentId(null);
            }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            All Ledger
          </button>
          <button
            onClick={() => {
              setActiveTab('active');
              setSelectedEnrollmentId(null);
            }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'active'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Active Only
          </button>
          <button
            onClick={() => {
              setActiveTab('completed');
              setSelectedEnrollmentId(null);
            }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'completed'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => {
              setActiveTab('dropped');
              setSelectedEnrollmentId(null);
            }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'dropped'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Dropped
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search attendee or course name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-50 transition-all"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Directory of Enrollments */}
        <div className={`lg:col-span-2 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4 ${selectedEnrollmentId ? 'hidden lg:block' : 'block'}`}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Enrollments Directory ({filteredEnrollments.length})</h2>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
              <p className="text-xs text-zinc-400">Loading registrations ledger...</p>
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
              <ClipboardList className="w-8 h-8 text-zinc-300 mx-auto" />
              <p className="text-xs font-medium text-zinc-400">No enrollment records found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-2">ID</th>
                    <th className="py-3 px-2">Student</th>
                    <th className="py-3 px-2">Assigned Course</th>
                    <th className="py-3 px-2">Progress</th>
                    <th className="py-3 px-2 text-right">State</th>
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
                            <div className="w-16 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-zinc-950 dark:bg-zinc-100" style={{ width: `${en.progressPercent}%` }} />
                            </div>
                            <span className="text-[10px] font-mono text-zinc-500">{en.progressPercent}%</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-2 text-right">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              en.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-600'
                                : en.status === 'Active'
                                ? 'bg-amber-50 text-amber-600'
                                : 'bg-rose-50 text-rose-600'
                            }`}
                          >
                            {en.status}
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
                <h3 className="text-xs font-bold uppercase tracking-wider">Enrollments Workspace</h3>
                <p className="text-xs text-zinc-400 max-w-xs mt-1 leading-relaxed">
                  Select a registration ID from the ledger to change progress metrics, record final grades, complete classes, or issue a course drop.
                </p>
              </div>
            </div>
          ) : !enrollmentDetail ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
              <p className="text-xs text-zinc-400">Loading enrollment workbook...</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in text-xs">
              {/* Back button for mobile screens */}
              <button
                onClick={() => setSelectedEnrollmentId(null)}
                className="lg:hidden mb-4 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Enrollments Directory
              </button>

              {/* Header */}
              <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] font-mono font-bold text-zinc-400">REGISTRATION ID: {enrollmentDetail.enrollmentId}</span>
                <h2 className="text-base font-bold tracking-tight mt-0.5">{enrollmentDetail.studentName}</h2>
                <p className="text-zinc-500 mt-1 leading-relaxed">
                  Enrolled in: <span className="font-bold text-zinc-800 dark:text-zinc-200">{enrollmentDetail.courseTitle}</span>
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
                      Set Progress
                    </button>
                    <button
                      onClick={() => {
                        setFormFinalGrade('90');
                        setCompleteModalOpen(true);
                      }}
                      className="flex-1 py-1.5 px-2.5 rounded-xl font-bold uppercase tracking-wider text-[10px] border border-emerald-200 text-emerald-600 dark:border-emerald-950 dark:text-emerald-400 text-center cursor-pointer hover:bg-emerald-50/40"
                    >
                      Mark Complete
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you absolutely sure you want to drop this student from the course?')) {
                          dropMutation.mutate(enrollmentDetail.enrollmentId);
                        }
                      }}
                      className="flex-1 py-1.5 px-2.5 rounded-xl font-bold uppercase tracking-wider text-[10px] border border-rose-200 text-rose-600 dark:border-rose-950 dark:text-rose-400 text-center cursor-pointer hover:bg-rose-50/40"
                    >
                      Drop Class
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
                  <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[9px]">Status</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    enrollmentDetail.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {enrollmentDetail.status}
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
                  <span className="text-zinc-400 block font-semibold uppercase tracking-wider text-[9px]">Enrollment Date</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    {new Date(enrollmentDetail.enrollmentDate).toLocaleDateString()}
                  </span>
                </div>
                {enrollmentDetail.completionDate && (
                  <div className="space-y-1">
                    <span className="text-zinc-400 block font-semibold uppercase tracking-wider text-[9px]">Completion Date</span>
                    <span className="font-bold text-emerald-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                      {new Date(enrollmentDetail.completionDate).toLocaleDateString()}
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
              <h3 className="text-sm font-bold uppercase tracking-wider">Enroll Student in Course</h3>
              <button onClick={() => setEnrollModalOpen(false)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Student Account ID</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                    <GraduationCap className="w-4 h-4" />
                  </span>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1"
                    value={enrollStudentId}
                    onChange={(e) => setEnrollStudentId(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Course Syllabus ID</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                    <BookOpen className="w-4 h-4" />
                  </span>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5"
                    value={enrollCourseId}
                    onChange={(e) => setEnrollCourseId(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={enrollMutation.isPending}
                className="w-full py-2.5 text-xs font-semibold text-white dark:text-zinc-950 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer shadow-md"
              >
                {enrollMutation.isPending ? 'Enrolling...' : 'Confirm Registration'}
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
              <h3 className="text-sm font-bold uppercase tracking-wider">Set Course Progress</h3>
              <button onClick={() => setProgressModalOpen(false)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
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
                  className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={progressMutation.isPending}
                className="w-full py-2.5 text-xs font-semibold text-white dark:text-zinc-950 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer shadow-md"
              >
                {progressMutation.isPending ? 'Saving...' : 'Save Syllabus Progress'}
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
              <h3 className="text-sm font-bold uppercase tracking-wider">Mark Completed & Grade</h3>
              <button onClick={() => setCompleteModalOpen(false)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
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
                {completeMutation.isPending ? 'Submitting...' : 'Issue Final Grade & Close'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
