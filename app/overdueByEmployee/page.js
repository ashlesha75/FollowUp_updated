'use client'

'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faSpinner } from '@fortawesome/free-solid-svg-icons';
import EmployeeSidebar from '../components/EmployeeSidebar';
import Image from 'next/image';
import NavSideEmp from '../components/NavSideEmp';


const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Helper function to fetch employee name by ID
const getEmployeeName = async (employeeId, authToken) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/employee/${employeeId}`, {
      headers: {
        Authorization: authToken,
      },
    });
    return response.data.name;
  } catch (error) {
    console.error(`Error fetching employee name for ID ${employeeId}:`, error);
    return '';
  }
};

const OverdueByEmployee = () => {
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewTask, setViewTask] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [completeImageUrl, setPreviewImageUrl] = useState('');

  const handlePicturePreview = (imageUrl) => {
    const completeImageUrl = `http://localhost:5000/${imageUrl}`; // Generate the complete image URL
    setPreviewImageUrl(completeImageUrl);
    setIsPreviewModalOpen(true);
  };


  useEffect(() => {
    const fetchOverdueTasks = async () => {
      try {
        const token = localStorage.getItem('authToken');

        const response = await axios.get('http://localhost:5000/api/task/tasks/over', {
          headers: {
            Authorization: token,
          },
        });

        if (response.data && response.data.overdueTasks) {
          setOverdueTasks(response.data.overdueTasks);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching overdue tasks:', error);
        setLoading(false);
      }
    };

    fetchOverdueTasks();
  }, []);

  // Function to handle viewing a task
  const handleViewTask = async (task) => {
    const authToken = localStorage.getItem('authToken');

    // Fetch and set names for assignedBy and assignTo
    const assignedByName = await getEmployeeName(task.assignedBy, authToken);
    const assignToName = await getEmployeeName(task.assignTo, authToken);

    setViewTask({
      ...task,
      assignedBy: assignedByName,
      assignTo: assignToName,
    });
  };

  // Function to close the view modal
  const handleCloseViewModal = () => {
    setViewTask(null); // Clear the task to close the modal
  };

  return (
    <>
      {/* <Navbar />
      <EmployeeSidebar /> */}
      <NavSideEmp/>
      <div className="m-5 pl-5 md:pl-72 mt-20">
        <h1 className="text-2xl font-bold mb-4 text-orange-800">Overdue Tasks</h1>
        {loading ? (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-gray-700">
            <FontAwesomeIcon
              icon={faSpinner} // Use your FontAwesome spinner icon
              spin // Add the "spin" prop to make the icon spin
              className="text-white text-4xl" // You can customize the size and color
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse table-auto">
              <thead className='bg-red-600 text-white'>
                <tr>
                  <th className="px-4 py-2 border-b">Sr. No.</th>
                  <th className="px-4 py-2 border-b">Title</th>
                  <th className="px-4 py-2 border-b">Status</th>
                  <th className="px-4 py-2 border-b">Date</th>
                  <th className="px-4 py-2 border-b">Deadline Date</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {overdueTasks.length > 0 ? (
                  overdueTasks.map((task, index) => (
                    <tr key={task._id}>
                      <td className="px-4 py-2 border text-center border-red-300">{index + 1}</td>
                      <td className="px-4 py-2 border text-center border-red-300">{task.title}</td>
                      <td className="px-4 py-2 border text-center font-semibold text-red-950 border-red-300">Overdue</td>
                      <td className="px-4 py-2 border text-center border-red-300">{formatDate(task.startDate)}</td>
                      <td className="px-4 py-2 border text-center border-red-300">{formatDate(task.deadlineDate)}</td>
                      <td className="border px-12 py-2 text-center border-red-300 ">
                        <FontAwesomeIcon
                          icon={faEye}
                          className="text-blue-500 hover:underline cursor-pointer text-xl"
                          onClick={() => handleViewTask(task)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-2 border">
                      No overdue tasks found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Task Modal */}
      {viewTask && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-gray-700">
          <div className="bg-white p-4 w-1/2 rounded-md">
            <h2 className="text-2xl font-semibold mb-4">Task Details</h2>
            <div>
              <p className="mb-2 text-left justify-center">
                <strong>Assigned By:</strong> {viewTask.assignedBy}
              </p>

              <p className="mb-2 text-left justify-center">
                <strong>Title:</strong> {viewTask.title}
              </p>
              <p className="mb-2 text-left justify-center">
                <strong>Description:</strong> {viewTask.description}
              </p>
              <p className="mb-2 text-left justify-center">
                <strong>Status:</strong> Overdue
              </p>
              <p className="mb-2 text-left justify-center">
                <strong>Date:</strong> {formatDate(viewTask.startDate)}
              </p>
              <p className="mb-2 text-left justify-center">
                <strong>Start Time:</strong> {viewTask.startTime}
              </p>
              <p className="mb-2 text-left justify-center">
                <strong>Deadline:</strong> {formatDate(viewTask.deadlineDate)}
              </p>
              <p className="mb-2 text-left justify-center">
                <strong>End Time:</strong> {viewTask.endTime}
              </p>
              <p className="mb-2 text-left justify-center">
                <strong>Picture:</strong>{" "}
                {viewTask.picture ? (
                  <button
                    type="button"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mt-1 ml-2"
                    onClick={() => handlePicturePreview(viewTask.picture)}
                  >
                    Preview
                  </button>
                ) : (
                  "Not Added"
                )}
              </p>

              <p className="mb-2 text-left justify-center">
                <strong>Audio:</strong>{" "}
                {viewTask.audio ? (
                  <>
                    <audio controls>
                      <source src={`http://localhost:5000/${viewTask.audio}`} type="audio/mp3" />
                      Your browser does not support the audio element.
                    </audio>
                  </>
                ) : (
                  "Not Added"
                )}
              </p>
              <p className='text-center'>
                <button
                  className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  onClick={handleCloseViewModal}
                >
                  Close
                </button>
              </p>
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
              {/* <img src={completeImageUrl} alt="Preview" className="mb-2" style={{ maxWidth: '100%', maxHeight: '300px' }} /> */}
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
    </>
  );
};

export default OverdueByEmployee;