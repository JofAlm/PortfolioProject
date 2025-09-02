import { useState, useEffect, type KeyboardEvent } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase/config";
import { type Project } from "../types";

const StartPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Effect to fetch projects from Firestore on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsCollection = collection(db, "projects");
        const q = query(
          projectsCollection,
          orderBy("createdAt", "desc"),
          orderBy("title", "asc")
        );
        const querySnapshot = await getDocs(q);
        const projectsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Project[];
        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching projects: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Effect to handle closing the modal with the Escape key
  useEffect(() => {
    const handleEscKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }
    };

    if (selectedImage) {
      window.addEventListener("keydown", handleEscKey);
    }

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [selectedImage]);

  const handleProjectClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleProjectKeyDown = (
    e: KeyboardEvent<HTMLDivElement>,
    imageUrl: string
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault(); // Prevent page scroll on spacebar
      setSelectedImage(imageUrl);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading projects...</p>;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 text-center">Our Work</h1>

      {projects.length === 0 && !loading ? (
        <p className="text-center text-gray-500">
          No projects have been added yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => handleProjectClick(project.imageUrl)}
              onKeyDown={(e) => handleProjectKeyDown(e, project.imageUrl)}
              tabIndex={0} // Makes the div focusable for keyboard navigation
              role="button" // Informs screen readers that this div is interactive
              aria-label={`View project: ${project.title}`}
            >
              <img
                src={project.imageUrl}
                alt={project.title} // Uses the project title as a meaningful, automatic alt-text
                className="w-full h-56 object-cover"
              />
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-2">{project.title}</h2>
                <p className="text-gray-600 line-clamp-3">
                  {project.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div onClick={(e) => e.stopPropagation()} className="relative">
            <img
              src={selectedImage}
              alt="Enlarged view of the selected project"
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-4 -right-4 bg-white rounded-full p-1 text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Close image viewer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StartPage;
