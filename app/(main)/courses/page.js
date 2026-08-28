'use client';

import { useState, useEffect } from 'react';
import CourseCard from '@/components/courses/CourseCard';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState('all');
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

  const filteredCourses = filter === 'all'
    ? courses
    : courses.filter((c) => c.type === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">PLC & Robotics Courses</h1>

      <div className="flex gap-2 mb-6">
        {['all', 'online', 'physical'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded text-sm capitalize ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading courses...</p>
      ) : filteredCourses.length === 0 ? (
        <p className="text-gray-500">No courses available.</p>
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