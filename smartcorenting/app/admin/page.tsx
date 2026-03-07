"use client";

import React, { useState, useRef } from "react";
import {
  FaUpload,
  FaCheck,
  FaTimes,
  FaDownload,
  FaTrash,
} from "react-icons/fa";

interface UploadResult {
  success: boolean;
  message: string;
  usersCreated?: number;
  errors?: string[];
}

interface DeleteResult {
  success: boolean;
  message: string;
  deletedCount?: number;
}

const AdminPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteResult, setDeleteResult] = useState<DeleteResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setResult(null);
    } else {
      alert("Please select a valid CSV file");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload-users", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePersonas = async () => {
    if (
      !confirm(
        "Are you sure you want to delete ALL persona users? This action cannot be undone.",
      )
    ) {
      return;
    }

    setDeleting(true);
    setDeleteResult(null);

    try {
      const response = await fetch("/api/admin/delete-personas", {
        method: "DELETE",
      });

      const data = await response.json();
      setDeleteResult(data);
    } catch (error) {
      setDeleteResult({
        success: false,
        message: `Delete failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      "email",
      "displayName",
      "gender",
      "genderPreference",
      "monthlyBudget",
      "preferredLocation",
      "moveInDate",
      "lengthOfStay",
      "propertyType",
      "smoking",
      "pets",
      "sleepSchedule",
      "cleanliness",
      "noiseTolerance",
      "workHabits",
      "socialLifestyle",
      "guestFrequency",
      "cookingFrequency",
      "personalSpace",
      "activityLevel",
    ];

    const exampleRow = [
      "john@example.com",
      "John Doe",
      "Male",
      "No Preference",
      "£800-£1200",
      "London",
      "Within 1 month",
      "Long-term (12+ months)",
      "Flat",
      "false",
      "true",
      "3",
      "4",
      "3",
      "4",
      "3",
      "2",
      "4",
      "3",
      "3",
    ];

    const csvContent = [headers.join(","), exampleRow.join(",")].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "user_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-gray-400 mb-8">
          Upload CSV files to bulk create user personas
        </p>

        {/* Template Download */}
        <div className="bg-zinc-800 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">CSV Template</h2>
          <p className="text-gray-400 text-sm mb-4">
            Download the template CSV to see the required format for uploading
            users.
          </p>
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            <FaDownload />
            Download Template
          </button>
        </div>

        {/* Upload Section */}
        <div className="bg-zinc-800 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Users</h2>

          {/* File Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              file
                ? "border-indigo-500 bg-indigo-500/10"
                : "border-zinc-600 hover:border-zinc-500"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
            {file ? (
              <p className="text-indigo-400 font-medium">{file.name}</p>
            ) : (
              <>
                <p className="text-gray-300 mb-2">Click to select a CSV file</p>
                <p className="text-gray-500 text-sm">
                  or drag and drop your file here
                </p>
              </>
            )}
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-700 disabled:text-gray-500 rounded-xl font-medium transition-colors"
          >
            {uploading ? "Uploading..." : "Upload and Create Users"}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div
            className={`rounded-2xl p-6 ${
              result.success ? "bg-green-900/30" : "bg-red-900/30"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              {result.success ? (
                <FaCheck className="text-green-400 text-xl" />
              ) : (
                <FaTimes className="text-red-400 text-xl" />
              )}
              <h3
                className={`text-lg font-semibold ${
                  result.success ? "text-green-400" : "text-red-400"
                }`}
              >
                {result.success ? "Success" : "Error"}
              </h3>
            </div>
            <p className="text-gray-300 mb-2">{result.message}</p>
            {result.usersCreated !== undefined && (
              <p className="text-gray-400 text-sm">
                Users created: {result.usersCreated}
              </p>
            )}
            {result.errors && result.errors.length > 0 && (
              <div className="mt-4">
                <p className="text-gray-400 text-sm mb-2">Errors:</p>
                <ul className="text-red-400 text-sm space-y-1">
                  {result.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Delete Personas Section */}
        <div className="bg-zinc-800 rounded-2xl p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4 text-red-400">
            Danger Zone
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            Delete all users with IDs starting with &quot;persona_&quot;. This
            will remove all bulk-uploaded test users.
          </p>
          <button
            onClick={handleDeletePersonas}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:text-gray-500 rounded-lg transition-colors"
          >
            <FaTrash />
            {deleting ? "Deleting..." : "Delete All Personas"}
          </button>

          {deleteResult && (
            <div
              className={`mt-4 rounded-lg p-4 ${deleteResult.success ? "bg-green-900/30" : "bg-red-900/30"}`}
            >
              <div className="flex items-center gap-2">
                {deleteResult.success ? (
                  <FaCheck className="text-green-400" />
                ) : (
                  <FaTimes className="text-red-400" />
                )}
                <span
                  className={
                    deleteResult.success ? "text-green-400" : "text-red-400"
                  }
                >
                  {deleteResult.message}
                </span>
              </div>
              {deleteResult.deletedCount !== undefined &&
                deleteResult.deletedCount > 0 && (
                  <p className="text-gray-400 text-sm mt-2">
                    Deleted {deleteResult.deletedCount} persona users
                  </p>
                )}
            </div>
          )}
        </div>

        {/* Field Reference */}
        <div className="bg-zinc-800 rounded-2xl p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Field Reference</h2>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-400">email*</span>
              <span>User email (required)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-400">displayName*</span>
              <span>Full name (required)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-400">gender</span>
              <span>Male, Female, Non-binary, Prefer not to say</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-400">genderPreference</span>
              <span>Male Only, Female Only, No Preference</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-400">monthlyBudget</span>
              <span>£500-£800, £800-£1200, £1200-£1500, £1500+</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-400">preferredLocation</span>
              <span>Free text (e.g., London)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-400">moveInDate</span>
              <span>Immediately, Within 1/3/6 months, Flexible</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-400">lengthOfStay</span>
              <span>Short-term, Medium-term, Long-term</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-400">propertyType</span>
              <span>Flat, House, Studio, Shared Room</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-400">smoking, pets</span>
              <span>true or false</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-400">Lifestyle scales</span>
              <span>1-5 (sleepSchedule, cleanliness, etc.)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
