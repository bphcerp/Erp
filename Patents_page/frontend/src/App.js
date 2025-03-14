import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000";

export default function PatentDashboard() {
  const [patents, setPatents] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    nationality: "",
    status: "filed",
    filing_id: "",
    filing_date: "",
    grant_date: "",
    inventors: "",
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchPatents();
  }, []);

  const fetchPatents = async () => {
    try {
        const response = await axios.get(`${API_URL}/Allpatents`);
        setPatents(response.data || []);  // Ensure an empty array is set
    } catch (error) {
        console.error("Error fetching patents:", error);
        setPatents([]);  // Set to an empty array in case of an error
    }
  };



  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await axios.post(`${API_URL}/patents`, {
      ...formData,
      inventors: formData.inventors.split(","),
    });
    fetchPatents();
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file);
    await axios.post(`${API_URL}/insert-patents`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    fetchPatents();
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Patent Management System</h1>

      {/* Patent Form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input className="border p-2 w-full" type="text" name="title" placeholder="Title" onChange={handleInputChange} />
        <input className="border p-2 w-full" type="text" name="nationality" placeholder="Nationality" onChange={handleInputChange} />
        <select className="border p-2 w-full" name="status" onChange={handleInputChange}>
          <option value="filed">Filed</option>
          <option value="granted">Granted</option>
        </select>
        <input className="border p-2 w-full" type="text" name="filing_id" placeholder="Filing ID" onChange={handleInputChange} />
        <input className="border p-2 w-full" type="date" name="filing_date" placeholder="Filing Date" onChange={handleInputChange} />
        <input className="border p-2 w-full" type="date" name="grant_date" placeholder="Grant Date" onChange={handleInputChange} disabled={formData.status === "filed"} />
        <input className="border p-2 w-full" type="text" name="inventors" placeholder="Inventors (comma-separated)" onChange={handleInputChange} />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">Add Patent</button>
      </form>

      {/* File Upload */}
      <form onSubmit={handleFileUpload} className="mb-6">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} className="border p-2 w-full" />
        <button type="submit" className="bg-green-500 text-white p-2 rounded w-full mt-2">Upload Excel File</button>
      </form>

      {/* Patent List */}
      <h2 className="text-xl font-bold mb-2">All Patents</h2>
      <div className="border p-4 rounded">
        {Array.isArray(patents) && patents.length > 0 ? (
          patents.map((patent) => (
            <div key={patent.patent_id || Math.random()} className="border-b py-2">
              <p><strong>{patent.title || "Untitled"}</strong> ({patent.status || "Unknown"})</p>
              <p>
                <small>
                  Inventors: {patent.inventors_name}
                </small>
              </p>
            </div>
          ))
        ) : (
          <p>No patents available.</p>
        )}
      </div>

    </div>
  );
}
