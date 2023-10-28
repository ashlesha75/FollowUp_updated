'use client'


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faEye } from '@fortawesome/free-solid-svg-icons';
import AdminSidebar from '../components/AdminSidebar';
import Image from 'next/image';
import NavSide from '../components/NavSide';


const CompletedTaskList = () => {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false); // State for "View Task" modal
  const [selectedTask, setSelectedTask] = useState(null);
  const [editedTask, setEditedTask] = useState(null);
  const [subemployees, setSubemployees] = useState([]); // State to store Subemployee names and ObjectIds
  const [successMessage, setSuccessMessage] = useState('');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [completeImageUrl, setPreviewImageUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');



  const handlePicturePreview = (imageUrl) => {
    const completeImageUrl = `http://localhost:5000/${imageUrl}`; // Generate the complete image URL
    setPreviewImageUrl(completeImageUrl);
    setIsPreviewModalOpen(true);
  };


  function formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }

  function formatDateList(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are 0-based, so add 1
    const year = date.getFullYear();

    // Ensure two-digit formatting for day and month
    const formattedDay = String(day).padStart(2, '0');
    const formattedMonth = String(month).padStart(2, '0');

    return `${formattedDay}/${formattedMonth}/${year}`;
  }


  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    const fetchCompletedTasks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/task/tasks/completed', {
          headers: {
            Authorization: localStorage.getItem('authToken'),
          },
        });

        const completedTasksWithAssigneeNames = await Promise.all(
          response.data.completedTasks.map(async (task) => {
            const assigneeResponse = await axios.get(`http://localhost:5000/api/subemployee/${task.assignTo}`, {
              headers: {
                Authorization: localStorage.getItem('authToken'),
              },
            });
            const assigneeName = assigneeResponse.data.name;
            return { ...task, assignTo: assigneeName };
          })
        );

        setCompletedTasks(completedTasksWithAssigneeNames);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching completed tasks:', error);
        setLoading(false);
      }
    };

    fetchCompletedTasks();
  }, []);

  useEffect(() => {
    // Fetch Subemployee names and ObjectIds and populate the dropdown list
    const fetchSubemployees = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/employee/subemployees/list', {
          headers: {
            Authorization: localStorage.getItem('authToken'),
          },
        });

        const subemployeeData = response.data.map((subemployee) => ({
          _id: subemployee._id, // Assuming MongoDB ObjectId
          name: subemployee.name,
        }));

        setSubemployees(subemployeeData);
      } catch (error) {
        console.error('Error fetching Subemployee data:', error);
      }
    };

    fetchSubemployees();
  }, []);

  const closeViewModal = () => {
    setSelectedTask(null);
    setViewModalOpen(false);
  };

  const hideActions = typeof window !== 'undefined' ? window.localStorage.getItem('subUsername') : null;

  const openEditModal = (task) => {
    // Format the date to "yyyy-MM-dd" format
    const formattedStartDate = task.startDate.split('T')[0];
    const formattedDeadlineDate = task.deadlineDate.split('T')[0];
    setEditedTask({ ...task, startDate: formattedStartDate, deadlineDate: formattedDeadlineDate });
  };

  const saveChanges = async () => {
    try {
      // Format the date back to ISO format
      const formattedStartDate = editedTask.startDate + 'T00:00:00.000Z';
      const formattedDeadlineDate = editedTask.deadlineDate + 'T00:00:00.000Z';

      const updatedTaskData = {
        startDate: formattedStartDate,
        deadlineDate: formattedDeadlineDate,
        assignTo: editedTask.assignTo, // Pass the ObjectId of the selected Subemployee
      };

      console.log(updatedTaskData);
      await axios.put(`http://localhost:5000/api/task/open/${editedTask._id}`, updatedTaskData, {
        headers: {
          Authorization: localStorage.getItem('authToken'),
        },
      });

      // Remove the task from the list
      setCompletedTasks(completedTasks.filter((task) => task._id !== editedTask._id));

      setSuccessMessage('Task marked as open successfully.');

      setTimeout(() => {
        setSuccessMessage('');
      }, 2000);

      setEditedTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
      // Handle errors here
    }
  };

  const openViewModal = (task) => {
    setSelectedTask(task);
    setViewModalOpen(true);
  };

  return (
    <>
      <NavSide />

      <div className="m-5 pl-1 md:pl-64 mt-20">
        <h1 className="text-xl md:text-2xl font-bold mb-4 text-orange-500 text-center md:text-left">Completed Tasks</h1>
        <div className="flex justify-center items-center mb-4">
          <input
            type="text"
            placeholder="Search Tasks"
            className="px-3 py-1 border border-gray-400 rounded-full w-full md:w-1/2"
            value={searchQuery}
            onChange={handleSearchInputChange}
          />
        </div>


        {loading ? (

          <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-gray-700">
            <FontAwesomeIcon
              icon={faSpinner} // Use your FontAwesome spinner icon
              spin // Add the "spin" prop to make the icon spin
              className="text-white text-4xl" // You can customize the size and color
            />
          </div>
        ) : (
          <div>
            {completedTasks.length === 0 ? (
              <p className="text-gray-600">No completed tasks found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Sr. No.</th>
                      <th className="px-4 py-2">Task</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">DeadLine</th>
                      <th className="px-4 py-2">Assigned To</th>
                      {!hideActions ? (
                        <th className="px-4 py-2">Actions</th>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody>
                    {completedTasks.map((task, index) => (
                      <tr key={task._id}>
                        <td className="border px-4 py-2 text-center">{index + 1}</td>
                        <td className="border px-4 py-2">
                          <div>
                            <h2 className="text-base font-medium text-blue-800 text-center">{task.title}</h2>
                          </div>
                        </td>
                        <td className="border px-4 py-2 text-center">
                          <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-sm">
                            Completed
                          </span>
                        </td>
                        <td className="border px-4 py-2 text-center">{formatDateList(task.startDate)}</td>
                        <td className="border px-4 py-2 text-center">{formatDateList(task.deadlineDate)}</td>
                        <td className="border px-4 py-2 text-center">{task.assignTo}</td>
                        <td className={`border px-4 py-2 text-center ${hideActions ? 'hidden' : ''}`}>
                          {!hideActions && (
                            <div className="flex items-center">
                              <FontAwesomeIcon
                                icon={faEye}
                                className="text-blue-500 hover:underline mr-5 cursor-pointer pl-5 text-xl"
                                onClick={() => openViewModal(task)} // Add a View button here
                              />
                              {/* <button
                              className="bg-blue-500 text-white py-1 px-3 rounded-lg hover:bg-blue-700 ml-2 text-sm"
                              onClick={() => openViewModal(task)} // Add a View button here
                            >
                              View
                            </button> */}
                              <button
                                className="bg-green-500 text-white py-1 px-3 rounded-lg hover:bg-blue-700 ml-4 text-sm"
                                onClick={() => openEditModal(task)}
                              >
                                Mark as Open
                              </button>

                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="fixed bottom-5 right-5 bg-green-500 text-white py-2 px-4 rounded-md">
          {successMessage}
        </div>
      )}

      {/* View Task Modal */}
      {viewModalOpen && selectedTask && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-gray-700">
          <div className="bg-white p-4 w-1/3 rounded-md">
            <h2 className="text-2xl font-semibold mb-4 text-center">View Task</h2>
            <div className='text-left pl-8'>
              {/* Display task details here */}

              <p className="mb-2 text-left justify-center">
                <strong>Title:</strong> {selectedTask.title}
              </p>
              <p className='mb-2 text-left justify-center'><strong>Description:</strong> {selectedTask.description}</p>
              <p className='mb-2 text-left justify-center'><strong>Status:</strong> Completed</p>
              <p className='mb-2 text-left justify-center'><strong>Date:</strong> {formatDateList(selectedTask.startDate)}</p>
              <p className='mb-2 text-left justify-center'><strong>DeadLine:</strong> {formatDateList(selectedTask.deadlineDate)}</p>
              <p className='mb-2 text-left justify-center'><strong>Assigned To:</strong> {selectedTask.assignTo}</p>

              <p className="mb-2 text-left justify-center">
                <strong>Picture:</strong>{" "}
                {selectedTask.picture ? (
                  <button
                    type="button"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mt-1 ml-2"
                    onClick={() => handlePicturePreview(selectedTask.picture)}
                  >
                    Preview
                  </button>
                ) : (
                  "Not Added"
                )}
              </p>

              <p className="mb-2 text-left justify-center">
                <strong>Audio:</strong>{" "}
                {selectedTask.audio ? (
                  <>
                    <audio controls>
                      <source src={`http://localhost:5000/${selectedTask.audio}`} type="audio/mp3" />
                      Your browser does not support the audio element.
                    </audio>
                  </>
                ) : (
                  "Not Added"
                )}
              </p>


              <div className='text-center'>
                <button
                  className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 mt-5"
                  onClick={closeViewModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-container bg-white w-96 p-6 rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => setIsPreviewModalOpen(false)}></button>
            <div className="p-1 text-center">
              <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">Image Preview</h3>
              <Image
                src={completeImageUrl}
                alt="Preview"
                width={400} // Adjust the width as needed
                height={300} // Adjust the height as needed
              />
              <button
                type="button"
                className="bg-red-500 hover:bg-red-700 text-black font-bold py-2 px-4 rounded mt-4 mr-2"
                onClick={() => setIsPreviewModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ... (existing code) */}
    </>
  );
};

export default CompletedTaskList;
