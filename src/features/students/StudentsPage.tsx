import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { toast } from '../../components/Toast';
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

  // Selected student sub-queries
  const { data: studentDetail } = useQuery({
    queryKey: ['student', selectedStudentId],
    queryFn: () => apiService.students.getById(selectedStudentId!),
    enabled: selectedStudentId !== null,
  });

  const { data: studentProfile, error: profileError } = useQuery({
    queryKey: ['studentProfile', selectedStudentId],
    queryFn: () => apiService.students.getProfile(selectedStudentId!),
    enabled: selectedStudentId !== null,
    retry: false, // Don't keep retrying if profile is 404 (does not exist yet)
  });

  const { data: studentEnrollments } = useQuery({
    queryKey: ['studentEnrollments', selectedStudentId],
    queryFn: () => apiService.students.getEnrollments(selectedStudentId!),
    enabled: selectedStudentId !== null,
  });

  // 2. Mutations
  const createMutation = useMutation({
    mutationFn: apiService.students.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student Registered', 'New student account created successfully.');
      setCreateModalOpen(false);
      resetStudentForm();
    },
    onError: (err: any) => {
      toast.error('Registration Failed', err.response?.data?.message || 'Failed to register student.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStudentDto }) =>
      apiService.students.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', selectedStudentId] });
      toast.success('Student Updated', 'Profile details updated.');
      setEditModalOpen(false);
    },
    onError: (err: any) => {
      toast.error('Update Failed', err.response?.data?.message || 'Failed to update student.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: apiService.students.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student Deleted', 'Student account removed.');
      setSelectedStudentId(null);
    },
    onError: (err: any) => {
      toast.error('Deletion Failed', err.response?.data?.message || 'Failed to delete student.');
    },
  });

  // Quick state transitions
  const activateMutation = useMutation({
    mutationFn: apiService.students.activate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', selectedStudentId] });
      toast.success('Activated', 'Student account is now active.');
    },
  });

  const suspendMutation = useMutation({
    mutationFn: apiService.students.suspend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', selectedStudentId] });
      toast.success('Suspended', 'Student status changed to Suspended.');
    },
  });

  const graduateMutation = useMutation({
    mutationFn: apiService.students.graduate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', selectedStudentId] });
      toast.success('Graduated', 'Student marked as Graduated.');
    },
  });

  // Profile Mutations
  const saveProfileMutation = useMutation({
    mutationFn: ({ id, data, exists }: { id: number; data: CreateStudentProfileDto; exists: boolean }) => {
      if (exists) {
        return apiService.students.updateProfile(id, data as UpdateStudentProfileDto);
      } else {
        return apiService.students.createProfile(id, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile', selectedStudentId] });
      toast.success('Profile Saved', 'Student metadata profile successfully saved.');
      setProfileModalOpen(false);
    },
    onError: (err: any) => {
      toast.error('Failed to Save Profile', err.response?.data?.message || 'Error occurred.');
    },
  });

  const deleteProfileMutation = useMutation({
    mutationFn: apiService.students.deleteProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile', selectedStudentId] });
      toast.success('Profile Deleted', 'Demographic profile cleared.');
    },
  });

  const resetStudentForm = () => {
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
    const payload: CreateStudentDto = {
      firstName: formFirstName,
      lastName: formLastName,
      email: formEmail,
      password: formPassword || 'StudentPass123!',
      phoneNumber: formPhone,
      dateOfBirth: formDOB,
      status: formStatus,
    };
    createMutation.mutate(payload);
  };

  const handleEditOpen = () => {
    if (!studentDetail) return;
    setFormFirstName(studentDetail.fullName?.split(' ')[0] || '');
    setFormLastName(studentDetail.fullName?.split(' ')[1] || '');
    setFormPassword('');
    setFormPhone(studentDetail.phoneNumber || '');
    setFormStatus(studentDetail.status);
    setEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    const payload: UpdateStudentDto = {
      firstName: formFirstName,
      lastName: formLastName,
      password: formPassword || null,
      status: formStatus,
      phoneNumber: formPhone,
    };
    updateMutation.mutate({ id: selectedStudentId, data: payload });
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
    const profileExists = !!studentProfile && !profileError;
    const payload: CreateStudentProfileDto = {
      address: profAddress,
      city: profCity,
      country: profCountry,
      bio: profBio,
      linkedInUrl: profLinkedIn,
    };
    saveProfileMutation.mutate({ id: selectedStudentId, data: payload, exists: profileExists });
  };

  const filteredStudents = students?.filter((std) => {
    const query = searchQuery.toLowerCase();
    return (
      std.fullName?.toLowerCase().includes(query) ||
      std.email?.toLowerCase().includes(query) ||
      std.studentId.toString().includes(query)
    );
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Students Body</h1>
          <p className="text-xs text-zinc-500 mt-1">Manage corporate students, demographic profiles, and progress logs</p>
        </div>
        <button
          onClick={() => {
            resetStudentForm();
            setCreateModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white dark:text-zinc-950 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Register Student
        </button>
      </div>

      {/* Tabs and search filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        {/* Status filters */}
        <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl w-fit flex-wrap gap-1">
          <button
            onClick={() => {
              setActiveTab('all');
              setSelectedStudentId(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            All Students
          </button>
          <button
            onClick={() => {
              setActiveTab('active');
              setSelectedStudentId(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'active'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => {
              setActiveTab('suspended');
              setSelectedStudentId(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'suspended'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Suspended
          </button>
          <button
            onClick={() => {
              setActiveTab('graduated');
              setSelectedStudentId(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'graduated'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Graduated
          </button>
        </div>

        {/* Search */}
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

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side Student List */}
        <div className={`lg:col-span-2 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4 ${selectedStudentId ? 'hidden lg:block' : 'block'}`}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Students Directory ({filteredStudents.length})</h2>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
              <p className="text-xs text-zinc-400">Loading directory index...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
              <GraduationCap className="w-8 h-8 text-zinc-300 mx-auto" />
              <p className="text-xs font-medium text-zinc-400">No student records found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-2">ID</th>
                    <th className="py-3 px-2">Student Name</th>
                    <th className="py-3 px-2">Phone</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Detail</th>
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
                            {std.status}
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

        {/* Right Side Detail workspace */}
        <div className={`p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-6 overflow-y-auto max-h-[80vh] ${selectedStudentId ? 'block' : 'hidden lg:block'}`}>
          {!selectedStudentId ? (
            <div className="h-full py-16 flex flex-col items-center justify-center text-center gap-3">
              <GraduationCap className="w-10 h-10 text-zinc-300" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider">Student Workspace</h3>
                <p className="text-xs text-zinc-400 max-w-xs mt-1 leading-relaxed">
                  Select a student from the index to review address locations, LinkedIn bios, demographic settings, status overrides, and enrollment course records.
                </p>
              </div>
            </div>
          ) : !studentDetail ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
              <p className="text-xs text-zinc-400">Loading student dossier...</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Back button for mobile screens */}
              <button
                onClick={() => setSelectedStudentId(null)}
                className="lg:hidden mb-4 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Students Directory
              </button>

              {/* Workspace Header */}
              <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-zinc-400">STUDENT ID: {studentDetail.studentId}</span>
                    <h2 className="text-base font-bold tracking-tight mt-0.5">{studentDetail.fullName}</h2>
                    <p className="text-xs text-zinc-400">{studentDetail.email}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={handleEditOpen}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                      title="Edit Account"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you absolutely sure you want to delete this student and their historical records?')) {
                          deleteMutation.mutate(studentDetail.studentId);
                        }
                      }}
                      className="p-1.5 rounded-lg border border-rose-200/50 dark:border-rose-900/30 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600"
                      title="Delete Account"
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
                      className="flex-1 py-1 px-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1"
                    >
                      <UserCheck className="w-3 h-3" />
                      Activate
                    </button>
                  )}
                  {studentDetail.status !== 'Suspended' && (
                    <button
                      onClick={() => suspendMutation.mutate(studentDetail.studentId)}
                      className="flex-1 py-1 px-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1"
                    >
                      <UserX className="w-3 h-3" />
                      Suspend
                    </button>
                  )}
                  {studentDetail.status !== 'Graduated' && (
                    <button
                      onClick={() => graduateMutation.mutate(studentDetail.studentId)}
                      className="flex-1 py-1 px-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1"
                    >
                      <Award className="w-3 h-3" />
                      Graduate
                    </button>
                  )}
                </div>
              </div>

              {/* DOB, Phone, Date */}
              <div className="grid grid-cols-2 gap-4 text-xs pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="space-y-1">
                  <span className="text-zinc-400 block font-semibold uppercase tracking-wider text-[9px]">Date of Birth</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    {new Date(studentDetail.dateOfBirth).toLocaleDateString()}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-zinc-400 block font-semibold uppercase tracking-wider text-[9px]">Registered At</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {new Date(studentDetail.registeredAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* DEMOGRAPHIC PROFILE CARD */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    Biographic Profile
                  </h4>
                  <button
                    onClick={handleProfileOpen}
                    className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    {studentProfile ? 'Edit Profile' : 'Create Profile'}
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
                      className="absolute top-2 right-2 p-1 text-zinc-300 hover:text-rose-500 rounded"
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
                  Course Enrollment History ({studentEnrollments?.length || 0})
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
                            {en.status}
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px] text-zinc-400">
                          <span>Registered: {new Date(en.enrollmentDate).toLocaleDateString()}</span>
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
              <h3 className="text-sm font-bold uppercase tracking-wider">New Student Registration</h3>
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
                    placeholder="John"
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
                    placeholder="Smith"
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Email Address</label>
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
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Password</label>
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
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +1 555-0199"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Date of Birth</label>
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
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Core Enrollment Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as StudentStatus)}
                  className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none font-semibold text-zinc-700"
                >
                  <option value="Active">Active Student</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Graduated">Graduated Alumni</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full py-2.5 text-xs font-semibold text-white dark:text-zinc-950 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer shadow-md"
              >
                {createMutation.isPending ? 'Registering...' : 'Complete Registration'}
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
              <h3 className="text-sm font-bold uppercase tracking-wider">Modify Student Account</h3>
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
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Change Account Password (Optional)</label>
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
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Status State</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as StudentStatus)}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Graduated">Graduated</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full py-2.5 text-xs font-semibold text-white dark:text-zinc-950 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer shadow-md"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Account Changes'}
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
              <h3 className="text-sm font-bold uppercase tracking-wider">Demographic Bio Profile</h3>
              <button onClick={() => setProfileModalOpen(false)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Street Address</label>
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
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">City</label>
                  <input
                    type="text"
                    placeholder="New York"
                    value={profCity}
                    onChange={(e) => setProfCity(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Country</label>
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
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Professional Bio</label>
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
                {saveProfileMutation.isPending ? 'Saving Profile...' : 'Save demographic Profile'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
