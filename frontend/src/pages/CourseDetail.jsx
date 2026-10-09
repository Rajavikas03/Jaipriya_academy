import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCourseById } from '../data/offeringsData';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  Image as ImageIcon,
  MessageSquare,
  Calculator,
  Volume2,
  Palette,
  Music,
  Heart,
  Trophy,
  Smile,
  Home,
  Shapes,
  GraduationCap,
  Award,
  ArrowRight,
  Info
} from 'lucide-react';

const iconMap = {
  Calculator,
  MessageSquare,
  Volume2,
  Palette,
  BookOpen,
  Music,
  Sparkles,
  Heart,
  Trophy,
  Smile,
  Home,
  Users,
  Shapes,
  GraduationCap,
  Award,
};

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const course = getCourseById(courseId);

  if (!course) {
    return (
      <div className="py-24 bg-[#FBFBFA] min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-white border border-slate-200 rounded-2xl p-8 shadow-card">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-800 mb-4">
            <Info className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">
            Program Not Found
          </h2>
          <p className="text-sm text-slate-600 mb-6 font-light">
            We couldn't find a program matching "{courseId}". Please check our full list of offerings.
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Courses</span>
          </Link>
        </div>
      </div>
    );
  }

  const IconComponent = iconMap[course.iconName] || Sparkles;
  const isEarlyChildhood = course.categorySlug === 'early-childhood';

  return (
    <div className="py-10 sm:py-16 md:py-20 bg-[#FBFBFA]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb / Back Link */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80 px-3.5 py-2 rounded-xl shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-amber-700" />
            <span>Back to Courses</span>
          </Link>

          <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
            {course.category} / {course.title}
          </span>
        </div>

        {/* Hero Card & Large Image Placeholder */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 md:p-10 shadow-card mb-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Header Content */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span 
                  className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                    isEarlyChildhood 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {course.category}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  JaiPriya Academy Program
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight">
                {course.title}
              </h1>

              <p className="text-sm sm:text-base font-medium text-amber-800">
                {course.tagline}
              </p>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-light">
                {course.longDescription}
              </p>
            </div>

            {/* Right Large Image Placeholder Frame */}
            <div className="lg:col-span-5">
              <div className="w-full h-56 sm:h-64 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-amber-100/40 border border-slate-200 overflow-hidden flex flex-col items-center justify-center text-center shadow-xs">
                {course.imageUrl ? (
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="p-6 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-amber-800 mb-3">
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-700 bg-white/90 px-3 py-1 rounded-full border border-slate-200 shadow-xs mb-1">
                      <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span>[Image: {course.title}]</span>
                    </div>
                    <p className="text-[11px] text-slate-400 max-w-[200px]">
                      Add image in /public/images/courses/{course.id}.jpg
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Structured Program Placeholders Grid (No Invented Stats or Fees) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* Age Group Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Recommended Age Group
            </h3>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs font-mono text-slate-700 mt-2">
              {course.suggestedAgePlaceholder}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-light">
              Age eligibility confirmed during counseling.
            </p>
          </div>

          {/* Schedule Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-800 mb-4">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Batch & Schedule Info
            </h3>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs font-mono text-slate-700 mt-2">
              {course.schedulePlaceholder}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-light">
              Timings configured per student enrollment batch.
            </p>
          </div>

          {/* Detailed Content / Curriculum Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Learning Focus & Modules
            </h3>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs font-mono text-slate-700 mt-2">
              {course.curriculumPlaceholder}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-light">
              Comprehensive syllabus shared upon inquiry.
            </p>
          </div>

        </div>

        {/* Detailed Academy Information Placeholder Note */}
        <div className="bg-amber-50/70 border border-dashed border-amber-300 rounded-2xl p-6 sm:p-8 mb-10 text-amber-950">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-xl bg-amber-200/80 text-amber-900 shrink-0 mt-0.5">
              <Info className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold">
                [Academy Detailed Content Placeholder: {course.title}]
              </h3>
              <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed font-light">
                Official syllabus breakdown, required course materials, mentor profiles, batch sizes, and term fee structures will be inserted here when provided by the administration.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section - Navigates to Contact page with pre-selected program */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-soft-lg text-center relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-52 h-52 rounded-full bg-amber-500/20 blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-400/10 text-amber-300 border border-amber-400/20">
              <Sparkles className="w-3.5 h-3.5" />
              Enrollment & Inquiries
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Interested in {course.title}?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
              Reach out to our academy counselors to inquire about upcoming batches, trial sessions, and program schedules.
            </p>
            <div className="pt-2">
              <Link
                to={`/contact?program=${encodeURIComponent(course.id)}`}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm shadow-sm transition-all transform hover:-translate-y-0.5"
              >
                <span>Contact Us to Learn More</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

