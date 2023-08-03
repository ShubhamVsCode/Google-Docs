import React, { useState } from "react";

const ShareDocumentModal = ({ isOpen, onClose, shareDocumentFunction }) => {
  const [email, setEmail] = useState("");

  const handleShare = () => {
    shareDocumentFunction(email);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto">
      <div
        className="modal-overlay backdrop-blur-sm h-screen w-screen flex items-center justify-center"
        onClick={(e) => {
          onClose();
        }}
      >
        <div
          className="modal-container bg-white border w-96 mx-auto rounded shadow-lg z-50 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content py-4 text-left px-6">
            <div className="flex justify-between items-center pb-3">
              <p className="text-2xl font-bold">Share Document</p>
              <button
                className="modal-close-btn cursor-pointer z-50"
                onClick={onClose}
              >
                <span className="text-3xl">×</span>
              </button>
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="email"
              >
                Email Address:
              </label>
              <input
                className="w-full px-3 py-2 placeholder-gray-300 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            <div className="flex justify-end">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                onClick={handleShare}
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareDocumentModal;
