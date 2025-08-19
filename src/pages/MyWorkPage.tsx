// src/pages/MyWorkPage.tsx
import { useState, useEffect } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase/config";
import { type Project } from "../types";

const MyWorkPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  if (loading) return <p className="text-center mt-10">Loading projects...</p>;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 text-center">Our Work</h1>

      {projects.length === 0 && !loading ? (
        <p className="text-center text-gray-500">
          No projects have been added yet. Go to the admin page to add one!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer"
              onClick={() => setSelectedImage(project.imageUrl)}
            >
              <img
                src={project.imageUrl}
                alt={project.title}
                className="w-full h-56 object-cover"
              />
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-2">{project.title}</h2>
                <p className="text-gray-600">{project.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bild-modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Enlarged project"
            className="max-w-full max-h-full rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
};

export default MyWorkPage;
