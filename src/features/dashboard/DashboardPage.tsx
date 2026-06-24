import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import {
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  CheckCircle,
  AlertCircle,
  XCircle,
  Activity,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  // Fetch Enrollment statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['enrollmentStats'],
    queryFn: apiService.enrollments.getStatistics,
  });

  // Fetch count of students
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['studentsAll'],
    queryFn: apiService.students.getAll,
  });

  // Fetch count of instructors
  const { data: instructors, isLoading: instructorsLoading } = useQuery({
    queryKey: ['instructorsAll'],
    queryFn: apiService.instructors.getAll,
  });

  // Fetch count of courses
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['coursesAll'],
    queryFn: apiService.courses.getAll,
  });

  // Fetch all enrollments for recent activities
  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['enrollmentsAll'],
    queryFn: apiService.enrollments.getAll,
  });

  const isLoading = statsLoading || studentsLoading || instructorsLoading || coursesLoading || enrollmentsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton UI for KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 animate-pulse" />
          <div className="h-96 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 animate-pulse" />
        </div>
      </div>
    );
  }

  // Derived aggregates
  const totalStudentsCount = students?.length || 0;
  const activeStudentsCount = students?.filter((s) => s.status === 'Active').length || 0;
  const totalInstructorsCount = instructors?.length || 0;
  const activeInstructorsCount = instructors?.filter((i) => i.isActive).length || 0;
  const totalCoursesCount = courses?.length || 0;
  const publishedCoursesCount = courses?.filter((c) => c.status === 'Published').length || 0;

  // Recent 5 activities
  const recentEnrollments = enrollments ? [...enrollments].reverse().slice(0, 5) : [];

  return (
    <div className="space-y-8">
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Overview</h1>
          <p className="text-xs text-zinc-500 mt-1">Real-time indicators and operational matrix of Training Center</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 font-medium">
          <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse shrink-0" />
          <span className="text-zinc-500">API Gateway Status:</span>
          <span className="text-emerald-500 font-semibold uppercase">Online</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between shadow-sm">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Total Registrations</span>
            <p className="text-2xl font-bold tracking-tight">{stats?.totalEnrollments || 0}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            <ClipboardList className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between shadow-sm">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Active Enrollment</span>
            <p className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {stats?.activeEnrollments || 0}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between shadow-sm">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Completed Grad</span>
            <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 animate-fade-in">
              {stats?.completedEnrollments || 0}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between shadow-sm">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Dropped Course</span>
            <p className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
              {stats?.droppedEnrollments || 0}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Grid of Section Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Metrics Grid */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-base font-bold tracking-tight">Resources Allocation Summary</h2>
              <p className="text-xs text-zinc-400">Inventory and deployment metrics</p>
            </div>
            <TrendingUp className="w-4 h-4 text-zinc-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Metric Card */}
            <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center gap-3">
              <div className="p-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 rounded-lg shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Instructors</span>
                <p className="text-base font-bold tracking-tight">{totalInstructorsCount}</p>
                <span className="text-[9px] text-emerald-500 font-medium">({activeInstructorsCount} Active)</span>
              </div>
            </div>

            {/* Metric Card */}
            <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center gap-3">
              <div className="p-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 rounded-lg shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Students</span>
                <p className="text-base font-bold tracking-tight">{totalStudentsCount}</p>
                <span className="text-[9px] text-emerald-500 font-medium">({activeStudentsCount} Active)</span>
              </div>
            </div>

            {/* Metric Card */}
            <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center gap-3">
              <div className="p-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 rounded-lg shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Courses</span>
                <p className="text-base font-bold tracking-tight">{totalCoursesCount}</p>
                <span className="text-[9px] text-zinc-500 font-medium">({publishedCoursesCount} Published)</span>
              </div>
            </div>
          </div>

          {/* Quick CSS/HTML dynamic bar graph visualization of enrollments */}
          <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
            <h3 className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Registration Ratio Analysis</h3>
            <div className="space-y-3.5">
              {/* Active */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-zinc-600 dark:text-zinc-400">Active Course Attendees</span>
                  <span className="font-semibold">{stats?.totalEnrollments ? Math.round(((stats.activeEnrollments) / stats.totalEnrollments) * 100) : 0}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${stats?.totalEnrollments ? ((stats.activeEnrollments) / stats.totalEnrollments) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Completed */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-zinc-600 dark:text-zinc-400">Successfully Completed / Graduated</span>
                  <span className="font-semibold">{stats?.totalEnrollments ? Math.round(((stats.completedEnrollments) / stats.totalEnrollments) * 100) : 0}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${stats?.totalEnrollments ? ((stats.completedEnrollments) / stats.totalEnrollments) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Dropped */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-zinc-600 dark:text-zinc-400">Dropped / Discontinued</span>
                  <span className="font-semibold">{stats?.totalEnrollments ? Math.round(((stats.droppedEnrollments) / stats.totalEnrollments) * 100) : 0}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${stats?.totalEnrollments ? ((stats.droppedEnrollments) / stats.totalEnrollments) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick System Summary panel */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold tracking-tight">System Summary</h2>
            <p className="text-xs text-zinc-400">Enterprise operational context</p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-600 dark:text-zinc-300 shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold">Managerial Hierarchies</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
                  Support for instructor managers and subordinate workflow tracking is fully active.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-600 dark:text-zinc-300 shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold">Course States Workflow</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
                  Toggle course visibility through Draft, Published, and Archived states dynamically.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-600 dark:text-zinc-300 shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold">Student Profile Records</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
                  Store demographic bios, LinkedIn profiles, and address details directly linked with core accounts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities Panel */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-bold tracking-tight">Recent Registration Logs</h2>
            <p className="text-xs text-zinc-400">The latest student enrollments processed by API</p>
          </div>
          <Link
            to="/enrollments"
            className="text-xs font-semibold flex items-center gap-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Manage Enrollments
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentEnrollments.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
            <p className="text-xs text-zinc-400">No recent enrollment logs found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-2">Student</th>
                  <th className="py-3 px-2">Course Title</th>
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2">Progress</th>
                  <th className="py-3 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/40 font-medium">
                {recentEnrollments.map((en) => (
                  <tr key={en.enrollmentId} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                    <td className="py-3.5 px-2 font-semibold">{en.studentName || `ID: ${en.studentId}`}</td>
                    <td className="py-3.5 px-2 text-zinc-600 dark:text-zinc-400">{en.courseTitle || `ID: ${en.courseId}`}</td>
                    <td className="py-3.5 px-2 text-zinc-400">
                      {new Date(en.enrollmentDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden shrink-0">
                          <div
                            className="h-full bg-zinc-900 dark:bg-zinc-50 rounded-full"
                            style={{ width: `${en.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono font-semibold">
                          {en.progressPercent}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          en.status === 'Active'
                            ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                            : en.status === 'Completed'
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {en.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
