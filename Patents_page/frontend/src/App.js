import React, { useState, useEffect } from "react";

function App() {
  const [patents, setPatents] = useState([]);
  const [newPatent, setNewPatent] = useState({
    title: "",
    nationality: "",
    status: "",
    filing_id: "",
    filing_date: "",
    grant_date: "",
    inventors: [],
  });

  const fetchPatents = async () => {
    try {
      const response = await fetch("http://localhost:5000/Allpatents");
      const data = await response.json();
      setPatents(data);
    } catch (error) {
      console.error("Error fetching patents:", error);
    }
  };

  const addPatent = async (e) => {
    e.preventDefault();
    try {
      await fetch("http://localhost:5000/patents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPatent),
      });
      alert("Patent added successfully!");
      setNewPatent({
        title: "",
        nationality: "",
        status: "",
        filing_id: "",
        filing_date: "",
        grant_date: "",
        inventors: [],
      });
      fetchPatents();
    } catch (error) {
      console.error("Error adding patent:", error);
    }
  };

  useEffect(() => {
    fetchPatents();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 flex flex-col items-center">
      <h1 className="text-5xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">Patent Management</h1>
      
      <div className="w-full max-w-3xl p-6 glassmorphism rounded-xl shadow-lg">
        <h2 className="text-3xl font-semibold mb-4">Add a New Patent</h2>
        <form onSubmit={addPatent} className="space-y-4">
          <input type="text" placeholder="Title" value={newPatent.title} onChange={(e) => setNewPatent({ ...newPatent, title: e.target.value })} className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white" required />
          <select value={newPatent.nationality} onChange={(e) => setNewPatent({ ...newPatent, nationality: e.target.value })} className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white" required>
            <option value="" disabled>Select Nationality</option>
            <option value="Indian">Indian</option>
            <option value="Foreigner">Foreigner</option>
          </select>
          <select value={newPatent.status} onChange={(e) => setNewPatent({ ...newPatent, status: e.target.value })} className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white" required>
            <option value="" disabled>Select Status</option>
            <option value="filed">Filed</option>
            <option value="granted">Granted</option>
          </select>
          <input type="text" placeholder="Filing ID" value={newPatent.filing_id} onChange={(e) => setNewPatent({ ...newPatent, filing_id: e.target.value })} className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white" required />
          {newPatent.status === "filed" && <input type="date" value={newPatent.filing_date} onChange={(e) => setNewPatent({ ...newPatent, filing_date: e.target.value })} className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white" required />}
          {newPatent.status === "granted" && <input type="date" value={newPatent.grant_date} onChange={(e) => setNewPatent({ ...newPatent, grant_date: e.target.value })} className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white" required />}
          <input type="text" placeholder="Inventors (comma-separated)" value={newPatent.inventors.join(",")} onChange={(e) => setNewPatent({ ...newPatent, inventors: e.target.value.split(",") })} className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white" required />
          <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 p-3 rounded-md text-white font-bold">Add Patent</button>
        </form>
      </div>

      <div className="mt-8 w-full max-w-4xl">
        <h2 className="text-3xl font-semibold mb-4">All Patents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {patents.map((patent) => (
            <div key={patent.patent_id} className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
              <h3 className="text-xl font-bold mb-2 text-green-400">{patent.title}</h3>
              <p><strong>Nationality:</strong> {patent.nationality}</p>
              <p><strong>Status:</strong> {patent.status}</p>
              <p><strong>Filing ID:</strong> {patent.filing_id}</p>
              <p><strong>Filing Date:</strong> {patent.filing_date || "N/A"}</p>
              <p><strong>Grant Date:</strong> {patent.grant_date || "N/A"}</p>
              <p><strong>Inventors:</strong> {patent.inventors.map((inventor) => inventor.name).join(", ")}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;