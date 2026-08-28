import Link from 'next/link';

export default function CourseCard({ course }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
    >
      <div className="aspect-video bg-gray-100 flex items-center justify-center">
        {course.image ? (
          <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-400 text-sm">No image</span>
        )}
      </div>

      <div className="p-4">
        <div className="flex gap-2 mb-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            course.type === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
          }`}>
            {course.type === 'online' ? 'Online' : 'Physical'}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 capitalize">
            {course.level}
          </span>
        </div>

        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{course.title}</h3>
        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{course.description}</p>
        <p className="text-lg font-bold text-gray-900">Rs. {course.price.toLocaleString()}</p>
        {course.duration && (
          <p className="text-xs text-gray-500 mt-1">Duration: {course.duration}</p>
        )}
      </div>
    </Link>
  );
}