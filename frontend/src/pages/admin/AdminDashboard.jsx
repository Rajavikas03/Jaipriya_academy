import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import AudioPlayer from '../../components/AudioPlayer';
import AdminSpokenBatchManager from './AdminSpokenBatchManager';
import { 
  Users, 
  UploadCloud, 
  Trophy, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  X, 
  Calculator,
  ChevronRight,
  Clock,
  HelpCircle,
  Eye,
  Calendar,
  Phone,
  BookOpen,
  Send,
  Layers,
  FileText,
  Mic,
  Volume2,
  Image as ImageIcon,
  Headphones,
  Sparkles,
  Filter,
  VolumeX,
  Play
} from 'lucide-react';

const ABACUS_LEVELS = [
  { value: 'JUNIOR', label: 'Junior' },
  { value: 'LEVEL_1', label: 'Level 1' },
  { value: 'LEVEL_2', label: 'Level 2' },
  { value: 'LEVEL_3', label: 'Level 3' },
  { value: 'LEVEL_4', label: 'Level 4' },
  { value: 'LEVEL_5', label: 'Level 5' },
  { value: 'LEVEL_6', label: 'Level 6' },
  { value: 'LEVEL_7', label: 'Level 7' },
  { value: 'LEVEL_8', label: 'Level 8' },
];

const SPOKEN_SECTION_TYPES = [
  { value: 'THEORY', label: 'Theory (Read + Listen)' },
  { value: 'PRACTICE', label: 'Practice (Read + Listen + Record)' },
  { value: 'TEST', label: 'Test (Read + Record + Evaluate)' },
];

