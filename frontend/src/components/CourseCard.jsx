import React from 'react';
import { Link } from 'react-router-dom';
import { 
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
  ArrowRight,
  Image as ImageIcon
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

export default function CourseCard({ course }) {
  const IconComponent = iconMap[course.iconName] || Sparkles;
  const isEarlyChildhood = course.categorySlug === 'early-childhood';

  return (
    <div className="group bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-card hover:shadow-soft-lg hover:border-amber-300/80 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Image Area: Displays real image if provided, otherwise clean placeholder */}
        <div className="relative w-full h-36 sm:h-40 rounded-xl bg-gradient-to-br from-slate-100 via-slate-50 to-amber-50/40 border border-slate-200/80 overflow-hidden mb-5 group-hover:border-amber-200 transition-colors flex flex-col items-center justify-center">
          {course.imageUrl ? (
            <img 
              src={course.imageUrl} 
              alt={course.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
              <div className="w-11 h-11 rounded-xl bg-white/90 shadow-xs border border-slate-200/60 flex items-center justify-center text-slate-700 mb-2 group-hover:scale-110 transition-transform duration-300">
                <IconComponent className="w-5 h-5 text-amber-700" />
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono tracking-tight text-slate-500 bg-white/80 px-2.5 py-0.5 rounded-full border border-slate-200/50">
                <ImageIcon className="w-3 h-3 text-slate-400" />
                <span>[Image: {course.title}]</span>
              </div>
            </div>
          )}
        </div>

        {/* Header & Badges */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight group-hover:text-amber-900 transition-colors">
            {course.title}
          </h3>
          <span 
            className={`text-[11px] font-medium px-2.5 py-0.5 rounded-md whitespace-nowrap shrink-0 border ${
              isEarlyChildhood 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200/60' 
                : 'bg-amber-50 text-amber-800 border-amber-200/60'
            }`}
          >
            {isEarlyChildhood ? 'Early Years' : 'Skill Course'}
          </span>
        </div>

        <p className="text-xs font-semibold text-amber-800/80 mb-2.5">
          {course.tagline}
        </p>

        {/* Short Description */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
          {course.shortDescription}
        </p>
      </div>

      {/* Action Footer */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-medium">
          Comprehensive Program
        </span>
        <Link
          to={`/courses/${course.id}`}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-900 hover:text-amber-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-md py-1 px-1.5"
          aria-label={`Explore ${course.title} program`}
        >
          <span>Explore Program</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
