"use client";
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from "next/image";
import scan from "../../../assets/scan.gif";

export default function New() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [response, setResponse] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [id, setId] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    authors: [],
    department: '',
    data: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "employee") {
      router.push("/login");
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files) {
      setFiles(Array.from(event.dataTransfer.files));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (files.length === 0) {
      alert('Please select at least one file to upload.');
      return;
    }

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    setIsLoading(true);
    try {
      const res = await axios.post('/api/document/scan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = res.data;
      setResponse(data.data);
      setFormData({
        title: data.data.title || '',
        authors: data.data.authors || [],
        department: data.data.department || '',
        data: data.data.data || '',
      });
      setId(data.data._id);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error during file upload:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
      setFiles([]);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.authors.length) newErrors.authors = 'At least one author is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.data) newErrors.data = 'Data is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await axios.patch(`/api/research/${id}`, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      toast.success('Changes saved successfully!');
      setIsModalOpen(false);
      router.push('/emp/documents');
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Failed to save changes. Please try again.');
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-start justify-center p-4 mt-6 mx-auto">
        <div className="bg-white rounded-lg shadow-md w-full max-w-4xl p-6">
          <div className="flex flex-col gap-2 items-center justify-center text-center">
            <Image
              src={scan}
              alt="scan document"
              className="w-24 md:w-36"
            />
            <h1 className="text-xl md:text-2xl font-bold">Upload Document</h1>
          </div>

          <div
            className={`w-full md:w-[40rem] border-2 border-dashed rounded-lg p-4 md:p-6 my-8 mx-auto transition-all duration-300 ${
              isDragging ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <h2 className="text-md md:text-lg font-semibold mb-4 flex justify-center items-center">Drag & Drop Files Here</h2>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="fileInput"
            />
            <label
              htmlFor="fileInput"
              className="bg-blue-500 mx-auto w-full md:w-56 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600 transition flex justify-center items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V21h18v-4.5M3 8.5V3h18v5.5M3 12h18m-9-9l-3 3m3-3l3 3m-3 3l-3 3m3-3l3 3" />
              </svg>
              Or Select Files
            </label>
          </div>

          {files.length > 0 && (
            <div className="mb-4">
              <h3 className="text-md md:text-lg font-semibold mb-2">Selected Files:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center p-2 border rounded-lg">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="ml-4">
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-4">
            <button
              type="button"
              onClick={() => setFiles([])}
              className="bg-gray-300 text-black px-8 py-2 rounded hover:bg-gray-400 transition flex items-center justify-center w-full md:w-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Selection
            </button>

            {formData && (
              <button
                className="bg-white mx-auto w-full md:w-56 text-blue-500 border border-blue-400 px-4 py-2 rounded cursor-pointer hover:bg-blue-500 hover:text-white transition flex justify-center items-center"
                onClick={() => setIsModalOpen(true)}
              >
                Preview
              </button>
            )}

            <form onSubmit={handleSubmit} className="w-full md:w-auto">
              <button
                type="submit"
                disabled={isLoading || files.length === 0}
                className="bg-blue-500 mx-auto w-full md:w-56 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600 transition flex justify-center items-center"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </div>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Submit
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-4 md:p-6 shadow-lg w-full max-w-md md:max-w-2xl rounded-[0.5rem]">
            <h2 className="text-lg font-bold mb-2 text-blue-500">Preview Document</h2>
            <hr />
            <form onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }} className="flex flex-col gap-4 mt-8">
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <textarea
                  name="data"
                  value={formData.data}
                  onChange={handleChange}
                  className="textarea textarea-bordered w-full"
                  rows={5}
                />
              </div>
              <div className="flex justify-end gap-4 mt-4">
                <button
                  type="button"
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 px-4 py-2 text-white rounded hover:bg-blue-600 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}