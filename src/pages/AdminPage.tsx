// src/pages/AdminPage.tsx
import { useState, useEffect } from "react";
import { db, storage, auth } from "../firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  query,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { type Project } from "../types";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const AdminPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    const projectsCollection = collection(db, "projects");
    const q = query(projectsCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const projectsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Project[];
    setProjects(projectsData);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      alert("Please select an image.");
      return;
    }
    setLoading(true);
    try {
      const imageRef = ref(storage, `projects/${Date.now()}_${image.name}`);
      await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(imageRef);

      await addDoc(collection(db, "projects"), {
        title,
        description,
        imageUrl,
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setDescription("");
      setImage(null);
      (document.getElementById("image-input") as HTMLInputElement).value = "";
      await fetchProjects();
    } catch (error) {
      console.error("Error adding project: ", error);
      alert("Failed to add project.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (project: Project) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;
    try {
      const imageRef = ref(storage, project.imageUrl);
      await deleteObject(imageRef);
      await deleteDoc(doc(db, "projects", project.id));
      await fetchProjects();
    } catch (error) {
      console.error("Error deleting project: ", error);
      alert("Failed to delete project. Check console for details.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Add New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded text-white"
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded  text-white"
            required
          />
          <input
            type="file"
            id="image-input"
            onChange={(e) => e.target.files && setImage(e.target.files[0])}
            className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? "Uploading..." : "Add Project"}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Manage Projects</h2>
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-16 h-16 object-cover rounded"
                />
                <span className="font-medium">{project.title}</span>
              </div>
              <div>
                <button
                  onClick={() => handleDelete(project)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
