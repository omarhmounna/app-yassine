import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SideMenu from './SideMenu'; // Make sure this import path is correct

// Icon components
const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const AddIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const RefreshIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M23 4v6h-6"></path>
    <path d="M1 20v-6h6"></path>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>
);

const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const DeleteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

type ReferenceStatus = {
  id?: string;
  reference: string;
  status: string;
};

const API_URL = 'https://yassine.anaqamaghribiya.com/GetBonRetour.php';

// AddReferencePopup component
const AddReferencePopup = ({ isOpen, onClose, onAdd }) => {
  const [newReference, setNewReference] = useState('');
  const [newStatus, setNewStatus] = useState('Reçu');

  if (!isOpen) return null;

  return (
    <div style={{ maxHeight: 'var(--portview-height)' }} className="fixed overscroll-contain justify-center items-center flex flex-col transition-[left] duration-200 z-50 top-0 w-screen bg-black/15 h-dvh" onClick={onClose}>
      <div className="overflow-hidden flex flex-col max-w-[80%] w-96 rounded bg-white" onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
        <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold text-sm p-4">
          Add Bon de Retour
        </div>
        <div className="p-4 pb-2 px-8 text-sm">
          <input
            type="text"
            placeholder="Reference..."
            value={newReference}
            onChange={(e) => setNewReference(e.target.value)}
            className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-xl"
          />
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-xl"
          >
            <option value="Reçu">Reçu</option>
            <option value="Expédié">Expédié</option>
          </select>
        </div>
        <div className="p-4 flex items-center justify-end">
          <button
            onClick={onClose}
            className="text-sm p-2 px-4 mx-4 border rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onAdd(newReference, newStatus);
              setNewReference('');
              setNewStatus('Reçu');
            }}
            className="bg-gradient-to-r from-blue-500 to-green-500 px-4 text-white rounded text-sm p-2 mx-4 flex"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// DeleteConfirmationPopup component
