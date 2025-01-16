"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CardSkeleton from "@/components/ui/CardSkeleton";
import FolderCard from "@/components/ui/FolderCard";

const insuranceFolders = [
  {
    folderName: "Auto Insurance Policy",
    folderId: "FOLDER001",
    category: "Motor & Property",
    noOfFiles: 5,
    dateAdded: "2023-01-15",
    dateLastUpdated: "2023-02-10",
  },
  {
    folderName: "Homeowners Insurance",
    folderId: "FOLDER002",
    category: "Motor & Property",
    noOfFiles: 3,
    dateAdded: "2023-01-20",
    dateLastUpdated: "2023-03-01",
  },
  // Other folder objects...
];

const Folders = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredFolders, setFilteredFolders] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
      setFilteredFolders(insuranceFolders); // Initialize with all folders
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const filterFolders = () => {
    let filtered = insuranceFolders;

    if (searchTerm) {
      filtered = filtered.filter((folder) =>
        folder.folderName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (folder) => folder.category === selectedCategory
      );
    }

    setFilteredFolders(filtered);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      filterFolders();
    }, 300); // Debounce filtering

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div>
      <header className="pt-8 mx-16 flex flex-col justify-center items-center gap-8">
        <div className="flex gap-2">
          <label
            className="input input-bordered flex items-center gap-2"
            style={{ width: "700px" }}
          >
            <input
              type="text"
              className="grow"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-4 w-4 opacity-70"
            >
              <path
                fillRule="evenodd"
                d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                clipRule="evenodd"
              />
            </svg>
          </label>

          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn px-8 text-primary">
              Sort
            </div>
            <ul className="dropdown-content menu bg-base-100 rounded-box z-[1] w-56 p-2 shadow mt-2">
              <li>
                <a
                  onClick={() => handleCategoryChange("Alphabet (A-Z)")}
                  className="text-primary"
                >
                  Alphabet (A-Z)
                </a>
              </li>
              <li>
                <a
                  onClick={() => handleCategoryChange("Alphabet (Z-A)")}
                  className="text-primary"
                >
                  Alphabet (Z-A)
                </a>
              </li>
              {/* Additional sorting options */}
            </ul>
          </div>
        </div>

        <div className="flex gap-4">
          <div
            onClick={() => handleCategoryChange("All")}
            tabIndex={0}
            role="button"
            className="btn m-1 px-8 bg-[#ecf4ff] text-primary"
          >
            All
          </div>
          <div className="dropdown">
            <div
              tabIndex={0}
              role="button"
              className="btn m-1 mb-4 px-16 bg-[#ecf4ff] text-primary"
            >
              General Insurance
            </div>
            <ul className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
              <li>
                <a
                  onClick={() => handleCategoryChange("Motor & Property")}
                  className="text-primary"
                >
                  Motor & Property
                </a>
              </li>
              {/* More categories */}
            </ul>
          </div>
        </div>
      </header>

      <h2 className="px-16 mt-8 font-bold text-xl text-primary">Folders</h2>
      <div className="grid grid-cols-4 px-16 py-8 gap-4">
        {loading
          ? Array(12)
              .fill(0)
              .map((_, idx) => <CardSkeleton key={idx} />)
          : filteredFolders.map((folder) => (
              <div
                key={folder.folderId}
                onClick={() => router.push(`/folders/${folder.folderId}`)}
                className="cursor-pointer"
              >
                <FolderCard folder={folder} />
              </div>
            ))}
      </div>
    </div>
  );
};

export default Folders;