const SPOKEN_CONTENT_TYPES = [
  { value: 'WORD', label: 'Word' },
  { value: 'SENTENCE', label: 'Sentence' },
  { value: 'PARAGRAPH', label: 'Paragraph' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'upload' | 'scores'

  // ==========================================
  // Students Management State
  // ==========================================
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('');
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentFormData, setStudentFormData] = useState({
    full_name: '',
    mobile_number: '',
    standard: '',
    date_of_birth: '',
    abacus_level: 'LEVEL_1',
    gender: '',
    parent_name: '',
    parent_mobile: '',
    school_name: '',
    address: '',
  });
  const [studentFormSubmitting, setStudentFormSubmitting] = useState(false);
  const [studentFormError, setStudentFormError] = useState('');
  const [studentSpokenHistory, setStudentSpokenHistory] = useState(null);
  const [studentSpokenHistoryLoading, setStudentSpokenHistoryLoading] = useState(false);

  // ==========================================
  // Upload Questions State
  // ==========================================
  const [uploadSubject, setUploadSubject] = useState('abacus'); // 'abacus' | 'spoken-english'
  
  // Abacus Upload State
  const [uploadLevel, setUploadLevel] = useState('LEVEL_3');
  const [testTitle, setTestTitle] = useState('Week 1 Abacus - Level 3');
  const [testDuration, setTestDuration] = useState(10);
  const [questionsList, setQuestionsList] = useState([
    { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' },
    { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' },
  ]);
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState('');
  const [publishError, setPublishError] = useState('');

  // Modern Spoken English Content Upload State (Batch 6)
  const [spokenSectionType, setSpokenSectionType] = useState('THEORY');
  const [spokenContentType, setSpokenContentType] = useState('WORD');
  const [spokenContentTitle, setSpokenContentTitle] = useState('');
  const [spokenTextContent, setSpokenTextContent] = useState('');
  const [spokenAudioFile, setSpokenAudioFile] = useState(null);
  const [spokenAudioPreviewUrl, setSpokenAudioPreviewUrl] = useState(null);
  const [spokenImageFile, setSpokenImageFile] = useState(null);
  const [spokenImagePreviewUrl, setSpokenImagePreviewUrl] = useState(null);
  const [spokenOrder, setSpokenOrder] = useState(1);
  const [spokenIsActive, setSpokenIsActive] = useState(true);
  const [spokenUploading, setSpokenUploading] = useState(false);
  const [spokenSuccess, setSpokenSuccess] = useState('');
  const [spokenError, setSpokenError] = useState('');
  const [spokenItems, setSpokenItems] = useState([]); // New array to hold batch items

  // Spoken English Content List (for review / management)
  const [spokenContentItems, setSpokenContentItems] = useState([]);
  const [spokenFilterSection, setSpokenFilterSection] = useState('');
  const [spokenFilterType, setSpokenFilterType] = useState('');
  const [spokenContentLoading, setSpokenContentLoading] = useState(false);

  // ==========================================
  // Test Scores State
  // ==========================================
  const [scoresSubject, setScoresSubject] = useState('abacus'); // 'abacus' | 'spoken-tests' | 'spoken-practice' | 'spoken-legacy'
  const [adminTests, setAdminTests] = useState([]);
  const [spokenTestAttempts, setSpokenTestAttempts] = useState([]);
  const [spokenPracticeHistory, setSpokenPracticeHistory] = useState([]);
  const [adminSpokenTopics, setAdminSpokenTopics] = useState([]);
  const [scoresLoading, setScoresLoading] = useState(false);
  
  // Abacus / Legacy Scores Modal
  const [selectedItemForScores, setSelectedItemForScores] = useState(null);
  const [testScoresData, setTestScoresData] = useState(null);
  const [scoresModalOpen, setScoresModalOpen] = useState(false);

  // Spoken English Test Audio Review Modal
  const [spokenTestDetailModalOpen, setSpokenTestDetailModalOpen] = useState(false);
  const [selectedSpokenTestDetail, setSelectedSpokenTestDetail] = useState(null);
  const [spokenTestDetailLoading, setSpokenTestDetailLoading] = useState(false);

  // Docs Management State
  const [adminDocs, setAdminDocs] = useState([]);
  const [adminDocsLoading, setAdminDocsLoading] = useState(false);
  const [docFile, setDocFile] = useState(null);
  const [docTitle, setDocTitle] = useState('');
  const [docDescription, setDocDescription] = useState('');
  const [docUploading, setDocUploading] = useState(false);
  const [docError, setDocError] = useState('');

  // ------------------------------------------
  // Load Students
  // ------------------------------------------
  const loadStudents = async () => {
    try {
      setStudentsLoading(true);
      const data = await adminService.getStudents(studentSearch, selectedLevelFilter);
      setStudents(data || []);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setStudentsLoading(false);
    }
  };

  const loadDocs = async () => {
    try {
      setAdminDocsLoading(true);
      const data = await adminService.getDocuments();
      setAdminDocs(data || []);
    } catch (err) {
      console.error('Failed to load docs:', err);
    } finally {
      setAdminDocsLoading(false);
    }
  };

  // ------------------------------------------
  // Load Spoken English Content List
  // ------------------------------------------
  const loadSpokenContent = async () => {
    try {
      setSpokenContentLoading(true);
      const data = await adminService.getSpokenContent(spokenFilterSection, spokenFilterType);
      setSpokenContentItems(data || []);
    } catch (err) {
      console.error('Failed to load spoken content items:', err);
    } finally {
      setSpokenContentLoading(false);
    }
  };

  // ------------------------------------------
  // Load Scores Data
  // ------------------------------------------
  const loadScoresData = async () => {
    try {
      setScoresLoading(true);
      if (scoresSubject === 'abacus') {
        const data = await adminService.getAdminTests();
        setAdminTests(data || []);
      } else if (scoresSubject === 'spoken-tests') {
        const res = await adminService.getSpokenTestScores();
        setSpokenTestAttempts(res?.attempts || []);
      } else if (scoresSubject === 'spoken-practice') {
        const res = await adminService.getSpokenPracticeHistory();
        setSpokenPracticeHistory(res?.practices || []);
      } else if (scoresSubject === 'spoken-legacy') {
        const data = await adminService.getAdminSpokenTopics();
        setAdminSpokenTopics(data || []);
      }
    } catch (err) {
      console.error('Failed to load scores list:', err);
    } finally {
      setScoresLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'students') {
      loadStudents();
    } else if (activeTab === 'upload' && uploadSubject === 'spoken-english') {
      loadSpokenContent();
    } else if (activeTab === 'scores') {
      loadScoresData();
    } else if (activeTab === 'docs') {
      loadDocs();
    }
  }, [activeTab, studentSearch, selectedLevelFilter, uploadSubject, spokenFilterSection, spokenFilterType, scoresSubject]);

  // ------------------------------------------
  // Student Form Handlers
  // ------------------------------------------
  const handleOpenAddStudent = () => {
    setEditingStudent(null);
    setStudentFormData({
      full_name: '',
      mobile_number: '',
      standard: '',
      date_of_birth: '',
      abacus_level: 'LEVEL_1',
      gender: '',
      parent_name: '',
      parent_mobile: '',
      school_name: '',
      address: '',
    });
    setStudentFormError('');
    setStudentModalOpen(true);
  };

  const handleOpenEditStudent = async (student) => {
    setEditingStudent(student);
    setStudentFormData({
      full_name: student.full_name || '',
      mobile_number: student.mobile_number || student.phone_number || '',
      standard: student.standard || '',
      date_of_birth: student.date_of_birth || '',
      abacus_level: student.abacus_level || 'LEVEL_1',
      gender: student.gender || '',
      parent_name: student.parent_name || '',
      parent_mobile: student.parent_mobile || '',
      school_name: student.school_name || '',
      address: student.address || '',
    });
    setStudentFormError('');
    setStudentModalOpen(true);
    
    // Fetch Spoken English history
    setStudentSpokenHistory(null);
    setStudentSpokenHistoryLoading(true);
    try {
      const history = await adminService.getStudentSpokenTestHistory(student.id);
      setStudentSpokenHistory(history);
    } catch (err) {
      console.error('Failed to load student test history', err);
    } finally {
      setStudentSpokenHistoryLoading(false);
    }
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    setStudentFormError('');

    if (!studentFormData.full_name.trim() || !studentFormData.mobile_number.trim() || !studentFormData.standard.trim()) {
      setStudentFormError('Full Name, Mobile Number, and Standard are required.');
      return;
    }

    setStudentFormSubmitting(true);
    try {
      if (editingStudent) {
        await adminService.updateStudent(editingStudent.id, studentFormData);
      } else {
        await adminService.createStudent(studentFormData);
      }
      setStudentModalOpen(false);
      loadStudents();
    } catch (err) {
      const msg = err.data ? Object.values(err.data).flat().join(' ') : (err.message || 'Failed to save student.');
      setStudentFormError(msg);
    } finally {
      setStudentFormSubmitting(false);
    }
  };

  const handleDeleteStudent = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove student "${name}"?`)) return;
    try {
      await adminService.deleteStudent(id);
      loadStudents();
    } catch (err) {
      alert(err.message || 'Failed to delete student.');
    }
  };

  // ------------------------------------------
  // Abacus Upload Handlers
  // ------------------------------------------
  const handleAddQuestion = () => {
    setQuestionsList((prev) => [
      ...prev,
      { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' }
    ]);
  };

  const handleRemoveQuestion = (index) => {
    if (questionsList.length <= 1) return;
    setQuestionsList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleQuestionChange = (index, field, value) => {
    setQuestionsList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handlePublishTest = async (e) => {
    e.preventDefault();
    setPublishError('');
    setPublishSuccess('');

    if (!testTitle.trim()) {
      setPublishError('Please provide a test title.');
      return;
    }

    for (let i = 0; i < questionsList.length; i++) {
      const q = questionsList[i];
      if (!q.question_text.trim() || !q.option_a.trim() || !q.option_b.trim() || !q.option_c.trim() || !q.option_d.trim()) {
        setPublishError(`Question ${i + 1} has incomplete text or options.`);
        return;
      }
    }

    setPublishing(true);
    try {
      const payload = {
        title: testTitle.trim(),
        level: uploadLevel,
        duration_minutes: Number(testDuration) || 10,
        questions: questionsList.map((q, idx) => ({ ...q, order: idx + 1 })),
      };

      await adminService.publishTest(payload);
      setPublishSuccess(`Test "${testTitle}" published successfully for ${uploadLevel}!`);
      setQuestionsList([
        { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' },
        { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' },
      ]);
    } catch (err) {
      setPublishError(err.message || 'Failed to publish test.');
    } finally {
      setPublishing(false);
    }
  };

  // ------------------------------------------
  // Modern Spoken English Content Upload Handlers (Batch 6)
  // ------------------------------------------
  const handleAudioFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSpokenAudioFile(file);
      setSpokenAudioPreviewUrl(URL.createObjectURL(file));
    } else {
      setSpokenAudioFile(null);
      setSpokenAudioPreviewUrl(null);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSpokenImageFile(file);
      setSpokenImagePreviewUrl(URL.createObjectURL(file));
    } else {
      setSpokenImageFile(null);
      setSpokenImagePreviewUrl(null);
    }
  };

// Add a spoken content item to the batch (does not upload yet)
  const handleAddSpokenItem = (e) => {
    e.preventDefault();
    setSpokenError('');
    setSpokenSuccess('');

    // Validation (same as original)
    if (!spokenTextContent.trim()) {
      setSpokenError('Text Content is required (the word, sentence, or paragraph).');
      return;
    }
    if (spokenSectionType !== 'TEST' && !spokenAudioFile) {
      const proceed = window.confirm('No reference audio file selected for Theory/Practice mode. Do you want to proceed without audio?');
      if (!proceed) return;
    }

    const newItem = {
      section_type: spokenSectionType,
      content_type: spokenContentType,
      title: spokenContentTitle.trim() || `${spokenContentType}: ${spokenTextContent.slice(0, 30)}...`,
      text_content: spokenTextContent.trim(),
      order: Number(spokenOrder) || 1,
      is_active: spokenIsActive,
      reference_audio: spokenAudioFile,
      image: spokenImageFile,
    };
    setSpokenItems(prev => [...prev, newItem]);
    setSpokenSuccess('Item added to batch.');

    // Reset form for next entry
    setSpokenContentTitle('');
    setSpokenTextContent('');
    setSpokenAudioFile(null);
    setSpokenAudioPreviewUrl(null);
    setSpokenImageFile(null);
    setSpokenImagePreviewUrl(null);
    setSpokenOrder(prev => prev + 1);
  };

  // Remove an item from the batch list
  const handleRemoveSpokenItem = (idx) => {
    setSpokenItems(prev => prev.filter((_, i) => i !== idx));
  };

  // Publish all items in the batch to the backend
  const handlePublishSpokenItems = async (e) => {
    e.preventDefault();
    if (spokenItems.length === 0) {
      setSpokenError('No items to publish.');
      return;
    }
    setSpokenUploading(true);
    try {
      for (const item of spokenItems) {
        const formData = new FormData();
        formData.append('section_type', item.section_type);
        formData.append('content_type', item.content_type);
        formData.append('title', item.title);
        formData.append('text_content', item.text_content);
        formData.append('order', item.order);
        formData.append('is_active', item.is_active);
        if (item.reference_audio) {
          formData.append('reference_audio', item.reference_audio);
        }
        if (item.image) {
          formData.append('image', item.image);
        }
        await adminService.createSpokenContent(formData);
      }
      setSpokenSuccess(`Successfully published ${spokenItems.length} items.`);
      setSpokenItems([]);
      loadSpokenContent();
    } catch (err) {
      setSpokenError(err.message || 'Failed to publish spoken content.');
    } finally {
      setSpokenUploading(false);
    }
  };

  const handleDeleteSpokenContent = async (id, title) => {
    if (!window.confirm(`Delete content item "${title || 'this item'}"?`)) return;
    try {
      await adminService.deleteSpokenContent(id);
      loadSpokenContent();
    } catch (err) {
      alert(err.message || 'Failed to delete content item.');
    }
  };

  // ------------------------------------------
  // Scores View Handlers
  // ------------------------------------------
  const handleViewScores = async (item, subject) => {
    setSelectedItemForScores({ ...item, subject });
    setScoresModalOpen(true);
    try {
      if (subject === 'abacus') {
        const data = await adminService.getTestScores(item.id);
        setTestScoresData(data);
      } else {
        const data = await adminService.getSpokenTopicScores(item.id);
        setTestScoresData(data);
      }
    } catch (err) {
      alert(err.message || 'Failed to load test scores.');
    }
  };

  // Teacher Scoring State
  const [scoreInputs, setScoreInputs] = useState({});
  const [scoringStatus, setScoringStatus] = useState({});

  // Open Spoken English Test Audio Review Modal
  const handleOpenSpokenTestDetail = async (attemptId) => {
    setSpokenTestDetailModalOpen(true);
    setSelectedSpokenTestDetail(null);
    setScoreInputs({});
    setScoringStatus({});
    try {
      setSpokenTestDetailLoading(true);
      const data = await adminService.getSpokenTestScoreDetail(attemptId);
      setSelectedSpokenTestDetail(data);
      // Pre-fill score inputs with existing scores
      const initialScores = {};
      if (data && data.recordings) {
        data.recordings.forEach((rec) => {
          if (rec.teacher_score !== null && rec.teacher_score !== undefined) {
            initialScores[rec.id] = rec.teacher_score;
          }
        });
      }
      setScoreInputs(initialScores);
    } catch (err) {
      alert(err.message || 'Failed to load test submission details.');
      setSpokenTestDetailModalOpen(false);
    } finally {
      setSpokenTestDetailLoading(false);
    }
  };

  const handleScoreInputChange = (recordingId, value) => {
    setScoreInputs((prev) => ({ ...prev, [recordingId]: value }));
    setScoringStatus((prev) => ({ ...prev, [recordingId]: null }));
  };

  const handleSaveScore = async (recordingId) => {
    const rawVal = scoreInputs[recordingId];
    if (rawVal === undefined || rawVal === '' || isNaN(Number(rawVal))) {
      setScoringStatus((prev) => ({
        ...prev,
        [recordingId]: { saving: false, error: 'Please enter a valid numeric score.' }
      }));
      return;
    }

    const numScore = Number(rawVal);
    if (numScore < 0 || numScore > 100) {
      setScoringStatus((prev) => ({
        ...prev,
        [recordingId]: { saving: false, error: 'Score must be between 0 and 100.' }
      }));
      return;
    }

    setScoringStatus((prev) => ({
      ...prev,
      [recordingId]: { saving: true, error: null, success: false }
    }));

    try {
      const res = await adminService.scoreTestRecording(recordingId, numScore);
      
      // Update selectedSpokenTestDetail recordings & attempt details
      setSelectedSpokenTestDetail((prev) => {
        if (!prev) return prev;
        const updatedRecordings = prev.recordings.map((r) =>
          r.id === recordingId
            ? { ...r, teacher_score: res.recording.teacher_score, scored_at: res.recording.scored_at }
            : r
        );
        return {
          ...prev,
          overall_score: res.attempt.overall_score,
          status: res.attempt.status,
          scored_recordings_count: res.attempt.scored_recordings_count,
          recordings: updatedRecordings,
        };
      });

      // Update in main table list
      setSpokenTestAttempts((prevList) =>
        prevList.map((att) =>
          att.id === selectedSpokenTestDetail?.id
            ? {
                ...att,
                overall_score: res.attempt.overall_score,
                status: res.attempt.status,
                scored_recordings_count: res.attempt.scored_recordings_count,
              }
            : att
        )
      );

      setScoringStatus((prev) => ({
        ...prev,
        [recordingId]: { saving: false, error: null, success: true }
      }));
    } catch (err) {
      setScoringStatus((prev) => ({
        ...prev,
        [recordingId]: { saving: false, error: err.message || 'Failed to save score.' }
      }));
    }
  };

  // ------------------------------------------
  // Docs Management Handlers
  // ------------------------------------------
  const handleUploadDoc = async (e) => {
    e.preventDefault();
    setDocError('');

    if (!docTitle.trim() || !docFile) {
      setDocError('Title and file are required.');
      return;
    }

    if (docFile.type !== 'application/pdf') {
      setDocError('Only PDF files are allowed.');
      return;
    }

    setDocUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', docTitle);
      formData.append('description', docDescription);
      formData.append('file', docFile);

      await adminService.uploadDocument(formData);
      setDocTitle('');
      setDocDescription('');
      setDocFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('docFileInput');
      if (fileInput) fileInput.value = '';

      loadDocs();
    } catch (err) {
      setDocError(err.message || 'Failed to upload document.');
    } finally {
      setDocUploading(false);
    }
  };

  const handleDeleteDoc = async (id, title) => {
    if (!window.confirm(`Delete document "${title}"?`)) return;
    try {
      await adminService.deleteDocument(id);
      loadDocs();
    } catch (err) {
      alert(err.message || 'Failed to delete document.');
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-[#FBFBFA] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Admin Header */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-card mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-900 shrink-0">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                Academy Admin Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight mt-1">
                JaiPriya Academy Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-light">
                Manage student profiles, upload Abacus & Spoken English lessons with audio, and evaluate test recordings.
              </p>
            </div>
          </div>
        </div>

        {/* Primary Tabs Switcher */}
        <div className="bg-slate-200/80 p-1.5 rounded-2xl flex flex-wrap gap-1 mb-8 max-w-lg">
          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'students'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-amber-700" />
            <span>Students</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-amber-700" />
            <span>Upload Content</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scores')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'scores'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-700" />
            <span>Test Scores & Audio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('docs')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'docs'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-700" />
            <span>Docs</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: STUDENTS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search name, mobile, ID..."
                    className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                  />
                </div>

                <select
                  value={selectedLevelFilter}
                  onChange={(e) => setSelectedLevelFilter(e.target.value)}
                  className="w-full sm:w-48 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:bg-white focus:border-amber-500"
                >
                  <option value="">All Abacus Levels</option>
                  {ABACUS_LEVELS.map((lvl) => (
                    <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleOpenAddStudent}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Student</span>
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl shadow-card overflow-hidden">
              {studentsLoading ? (
                <div className="py-16 text-center text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-2" />
                  <span className="text-xs font-medium">Loading students list...</span>
                </div>
              ) : students.length === 0 ? (
                <div className="py-16 text-center text-slate-500">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-800">No students found.</p>
                  <p className="text-xs text-slate-500 mt-1">Click "+ Add Student" to register a new student.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] tracking-wider">
                      <tr>
                        <th className="px-5 py-3.5 font-semibold">Student Name</th>
                        <th className="px-5 py-3.5 font-semibold">Mobile (Login)</th>
                        <th className="px-5 py-3.5 font-semibold">Abacus Level</th>
                        <th className="px-5 py-3.5 font-semibold">Standard / Class</th>
                        <th className="px-5 py-3.5 font-semibold">Student ID</th>
                        <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {students.map((st) => (
                        <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-4 font-semibold text-slate-900">
                            <button
                              type="button"
                              onClick={() => handleOpenEditStudent(st)}
                              className="text-left font-semibold text-slate-900 hover:text-amber-800 hover:underline transition-colors focus:outline-none"
                            >
                              {st.full_name}
                            </button>
                            {st.parent_name && (
                              <span className="block text-[11px] text-slate-400 font-normal">
                                Parent: {st.parent_name}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 font-mono font-medium text-slate-800">
                            {st.mobile_number || st.phone_number || '—'}
                          </td>
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              {st.abacus_level_display || st.abacus_level}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {st.standard || '—'}
                          </td>
                          <td className="px-5 py-4 font-mono text-xs text-slate-500">
                            {st.student_id || '—'}
                          </td>
                          <td className="px-5 py-4 text-right space-x-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditStudent(st)}
                              className="p-1.5 text-slate-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Edit Student"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStudent(st.id, st.full_name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Student"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: UPLOAD QUESTIONS & SPOKEN CONTENT */}
        {/* ========================================================================= */}
        {activeTab === 'upload' && (
          <div className="space-y-8">
            
            {/* Subject Selector Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-card max-w-4xl mx-auto">
              <div className="mb-6 pb-4 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">
                  Upload & Publish Learning Content
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-light mt-0.5">
                  Choose a subject to upload timed Abacus math tests or Spoken English theory, practice, and test recordings.
                </p>

                {/* Subject Switcher Buttons */}
                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setUploadSubject('abacus')}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl border text-xs font-bold transition-all ${
                      uploadSubject === 'abacus'
                        ? 'border-amber-500 bg-amber-50/80 text-amber-900 ring-2 ring-amber-200 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Calculator className="w-4 h-4 text-amber-800" />
                    <span>Abacus Mental Math Tests</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUploadSubject('spoken-english')}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl border text-xs font-bold transition-all ${
                      uploadSubject === 'spoken-english'
                        ? 'border-blue-500 bg-blue-50/80 text-blue-900 ring-2 ring-blue-200 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-blue-800" />
                    <span>Spoken English (Theory, Practice, Tests)</span>
                  </button>
                </div>
              </div>

              {/* A) ABACUS UPLOAD FORM */}
              {uploadSubject === 'abacus' && (
                <div>
                  {publishSuccess && (
                    <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{publishSuccess}</span>
                    </div>
                  )}

                  {publishError && (
                    <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{publishError}</span>
                    </div>
                  )}

                  <form onSubmit={handlePublishTest} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                          Select Abacus Level <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={uploadLevel}
                          onChange={(e) => {
                            setUploadLevel(e.target.value);
                            setTestTitle(`Week 1 Abacus - ${e.target.value}`);
                          }}
                          className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-amber-500"
                        >
                          {ABACUS_LEVELS.map((lvl) => (
                            <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                          Test Title <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={testTitle}
                          onChange={(e) => setTestTitle(e.target.value)}
                          placeholder="e.g. Week 1 Abacus - Level 3"
                          className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                          Duration (Minutes)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={testDuration}
                          onChange={(e) => setTestDuration(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                        <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                          Add Multiple Choice Questions ({questionsList.length} Questions)
                        </label>
                        <button
                          type="button"
                          onClick={handleAddQuestion}
                          className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Question</span>
                        </button>
                      </div>

                      <div className="space-y-6">
                        {questionsList.map((q, idx) => (
                          <div key={idx} className="p-4 sm:p-5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-800">
                                Question {idx + 1}
                              </span>
                              {questionsList.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveQuestion(idx)}
                                  className="text-slate-400 hover:text-rose-600 text-xs font-medium"
                                >
                                  Remove
                                </button>
                              )}
                            </div>

                            <input
                              type="text"
                              value={q.question_text}
                              onChange={(e) => handleQuestionChange(idx, 'question_text', e.target.value)}
                              placeholder="Enter question prompt"
                              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white"
                            />

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                              <div>
                                <label className="text-[11px] text-slate-500 font-medium block mb-1">Option A</label>
                                <input
                                  type="text"
                                  value={q.option_a}
                                  onChange={(e) => handleQuestionChange(idx, 'option_a', e.target.value)}
                                  placeholder="Option A"
                                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] text-slate-500 font-medium block mb-1">Option B</label>
                                <input
                                  type="text"
                                  value={q.option_b}
                                  onChange={(e) => handleQuestionChange(idx, 'option_b', e.target.value)}
                                  placeholder="Option B"
                                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] text-slate-500 font-medium block mb-1">Option C</label>
                                <input
                                  type="text"
                                  value={q.option_c}
                                  onChange={(e) => handleQuestionChange(idx, 'option_c', e.target.value)}
                                  placeholder="Option C"
                                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] text-slate-500 font-medium block mb-1">Option D</label>
                                <input
                                  type="text"
                                  value={q.option_d}
                                  onChange={(e) => handleQuestionChange(idx, 'option_d', e.target.value)}
                                  placeholder="Option D"
                                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-3 pt-1">
                              <label className="text-xs font-semibold text-emerald-800">
                                Correct Answer:
                              </label>
                              <select
                                value={q.correct_option}
                                onChange={(e) => handleQuestionChange(idx, 'correct_option', e.target.value)}
                                className="px-3 py-1 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-900 text-xs font-bold"
                              >
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 flex justify-end">
                      <button
                        type="submit"
                        disabled={publishing}
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all"
                      >
                        {publishing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                            <span>Publishing Test...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 text-amber-400" />
                            <span>Publish Abacus Test</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* B) SPOKEN ENGLISH CONTENT UPLOAD (Batch 6) */}
              {uploadSubject === 'spoken-english' && (
                <div className="mt-8">
                  <AdminSpokenBatchManager />
                </div>
              )}

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: TEST SCORES & AUDIO INSPECTION */}
        {/* ========================================================================= */}
        {activeTab === 'scores' && (
          <div className="space-y-6">
            
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-card">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">
                    Student Assessment Scores & Voice Recordings
                  </h2>
                  <p className="text-xs text-slate-500 font-light">
                    Select a section to review student test submissions, examine scores, and listen to voice recordings.
                  </p>
                </div>

                {/* Scores Subject Selector */}
                <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setScoresSubject('abacus')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      scoresSubject === 'abacus'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Abacus Tests
                  </button>

                  <button
                    type="button"
                    onClick={() => setScoresSubject('spoken-tests')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      scoresSubject === 'spoken-tests'
                        ? 'bg-white text-blue-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Spoken English Tests (Audio)
                  </button>

                  <button
                    type="button"
                    onClick={() => setScoresSubject('spoken-practice')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      scoresSubject === 'spoken-practice'
                        ? 'bg-white text-amber-950 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Student Practice Recordings
                  </button>

                  <button
                    type="button"
                    onClick={() => setScoresSubject('spoken-legacy')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      scoresSubject === 'spoken-legacy'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Legacy MCQ Topics
                  </button>
                </div>
              </div>
            </div>

            {scoresLoading ? (
              <div className="py-16 text-center text-slate-500 bg-white border border-slate-200 rounded-3xl">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-2" />
                <span className="text-xs font-medium">Loading scores catalog...</span>
              </div>
            ) : scoresSubject === 'abacus' ? (
              /* 1. Abacus Tests Grid */
              adminTests.length === 0 ? (
                <div className="py-16 text-center text-slate-500 bg-white border border-slate-200 rounded-3xl">
                  <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-800">No Abacus tests published yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {adminTests.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white border border-slate-200 rounded-3xl p-6 shadow-card hover:shadow-soft-lg transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            {t.level_display}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            {t.duration_minutes} Mins
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 mb-2">
                          {t.title}
                        </h3>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-6">
                          <span>{t.questions_count} Questions</span>
                          <span>•</span>
                          <span className="font-semibold text-emerald-700">
                            {t.attempts_count} Submissions
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleViewScores(t, 'abacus')}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-700" />
                        <span>View Scores ({t.attempts_count})</span>
                      </button>
                    </div>
                  ))}
                </div>
              )
            ) : scoresSubject === 'spoken-tests' ? (
              /* 2. Modern Spoken English Tests Submissions Table */
              spokenTestAttempts.length === 0 ? (
                <div className="py-16 text-center text-slate-500 bg-white border border-slate-200 rounded-3xl">
                  <Mic className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-800">No test submissions yet.</p>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-3xl shadow-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-5 py-3.5 font-semibold">Student Name</th>
                          <th className="px-5 py-3.5 font-semibold">Mobile (Login)</th>
                          <th className="px-5 py-3.5 font-semibold">Test Category</th>
                          <th className="px-5 py-3.5 font-semibold">Recordings</th>
                          <th className="px-5 py-3.5 font-semibold">Evaluation Status</th>
                          <th className="px-5 py-3.5 font-semibold">Submitted At</th>
                          <th className="px-5 py-3.5 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {spokenTestAttempts.map((att) => {
                          const isScored = att.status === 'SCORED' && att.overall_score !== null;
                          const isPartiallyScored = att.status === 'PARTIALLY_SCORED';

                          return (
                            <tr key={att.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="px-5 py-4 font-semibold text-slate-900">
                                {att.student_name}
                              </td>
                              <td className="px-5 py-4 font-mono text-slate-800">
                                {att.student_mobile || '—'}
                              </td>
                              <td className="px-5 py-4">
                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                                  {att.content_type}
                                </span>
                              </td>
                              <td className="px-5 py-4 font-medium text-emerald-800">
                                {att.recorded_items} / {att.total_items} recorded
                              </td>
                              <td className="px-5 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                  isScored
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : isPartiallyScored
                                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                                }`}>
                                  {isScored
                                    ? `Score: ${att.overall_score} / 100`
                                    : isPartiallyScored
                                    ? `Partially Scored (${att.scored_recordings_count || 0}/${att.total_items})`
                                    : 'Pending Review'}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-xs font-mono text-slate-500">
                                {att.submitted_at ? new Date(att.submitted_at).toLocaleString() : 'In Progress'}
                              </td>
                              <td className="px-5 py-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleOpenSpokenTestDetail(att.id)}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
                                >
                                  <Headphones className="w-3.5 h-3.5 text-amber-300" />
                                  <span>Review & Score ({att.recordings_count || att.recorded_items} Audio)</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            ) : scoresSubject === 'spoken-practice' ? (
              /* 3. Modern Spoken English Self-Practice History */
              spokenPracticeHistory.length === 0 ? (
                <div className="py-16 text-center text-slate-500 bg-white border border-slate-200 rounded-3xl">
                  <Headphones className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-800">No student self-practice recordings recorded yet.</p>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-3xl shadow-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-5 py-3.5 font-semibold">Student Name</th>
                          <th className="px-5 py-3.5 font-semibold">Mobile</th>
                          <th className="px-5 py-3.5 font-semibold">Content Title / Type</th>
                          <th className="px-5 py-3.5 font-semibold">Student Recording</th>
                          <th className="px-5 py-3.5 font-semibold">Submitted Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {spokenPracticeHistory.map((pr) => (
                          <tr key={pr.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-5 py-4 font-semibold text-slate-900">
                              {pr.student_name}
                            </td>
                            <td className="px-5 py-4 font-mono text-slate-800">
                              {pr.student_mobile || '—'}
                            </td>
                            <td className="px-5 py-4">
                              <span className="font-bold text-slate-900 block">{pr.content_title || 'Practice Item'}</span>
                              <span className="text-[11px] text-slate-400 font-mono">{pr.content_type}</span>
                            </td>
                            <td className="px-5 py-4">
                              {pr.audio_url ? (
                                <div className="w-64">
                                  <AudioPlayer src={pr.audio_url} title={`Practice Audio - ${pr.student_name}`} />
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 italic">No audio recorded</span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-xs font-mono text-slate-500">
                              {pr.submitted_at ? new Date(pr.submitted_at).toLocaleString() : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            ) : (
              /* 4. Legacy Spoken English Topics Grid */
              adminSpokenTopics.length === 0 ? (
                <div className="py-16 text-center text-slate-500 bg-white border border-slate-200 rounded-3xl">
                  <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-800">No Spoken English topics published yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {adminSpokenTopics.map((top) => (
                    <div
                      key={top.id}
                      className="bg-white border border-slate-200 rounded-3xl p-6 shadow-card hover:shadow-soft-lg transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                            Topic {top.order || 1}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {top.is_active ? 'Published' : 'Draft'}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 mb-2">
                          {top.title}
                        </h3>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-6">
                          <span>{top.theory_count} Theory Sections</span>
                          <span>•</span>
                          <span>{top.questions_count} MCQs</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleViewScores(top, 'spoken-english')}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-semibold text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-700" />
                        <span>View Topic Scores</span>
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* ADD / EDIT STUDENT MODAL */}
        {/* ========================================================================= */}
        {studentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 my-8 relative">
              <button
                type="button"
                onClick={() => setStudentModalOpen(false)}
                className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingStudent ? 'Edit Student Details' : 'Add New Student'}
                  </h3>
                  <p className="text-xs text-slate-500 font-light">
                    Students will be able to log in using only their mobile number.
                  </p>
                </div>
              </div>

              {studentFormError && (
                <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{studentFormError}</span>
                </div>
              )}

              <form onSubmit={handleSaveStudent} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={studentFormData.full_name}
                    onChange={(e) => setStudentFormData({ ...studentFormData, full_name: e.target.value })}
                    placeholder="e.g. Ananya Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Mobile Number (Login ID) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={studentFormData.mobile_number}
                      onChange={(e) => setStudentFormData({ ...studentFormData, mobile_number: e.target.value })}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Standard / Class <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={studentFormData.standard}
                      onChange={(e) => setStudentFormData({ ...studentFormData, standard: e.target.value })}
                      placeholder="e.g. Class 4"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Abacus Level <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={studentFormData.abacus_level}
                      onChange={(e) => setStudentFormData({ ...studentFormData, abacus_level: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-amber-500 font-medium"
                    >
                      {ABACUS_LEVELS.map((lvl) => (
                        <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={studentFormData.date_of_birth}
                      onChange={(e) => setStudentFormData({ ...studentFormData, date_of_birth: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1 text-xs">
                      Parent / Guardian Name
                    </label>
                    <input
                      type="text"
                      value={studentFormData.parent_name}
                      onChange={(e) => setStudentFormData({ ...studentFormData, parent_name: e.target.value })}
                      placeholder="e.g. Ramesh Sharma"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-600 mb-1 text-xs">
                      School Name
                    </label>
                    <input
                      type="text"
                      value={studentFormData.school_name}
                      onChange={(e) => setStudentFormData({ ...studentFormData, school_name: e.target.value })}
                      placeholder="e.g. DPS"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStudentModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={studentFormSubmitting}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs"
                  >
                    {studentFormSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>{editingStudent ? 'Update Student' : 'Save & Activate'}</span>
                    )}
                  </button>
                </div>
              </form>

              {editingStudent && (
                <div className="mt-8 border-t border-slate-200 pt-6">
                  <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-blue-600" />
                    Spoken English Test History
                  </h4>
                  
                  {studentSpokenHistoryLoading ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                    </div>
                  ) : !studentSpokenHistory?.test_history?.length ? (
                    <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                      No test history found for this student.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                      {studentSpokenHistory.test_history.map(attempt => (
                        <div key={attempt.id} className="p-3 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-slate-800 text-xs mb-1">{attempt.module_title || 'Module'}</div>
                            <div className="text-[10px] text-slate-500">
                              {new Date(attempt.started_at).toLocaleDateString()} • {attempt.status}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {attempt.overall_score !== null ? (
                              <div className="text-xs font-bold text-emerald-600">{attempt.overall_score}%</div>
                            ) : (
                              <div className="text-xs text-amber-600">Pending</div>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setStudentModalOpen(false);
                                setActiveTab('scores');
                                setScoresSubject('spoken-tests');
                                setTimeout(() => handleOpenSpokenTestDetail(attempt.id), 500);
                              }}
                              className="px-2.5 py-1 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-700 hover:bg-slate-100"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: DOCS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'docs' && (
          <div className="space-y-8">
            {/* Upload PDF Section */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-900">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Upload Student Document (PDF)</h2>
                  <p className="text-xs text-slate-500 font-light">
                    Upload worksheets, syllabus guides, or study materials for students. Only PDF files (max 10MB) are supported.
                  </p>
                </div>
              </div>

              {docError && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm mb-6">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                  <span>{docError}</span>
                </div>
              )}

              <form onSubmit={handleUploadDoc} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Document Title *
                    </label>
                    <input
                      type="text"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      placeholder="e.g. Level 1 Practice Worksheet"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      PDF File * (Max 10MB)
                    </label>
                    <input
                      id="docFileInput"
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => setDocFile(e.target.files[0])}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={docDescription}
                    onChange={(e) => setDocDescription(e.target.value)}
                    placeholder="Brief description or instructions for students..."
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={docUploading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
                  >
                    {docUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>Upload Document</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Document Catalog */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-card">
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-200">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Uploaded Documents</h3>
                  <p className="text-xs text-slate-500 font-light">All active documents available to enrolled students.</p>
                </div>
                <span className="text-xs font-mono px-3 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                  {adminDocs.length} {adminDocs.length === 1 ? 'Document' : 'Documents'}
                </span>
              </div>

              {adminDocsLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                  <span className="text-xs font-medium">Loading documents...</span>
                </div>
              ) : adminDocs.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">No documents uploaded yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Upload a PDF file using the form above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {adminDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:border-amber-300 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
                            <FileText className="w-5 h-5" />
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mb-1">{doc.title}</h4>
                        {doc.description && (
                          <p className="text-xs text-slate-500 mb-4 line-clamp-2">{doc.description}</p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
                        {doc.file_url ? (
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-900"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View PDF</span>
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">No file</span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(doc.id, doc.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW ABACUS / LEGACY SCORES MODAL */}
        {/* ========================================================================= */}
        {scoresModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl border border-slate-200 my-8 relative max-h-[90vh] flex flex-col">
              <button
                type="button"
                onClick={() => {
                  setScoresModalOpen(false);
                  setTestScoresData(null);
                }}
                className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-4 pb-4 border-b border-slate-200">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  {selectedItemForScores?.subject === 'abacus' ? 'Abacus Test Scores' : 'Spoken English Topic Scores'}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {selectedItemForScores?.title} — Student Scores
                </h3>
                <p className="text-xs text-slate-500 font-light">
                  All submitted student attempts and score evaluations.
                </p>
              </div>

              {/* Scores List */}
              <div className="overflow-y-auto flex-1">
                {!testScoresData ? (
                  <div className="py-16 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-2" />
                    <span className="text-xs font-medium">Fetching scores...</span>
                  </div>
                ) : testScoresData.scores.length === 0 ? (
                  <div className="py-16 text-center text-slate-500">
                    <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-800">No students have submitted this assessment yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Student Name</th>
                          <th className="px-4 py-3 font-semibold">Mobile Number</th>
                          <th className="px-4 py-3 font-semibold">Score / Marks</th>
                          <th className="px-4 py-3 font-semibold">Correct</th>
                          <th className="px-4 py-3 font-semibold">Incorrect</th>
                          <th className="px-4 py-3 font-semibold">Skipped</th>
                          <th className="px-4 py-3 font-semibold">Submission Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {testScoresData.scores.map((sc) => (
                          <tr key={sc.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-semibold text-slate-900">
                              {sc.student_name}
                              <span className="block text-[11px] text-slate-400 font-mono">
                                {sc.student_id}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono font-medium">
                              {sc.student_mobile}
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-950 font-serif">
                                {sc.score_display}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-bold text-emerald-700">
                              {sc.correct_answers}
                            </td>
                            <td className="px-4 py-3 font-bold text-rose-600">
                              {sc.incorrect_answers}
                            </td>
                            <td className="px-4 py-3 text-slate-500">
                              {sc.skipped_questions}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                              {sc.submitted_at ? new Date(sc.submitted_at).toLocaleString() : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 text-right">
                <button
                  type="button"
                  onClick={() => {
                    setScoresModalOpen(false);
                    setTestScoresData(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SPOKEN ENGLISH TEST AUDIO RECORDINGS REVIEW MODAL (Batch 6) */}
        {/* ========================================================================= */}
        {spokenTestDetailModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl border border-slate-200 my-8 relative max-h-[90vh] flex flex-col">
              <button
                type="button"
                onClick={() => {
                  setSpokenTestDetailModalOpen(false);
                  setSelectedSpokenTestDetail(null);
                }}
                className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-4 pb-4 border-b border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                    Spoken English Voice Assessment Review
                  </span>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    selectedSpokenTestDetail?.status === 'SCORED'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : selectedSpokenTestDetail?.status === 'PARTIALLY_SCORED'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {selectedSpokenTestDetail?.status === 'SCORED'
                      ? `Graded • Overall Score: ${selectedSpokenTestDetail.overall_score} / 100`
                      : selectedSpokenTestDetail?.status === 'PARTIALLY_SCORED'
                      ? `In Progress (${selectedSpokenTestDetail.scored_recordings_count || 0}/${selectedSpokenTestDetail.total_items || selectedSpokenTestDetail.recordings?.length || 0} Scored)`
                      : 'Pending Evaluation'}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  {selectedSpokenTestDetail?.student_name} — Test Evaluation
                </h3>
                <p className="text-xs text-slate-500 font-light mt-0.5">
                  Mobile: <strong className="font-mono text-slate-700">{selectedSpokenTestDetail?.student_mobile || '—'}</strong> • Category: <strong className="text-slate-700">{selectedSpokenTestDetail?.content_type}</strong>
                </p>
              </div>

              {/* Overall Score Status Banner */}
              {selectedSpokenTestDetail && (
                <div className="mb-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">
                      Teacher Grading Progress:
                    </span>
                    <span className="text-xs text-slate-500">
                      {selectedSpokenTestDetail.scored_recordings_count || 0} of {selectedSpokenTestDetail.total_items || selectedSpokenTestDetail.recordings?.length || 0} questions graded (0–100 scale)
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-semibold uppercase text-slate-400 block">
                      Overall Calculated Score
                    </span>
                    <span className="text-lg font-bold text-slate-900 font-mono">
                      {selectedSpokenTestDetail.overall_score !== null && selectedSpokenTestDetail.overall_score !== undefined
                        ? `${selectedSpokenTestDetail.overall_score} / 100`
                        : 'Pending (Grade all questions)'}
                    </span>
                  </div>
                </div>
              )}

              {/* Recordings List */}
              <div className="overflow-y-auto flex-1 space-y-4 pr-1">
                {spokenTestDetailLoading || !selectedSpokenTestDetail ? (
                  <div className="py-16 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                    <span className="text-xs font-medium">Loading audio recordings...</span>
                  </div>
                ) : selectedSpokenTestDetail.recordings?.length === 0 ? (
                  <div className="py-16 text-center text-slate-500">
                    <Mic className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-800">No recordings captured in this test attempt.</p>
                  </div>
                ) : (
                  selectedSpokenTestDetail.recordings.map((rec, idx) => {
                    const statusObj = scoringStatus[rec.id];
                    const isSaving = statusObj?.saving;
                    const isSuccess = statusObj?.success;
                    const error = statusObj?.error;

                    return (
                      <div
                        key={rec.id || idx}
                        className="p-5 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center font-mono">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-900">
                              {rec.content_item_title || `Question ${idx + 1}`}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200 uppercase">
                              {rec.content_item_type}
                            </span>
                            {rec.teacher_score !== null && rec.teacher_score !== undefined ? (
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                                Current Score: {rec.teacher_score} / 100
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                                Ungraded
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Prompt */}
                        <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                          <span className="text-[11px] text-slate-400 font-medium block mb-0.5">Prompt Text:</span>
                          <p className="text-sm font-serif font-bold text-slate-900">
                            "{rec.content_item_text}"
                          </p>
                        </div>

                        {/* Audio Player */}
                        {rec.audio_url ? (
                          <div>
                            <span className="text-[11px] font-semibold text-slate-600 block mb-1">Student Audio Playback:</span>
                            <AudioPlayer src={rec.audio_url} title={`Student Recording - Q${idx + 1}`} />
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No audio recorded for this question.</span>
                        )}

                        {/* Teacher Manual Scoring Section (0–100) */}
                        <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <label className="text-xs font-bold text-slate-800 shrink-0">
                              Teacher Score (0–100):
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              value={scoreInputs[rec.id] !== undefined ? scoreInputs[rec.id] : (rec.teacher_score ?? '')}
                              onChange={(e) => handleScoreInputChange(rec.id, e.target.value)}
                              placeholder="0 - 100"
                              className="w-24 px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveScore(rec.id)}
                              disabled={isSaving}
                              className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-all flex items-center gap-1.5"
                            >
                              {isSaving ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                                  <span>Saving...</span>
                                </>
                              ) : (
                                <span>Save Score</span>
                              )}
                            </button>
                          </div>

                          <div className="text-right">
                            {isSuccess && (
                              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>✓ Score saved ({rec.teacher_score}/100)</span>
                              </span>
                            )}
                            {error && (
                              <span className="text-xs font-medium text-rose-600 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>{error}</span>
                              </span>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 text-right">
                <button
                  type="button"
                  onClick={() => {
                    setSpokenTestDetailModalOpen(false);
                    setSelectedSpokenTestDetail(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs"
                >
                  Close Review
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
