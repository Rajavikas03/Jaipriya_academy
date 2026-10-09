import React, { useState } from 'react';
import { skillDevelopmentCourses, earlyChildhoodPrograms } from '../data/offeringsData';
import CourseCard from '../components/CourseCard';
import { BookOpen, Baby, Search, Sparkles, Filter } from 'lucide-react';

export default function Courses() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filterList = (list) => {
    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase();
    return list.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.shortDescription.toLowerCase().includes(query) ||
        item.tagline.toLowerCase().includes(query)
    );
  };

  const filteredSkills = filterList(skillDevelopmentCourses);
  const filteredEarlyChildhood = filterList(earlyChildhoodPrograms);

  const totalResults = 
    (selectedCategory === 'all' || selectedCategory === 'skills' ? filteredSkills.length : 0) +
    (selectedCategory === 'all' || selectedCategory === 'early' ? filteredEarlyChildhood.length : 0);

  return (
    <div className="py-12 sm:py-16 md:py-20 bg-[#FBFBFA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Hero */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-amber-50 text-amber-800 border border-amber-200/70 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Academy Curriculum
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-slate-900 tracking-tight">
            OUR PROGRAMS
          </h1>
          <p className="mt-4 text-base sm:text-lg md:text-xl text-slate-600 font-light leading-relaxed">
            Learning experiences designed to help children explore, develop and grow.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-card mb-12 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-slate-100/80 rounded-xl w-full md:w-auto">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                selectedCategory === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All (15)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('skills')}
              className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                selectedCategory === 'skills'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Skill Development (9)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('early')}
              className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                selectedCategory === 'early'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Baby className="w-3.5 h-3.5" />
              Early Childhood (6)
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search programs (e.g., Abacus, Drawing)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            />
          </div>

        </div>

        {/* No Search Results */}
        {totalResults === 0 && (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-card my-8 p-6">
            <Filter className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No programs found</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              No matching courses found for "{searchQuery}". Try searching with a different term or clear the filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* SECTION 1: SKILL DEVELOPMENT */}
        {(selectedCategory === 'all' || selectedCategory === 'skills') && filteredSkills.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-200">
              <div className="p-2.5 rounded-xl bg-amber-100/80 text-amber-800 border border-amber-200/60">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
                  Skill Development
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Focused extracurricular and academic enrichment courses designed for school-age students.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSkills.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        )}

        {/* SECTION 2: EARLY CHILDHOOD EDUCATION */}
        {(selectedCategory === 'all' || selectedCategory === 'early') && filteredEarlyChildhood.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-200">
              <div className="p-2.5 rounded-xl bg-emerald-100/80 text-emerald-800 border border-emerald-200/60">
                <Baby className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
                  Early Childhood Education
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Nurturing playgroup, daycare, and kindergarten programs for young learners.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEarlyChildhood.map((program) => (
                <CourseCard key={program.id} course={program} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

