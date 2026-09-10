'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import CourseCard from '@/components/courses/CourseCard';
import NotifySubscribeForm from '@/components/courses/NotifySubscribeForm';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (data.success) setCourses(data.courses);
      setLoading(false);
    }
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((c) => {
    const matchesType = typeFilter === 'all' || c.type === typeFilter;
    const matchesLevel = levelFilter === 'all' || c.level === levelFilter;
    const matchesSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesLevel && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* BANNER - Desktop widescreen (1600x500), Mobile square-ish (800x600) */}
      <div className="relative w-full mb-6 rounded-2xl overflow-hidden">
        <Image
          src="/courses-banner-desktop.png"
          alt="PLC & Robotics Courses"
          width={1600}
          height={500}
          className="w-full h-auto hidden sm:block"
          priority
        />
        <Image
          src="/courses-banner-mobile.png"
          alt="PLC & Robotics Courses"
          width={800}
          height={600}
          className="w-full h-auto block sm:hidden"
          priority
        />
      </div>

      <h1 className="text-3xl font-bold mb-6">PLC & Robotics Courses</h1>

      <div className="mb-6 max-w-md">
        <NotifySubscribeForm />
      </div>

      <div className="space-y-3 mb-6">
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 border p-2.5 rounded-lg text-sm"
        />

        <div className="flex gap-2 flex-wrap">
          {['all', 'online', 'physical'].map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded text-xs sm:text-sm capitalize ${
                typeFilter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}

          <div className="w-px bg-slate-200 mx-1 hidden sm:block" />

          {['all', 'beginner', 'intermediate', 'advanced'].map((l) => (
            <button
              key={l}
              onClick={() => setLevelFilter(l)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded text-xs sm:text-sm capitalize ${
                levelFilter === l ? 'bg-slate-800 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-slate-500 mb-4">{filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found</p>

      {loading ? (
        <p>Loading courses...</p>
      ) : filteredCourses.length === 0 ? (
        <p className="text-gray-500">No courses match your filters.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}