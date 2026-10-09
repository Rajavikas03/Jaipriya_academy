import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { skillDevelopmentCourses, earlyChildhoodPrograms } from '../data/offeringsData';
import CourseCard from './CourseCard';
import { BookOpen, Baby, ArrowRight } from 'lucide-react';

export default function Offerings() {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'skills' | 'early'

  return (
    <section id="courses" className="py-20 md:py-28 bg-[#FBFBFA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-slate-100 text-slate-700 border border-slate-200 mb-3">
            What We Offer
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
            Comprehensive Programs for Every Stage
          </h2>
          <p className="mt-3 text-base text-slate-600 font-light">
            Explore our specialized skill development courses and early childhood education tracks.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8 p-1.5 bg-slate-200/60 rounded-2xl max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex-1 min-w-[90px] py-2 px-3 text-xs sm:text-sm font-medium rounded-xl transition-all duration-200 ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              All Programs
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('skills')}
              className={`flex-1 min-w-[120px] py-2 px-3 text-xs sm:text-sm font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
                activeTab === 'skills'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Skill Development
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('early')}
              className={`flex-1 min-w-[120px] py-2 px-3 text-xs sm:text-sm font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
                activeTab === 'early'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Baby className="w-3.5 h-3.5" />
              Early Childhood
            </button>
          </div>
        </div>

        {/* CATEGORY 1: SKILL DEVELOPMENT COURSES */}
        {(activeTab === 'all' || activeTab === 'skills') && (
          <div className="mb-16">
            <div className="flex items-center justify-between gap-3 mb-6 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100/70 text-amber-800">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
                    Skill Development Courses
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    9 enrichment courses designed to build confidence, calculation skills, and creative discipline.
                  </p>
                </div>
              </div>
              <Link 
                to="/courses"
                className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-amber-900 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/60"
              >
                View Details <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {skillDevelopmentCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        )}

        {/* CATEGORY 2: EARLY CHILDHOOD EDUCATION */}
        {(activeTab === 'all' || activeTab === 'early') && (
          <div>
            <div className="flex items-center justify-between gap-3 mb-6 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100/70 text-emerald-800">
                  <Baby className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
                    Early Childhood Programs
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    6 foundational learning stages fostering curiosity, social play, and primary school readiness.
                  </p>
                </div>
              </div>
              <Link 
                to="/courses"
                className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-emerald-900 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/60"
              >
                View Details <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {earlyChildhoodPrograms.map((program) => (
                <CourseCard key={program.id} course={program} />
              ))}
            </div>
          </div>
        )}

        {/* Bottom Navigation Prompt */}
        <div className="mt-14 text-center">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-800 font-semibold text-sm shadow-xs hover:border-amber-300 hover:bg-amber-50/40 transition-all"
          >
            <span>Explore All 15 Programs in Detail</span>
            <ArrowRight className="w-4 h-4 text-amber-700" />
          </Link>
        </div>

      </div>
    </section>
  );
}