const DeleteConfirmationPopup = ({ isOpen, onClose, onConfirm, reference }) => {
  if (!isOpen) return null;

  return (
    <div style={{ maxHeight: 'var(--portview-height)' }} className="fixed overscroll-contain justify-center items-center flex flex-col transition-[left] duration-200 z-50 top-0 w-screen bg-black/15 h-dvh" onClick={onClose}>
      <div className="overflow-hidden flex flex-col max-w-[80%] w-96 rounded bg-white" onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
        <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold text-sm p-4">
          Confirm Deletion
        </div>
        <div className="p-4 pb-2 px-8 text-sm">
          <p>Are you sure you want to delete this reference?</p>
          <p className="font-semibold mt-2">{reference}</p>
        </div>
        <div className="p-4 flex items-center justify-end">
          <button
            onClick={onClose}
            className="text-sm p-2 px-4 mx-4 border rounded"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-gradient-to-r from-red-500 to-red-600 px-4 text-white rounded text-sm p-2 mx-4 flex"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const ReferenceStatusEnhanced = ({setIsMenu, isMenu}) => {
  const [data, setData] = useState<ReferenceStatus[]>([]);
  const [filter, setFilter] = useState<'all' | 'Reçu' | 'Expédié'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [animate, setAnimate] = useState(false);
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, reference: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setAnimate(true);
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const jsonData = await response.json();
      const formattedData = jsonData.map((item: any) => ({
        id: item.id,
        reference: item.reference,
        status: item.statut
      }));
      setData(formattedData);
    } catch (error) {
      setError('Failed to fetch data. Please try again later.');
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return data
      .filter(item => filter === 'all' || item.status === filter)
      .filter(item => 
        item.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [data, filter, searchTerm]);

  useEffect(() => { 
    setEditingIndex(-1);
  }, [filter]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleAddReference = async (newReference: string, newStatus: string) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference: newReference, statut: newStatus }),
      });
      if (!response.ok) {
        throw new Error('Failed to add new reference');
      }
      const result = await response.json();
      if (result.success) {
        fetchData(); // Reload data after successful addition
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error adding reference:', error);
      setError('Failed to add new reference. Please try again.');
    }
    setIsAddPopupOpen(false);
  };

  const handleEdit = (index: number) => {
    console.log('Editing index:', index, filteredData[index]);
    setEditingIndex(index);
    setEditStatus(filteredData[index].status);
  };

  const handleSaveEdit = async () => {
    if (editingIndex !== null) {
      console.log('Editing index:', editingIndex, filteredData[editingIndex]);
      const editedItem = filteredData[editingIndex];
      try {
        const response = await fetch(`${API_URL}?id=${editedItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reference: editedItem.reference, statut: editStatus }),
        });
        if (!response.ok) {
          throw new Error('Failed to update reference');
        }
        const result = await response.json();
        if (result.success) {
          fetchData(); // Reload data after successful update
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error('Error updating reference:', error);
        setError('Failed to update reference. Please try again.');
      }
      setEditingIndex(null);
    }
  };

  const handleDeleteClick = (id: string, reference: string) => {
    setDeleteTarget({ id, reference });
    setIsDeletePopupOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      console.log(`Attempting to delete reference with ID: ${deleteTarget.id}`);
      const response = await fetch(`${API_URL}?id=${deleteTarget.id}`, {
        method: 'DELETE',
      });
      console.log(`Delete response status: ${response.status}`);
      
      const responseText = await response.text();
      console.log(`Delete response text: ${responseText}`);

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}: ${responseText}`);
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse JSON response:', e);
        throw new Error('Invalid response from server');
      }

      if (result.success) {
        console.log('Delete operation successful');
        fetchData(); // Reload data after successful deletion
      } else {
        throw new Error(result.message || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error in delete operation:', error);
      setError(`Failed to delete reference: ${(error as Error).message}`);
    } finally {
      setIsDeletePopupOpen(false);
      setDeleteTarget(null);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="bg-gradient-to-br from-blue-100 to-green-100 min-h-screen">
      <div className={`max-w-2xl mx-auto bg-white shadow-lg rounded-lg ${animate ? 'animate-fade-in' : ''}`}>
        <div className="text-white font-semibold p-1 w-full flex items-center bg-gradient-to-r from-blue-500 to-green-500 shadow-lg">
          <button 
            className="p-2 py-3 rounded hover:bg-blue-600 transition duration-300"
            onClick={() => setIsMenu(!isMenu)}
          >
            <MenuIcon className="h-5 w-5 text-white" />
          </button>
          {!isSearchVisible && <span className="ml-2">Bons de Retour</span>}
          <div className="px-2 flex-1 flex items-center">
            {isSearchVisible ? (
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-1 text-black rounded-xl mr-2"
              />
            ) : (
              <div className="flex-1"></div>
            )}
          </div>
          <button
            className="p-1 px-1 rounded hover:bg-blue-600 transition duration-300"
            onClick={() => { setIsSearchVisible(!isSearchVisible); setSearchTerm(''); }}
          >
            {isSearchVisible ? <CloseIcon className="h-5 w-5 text-white" /> : <SearchIcon className="h-5 w-5 text-white" />}
          </button>
          <button
            className="p-1 px-1 rounded hover:bg-blue-600 transition duration-300 ml-1"
            onClick={() => setIsAddPopupOpen(true)}
          >
            <AddIcon className="h-5 w-5 text-white" />
          </button>
          <button
            className="p-1 px-2 rounded hover:bg-blue-600 transition duration-300 ml-1"
            onClick={handleRefresh}
          >
            <RefreshIcon className="h-5 w-5 text-white" />
          </button>
        </div>
        <div className="p-2 pt-4">
          <div className={`mb-4 sm:mb-6 flex flex-wrap gap-2 ${animate ? 'animate-slide-down' : ''}`}>
            {['all', 'Reçu', 'Expédié'].map((status) => (
              <button 
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 animate-button-pop ${
                  filter === status 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>

          <ul className="space-y-1 bg-white rounded-b-md border border-gray-200">
            {paginatedData.map((item, index) => (
              <li 
                key={item.reference}
                className={`flex justify-between items-center px-3 py-2 transition-all duration-300 ease-in-out animate-fade-in ${
                  index !== paginatedData.length - 1 ? 'border-b border-gray-200' : ''
                } ${editingIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="font-mono text-xs sm:text-sm animate-text-focus-in w-1/2 truncate" title={item.reference}>{item.reference}</span>
                {editingIndex === index ? (
                  <div className="flex items-center space-x-2 w-1/2 justify-end">
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded-md text-xs"
                    >
                      <option value="Reçu">Reçu</option>
                      <option value="Expédié">Expédié</option>
                    </select>
                    <button
                      onClick={handleSaveEdit}
                      className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-300 text-xs"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingIndex(null)}
                      className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-300 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 w-1/2 justify-end">
                    <span 
                      className={`text-xs px-2 py-1 rounded-full transition-all duration-300 hover:scale-110 animate-status-pulse ${
                        item.status === 'Reçu' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {item.status}
                    </span>
                    <button
                      onClick={() => handleEdit(index)}
                      className="p-1 text-blue-500 hover:text-blue-600 transition-colors duration-300 rounded-full hover:bg-blue-100"
                      title="Edit"
                    >
                      <EditIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item.id!, item.reference)}
                      className="p-1 text-red-500 hover:text-red-600 transition-colors duration-300 rounded-full hover:bg-red-100"
                      title="Delete"
                    >
                      <DeleteIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className={`mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 ${animate ? 'animate-fade-in' : ''}`}>
            Total: {filteredData.length} reference{filteredData.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <AddReferencePopup
        isOpen={isAddPopupOpen}
        onClose={() => setIsAddPopupOpen(false)}
        onAdd={handleAddReference}
      />

      <DeleteConfirmationPopup
        isOpen={isDeletePopupOpen}
        onClose={() => setIsDeletePopupOpen(false)}
        onConfirm={handleDelete}
        reference={deleteTarget?.reference || ''}
      />


    </div>
  );
};

export default ReferenceStatusEnhanced;