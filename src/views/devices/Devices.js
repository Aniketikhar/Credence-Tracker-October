import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  TableContainer,
  Paper,
  IconButton,
  Dialog,
  DialogContent,
  Typography,
  Button,
  InputBase,
  Modal,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Step,
  Stepper,
  StepLabel,
} from '@mui/material'
import { RiEdit2Fill, RiAddBoxFill } from 'react-icons/ri'
import { AiFillDelete, AiOutlinePlus } from 'react-icons/ai'
import SearchIcon from '@mui/icons-material/Search'
import {
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CFormSelect,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CloseIcon from '@mui/icons-material/Close'
import Cookies from 'js-cookie'
import { IoMdAdd } from 'react-icons/io'
import ReactPaginate from 'react-paginate'
import { Label } from '@mui/icons-material'
import toast, { Toaster } from 'react-hot-toast'
import { jwtDecode } from 'jwt-decode'
import * as XLSX from 'xlsx'; // For Excel export
import jsPDF from 'jspdf'; // For PDF export
import 'jspdf-autotable'; // For table formatting in PDF
import CIcon from '@coreui/icons-react'
import { cilSettings } from '@coreui/icons'

const Devices = () => {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false) // Modal for adding a new row
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(false)
  const [limit, setLimit] = useState(10);
  const [pageCount, setPageCount] = useState()

  const [data, setData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  const [extendedPasswordModel, setExtendedPasswordModel] = useState(false)
  const myPassword = '123456'
  const [extendedPassword, setExtendedPassword] = useState()
  const [passwordCheck, setPasswordCheck] = useState(false)
  const [extendedYear, setExtendedYear] = useState(null)

  const [groups, setGroups] = useState([])
  const [users, setUsers] = useState([])
  const [drivers, setDrivers] = useState([])
  const [areas, setAreas] = useState([])
  const [models, setModels] = useState([])
  const [categories, setCategories] = useState([])

  const token = Cookies.get('authToken')
  const decodedToken = jwtDecode(token)

  const [currentStep, setCurrentStep] = useState(0)
  const steps = ['Device Info', 'Assign To', 'Subscription']
  const [filteredData, setFilteredData] = useState([]);
  const handleModalClose = () => {
    setEditModalOpen(false)
    setAddModalOpen(false)
    setExtendedPasswordModel(false)
    setCurrentStep(0)
    setFormData({})
  }

  // Go to the next step
  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  // Go to the previous step
  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const columns = [
    { Header: 'Device Id', accessor: '_id' },
    { Header: 'Device Name', accessor: 'name' }, // Maps to 'name'
    { Header: 'IMEI No.', accessor: 'uniqueId' }, // Maps to 'uniqueId'
    { Header: 'Sim', accessor: 'sim' }, // Maps to 'sim'
    { Header: 'Speed', accessor: 'speed' }, // Maps to 'speed'
    { Header: 'Average', accessor: 'average' }, // Maps to 'average'
    { Header: 'Users', accessor: 'users' },
    { Header: 'Groups', accessor: 'groups' },
    { Header: 'Driver', accessor: 'Driver' },
    { Header: 'Geofences', accessor: 'geofences' },
    { Header: 'Model', accessor: 'model' }, // Maps to 'model'
    { Header: 'Category', accessor: 'category' }, // Maps to 'category'
    { Header: 'Installation Date', accessor: 'installationdate' }, // Maps to 'installationdate'
    { Header: 'Expiration', accessor: 'expirationdate' }, // Maps to 'expirationdate'
    { Header: 'Extend Date', accessor: 'extenddate' },
  ]

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '35%',
    height: 'auto',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    overflowY: 'auto', // Enable vertical scrolling
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
    margintop: '8px',
  }
  /* Replace -ms-high-contrast with forced-colors */

  const handleEditDateInputChange = (e) => {
    const { name, value } = e.target
    setExtendedPasswordModel(true)

    if (passwordCheck) {
      setFormData((prevData) => ({ ...prevData, [name]: value }))
    }
  }


  const [rows, setRows] = useState([])

  // ###################### Fetch device Data ######################

  const fetchData = async (page = 1) => {
    setLoading(true) // Start loading
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/device?page=${page}&limit=${limit}&search=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // Access the devices array from the response
      if (response.data && Array.isArray(response.data.devices)) {
        const deviceData = response.data.devices.map((device) => ({
          _id: device._id || 'N/A',
          name: device.name || 'N/A',
          uniqueId: device.uniqueId || 'N/A',
          sim: device.sim || 'N/A', //
          speed: device.speed || 'N/A',
          average: device.average || 'N/A',
          model: device.model || 'N/A',
          category: device.category || 'N/A',
          Driver: device.Driver || 'N/A',
          installationdate: device.installationdate || 'N/A',
          expirationdate: device.expirationdate || 'N/A',
          extenddate: device.extenddate || 'N/A',
          groups: device.groups || [],
          users: device.users || [],
          geofences: device.geofences || [],
        }))

        setData(deviceData)
        setPageCount(response.data.totalPages)
      } else {
        console.error('Expected an array but got:', response.data)
        toast.error('Unexpected data format received.')
      }
    } catch (error) {
      console.error('Fetch data error:', error)
      toast.error('An error occurred while fetching data.')
    } finally {
      setLoading(false) // Stop loading once data is fetched
    }
  }

  // ##################### Filter data by search query #######################
  const filterDevices = () => {
    if (!searchQuery) {
      setFilteredData(data); // No query, show all drivers
    } else {
      const filtered = data.filter(
        (device) =>
          device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          device.uniqueId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          device.sim.toLowerCase().includes(searchQuery.toLowerCase()) ||
          device.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
          device.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    }
  };

  useEffect(() => {
    fetchData()
  }, [limit, searchQuery])

  useEffect(() => {
    filterDevices(searchQuery);
  }, [data, searchQuery]);

  const handlePageClick = (e) => {
    console.log(e.selected + 1)
    let page = e.selected + 1
    setLoading(true)
    fetchData(page)
  }

  // ###############################################################
  // ######################  Add Device API Function ######################

  const handleAddSubmit = async () => {
    const apiUrl = `${import.meta.env.VITE_API_URL}/device`
    const newRow = {
      name: formData.name || '',
      uniqueId: formData.uniqueId ? formData.uniqueId.trim() : '', // Trim whitespace
      sim: formData.sim || '',
      groups: Array.isArray(formData.groups) ? formData.groups : [],
      users: Array.isArray(formData.users) ? formData.users : [],
      Driver: formData.Driver || '',
      speed: formData.speed || '',
      average: formData.average || '',
      geofences: Array.isArray(formData.geofences) ? formData.geofences : [],
      model: formData.model || '',
      category: formData.category || '',
      installationdate: formData.installationdate || '',
      expirationdate: formData.expirationdate || '',
      extenddate: formData.extenddate || '',
    }

    if (newRow) {
      // Check for any required fields missing
      if (
        !newRow.name ||
        !newRow.uniqueId ||
        !newRow.sim ||
        !newRow.model ||
        !newRow.category ||
        !newRow.expirationdate
      ) {
        toast.error('Please fill in all required fields.')
        return
      }
    }

    try {
      const response = await axios.post(apiUrl, newRow, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('Raw response:', response)

      if (response.status == 201) {
        console.log('Record created successfully:')
        toast.success('Record created successfully')
        handleModalClose()
        fetchData()
      } else {
        const contentType = response.headers.get('content-type')
        let responseBody

        if (contentType && contentType.includes('application/json')) {
          responseBody = await response.json()
        } else {
          responseBody = await response.text()
        }

        console.error('Error Response:', responseBody)
        toast.error(`Unable to create record: ${responseBody.message || response.statusText}`)
      }
    } catch (error) {
      console.error('Error during POST request:', error)
      toast.error('Unable to create record')
    }
  }

  // #######################################################################
  // #########################  Edit Device API function #######################

  const handleEditIconClick = (row) => {
    console.log(row)
    setFormData({
      ...row,
      name: row.name,
      uniqueId: row.uniqueId,
      speed: row.speed,
      sim: row.sim,
      model: row.model,
      installationdate: row.installationdate,
      extenddate: row.extenddate,
      expirationdate: row.expirationdate,
      category: row.category,
      average: row.average,
      Driver: row.Driver._id,
      geofences: row.geofences.map((geo) => geo._id),
      groups: row.groups.map((group) => group._id),
      users: row.users.map((user) => user._id),
    })
    setEditModalOpen(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    console.log('Data to submit:', formData) // Log the data to be submitted

    try {
      // API call
      const accessToken = Cookies.get('authToken')

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/device/${formData._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )

      // Check if the response status is in the 2xx range
      if (response.status === 200) {
        toast.success('User is edited successfully')
        setEditModalOpen(false)
        fetchData()
        setLoading(false)

        setFormData({})
      } else {
        // Handle other response statuses
        toast.error(`Error: ${response.status} - ${response.statusText}`)
        setLoading(false)
      }
    } catch (error) {
      // Handle error from the server or network error
      console.error('Error during submission:', error) // Log the error for debugging
      let errorMessage = 'An error occurred'

      // Check if the error response exists
      if (error.response) {
        // If the server responded with a status other than 2xx
        errorMessage = error.response.data.message || error.response.data || 'An error occurred'
      } else if (error.request) {
        // If the request was made but no response was received
        errorMessage = 'Network error: Please try again later'
      }

      // Show an alert with the error message
      toast.error(errorMessage)
    }
  }

  // ########################################################################
  // ######################## Delete Device API function #######################

  const handleDeleteSelected = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this record?')
    if (!confirmed) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/device/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast.error('Record deleted successfully')
        fetchData()
      } else {
        const result = await response.json()
        toast.error(`Unable to delete record: ${result.message || response.statusText}`)
      }
    } catch (error) {
      console.error('Error during DELETE request:', error)
      toast.error('Unable to delete record. Please check the console for more details.')
    }
  }

  // ######################################################################
  // ######################  getting other field data ###############################
  useEffect(() => {
    const fetchUsers = async () => {
      console.log('Fetching users...')
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        console.log('Fetched users:', response.data)

        // Checking if response contains the expected structure
        if (response.data && Array.isArray(response.data.users)) {
          setUsers(response.data.users) // Correct mapping
        } else {
          console.error('Unexpected response structure:', response.data)
        }
      } catch (error) {
        console.error('Fetch users error:', error)
        toast.error('An error occurred while fetching users.')
      }
    }

    const fetchGroups = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/group`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Network response was not ok')
        }

        const data = await response.json()
        console.log('groups: ', data.groups)
        setGroups(data.groups) // Assuming the API returns { groups: [...] }
      } catch (error) {
        console.log(error)
      }
    }

    const fetchAreasData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/geofence`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Network response was not ok')
        }

        const data = await response.json()
        if (data.geofences) {
          setAreas(data.geofences)
        }
      } catch (error) {
        console.error('Error fetching areas data:', error)
      }
    }

    const fetchDrivers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/driver`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response && response.data) {
          setDrivers(response.data.drivers) // Set the driver data from the API response
        }
      } catch (error) {
        console.error('Error fetching drivers:', error)
      }
    }

    const fetchModels = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/model`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response?.data?.models) {
          setModels(response.data.models) // Store the fetched models in state
        }
      } catch (error) {
        console.error('Error fetching models:', error)
      }
    }

    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/category`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response?.data) {
          setCategories(response.data) // Store the fetched categories in state
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchUsers()
    fetchGroups()
    fetchAreasData()
    fetchDrivers()
    fetchModels()
    fetchCategories()
  }, [])

  // ################################################################

  const handleInputChange = (event) => {
    const { name, value } = event.target
    // console.log(`Selected value: ${value}`); // Log the selected value
    setFormData({
      ...formData,
      [name]: value,
    })
    console.log(formData)
  }

  // Handle year selection for expiration date

  const [showExpirationDropdown, setShowExpirationDropdown] = useState(false)

  // Handle year selection and calculate expiration date based on the number of years selected
  const handleYearSelection = (years) => {
    const installationDate = formData.installationdate

    console.log('installation hai ye ', installationDate)

    if (installationDate) {
      const installation = new Date(installationDate)
      const expirationDate = new Date(installation.setFullYear(installation.getFullYear() + years))
        .toISOString()
        .split('T')[0] // Format to yyyy-mm-dd

      setFormData({
        ...formData,
        expirationdate: expirationDate,
      })
    }
  }

  const handleCheckPassword = () => {
    if (extendedPassword == myPassword) {
      setPasswordCheck(true)
      setExtendedPasswordModel(false)
      alert('Password is correct')

      // Now update the expiration date based on the selected plan (years)
      const ExpiryDate = formData.expirationdate
      if (ExpiryDate && extendedYear) {
        const expiry = new Date(ExpiryDate)
        const extendedDate = new Date(expiry.setFullYear(expiry.getFullYear() + extendedYear))
          .toISOString()
          .split('T')[0] // Format to yyyy-mm-dd

        // Now set the extended date
        setFormData({
          ...formData,
          extenddate: extendedDate,
          expirationdate: extendedDate,
        })

        setSelectedYears(null) // Reset the selected years after updating
      }
    } else {
      alert('Password is not correct')
    }
  }

  // this is run when date is extended i edit mmodel
  const handleExtendYearSelection = (years) => {
    setExtendedYear(years) // new state to hold the selected number of years
    setExtendedPasswordModel(true)
  }

  const exportToExcel = () => {
    // Map filtered data into the format required for export
    const dataToExport = filteredData.map((item, rowIndex) => {
      const rowData = columns.slice(1).reduce((acc, column) => {
        const accessor = column.accessor;
    
        // Handle specific columns based on the column's accessor
        if (accessor === 'groups') {
          acc[column.Header] = item.groups && item.groups.length > 0 
            ? item.groups.map(group => group.name).join(', ')  // Join group names if there are multiple
            : "N/A";
        } else if (accessor === 'geofences') {
          acc[column.Header] = item.geofences && item.geofences.length > 0 
            ? item.geofences.map(geofence => geofence.name).join(', ')  // Join geofence names if there are multiple
            : "N/A";
        } else if (accessor === 'users') {
          acc[column.Header] = item.users && item.users.length > 0 
            ? item.users.map(user => user.username).join(', ')  // Join usernames if there are multiple
            : "N/A";
        } else if (accessor === 'Driver') {
          acc[column.Header] = item.Driver?.name || 'N/A';
        } else if (accessor === 'device') {
          acc[column.Header] = item.device?.name || 'N/A';
        } else {
          acc[column.Header] = item[accessor] || 'N/A';  // Fallback for other columns
        }
    
        return acc;
      }, {});
    
      return { SN: rowIndex + 1, ...rowData }; // Include row index as SN
    });

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Table Data');

    // Write the Excel file
    XLSX.writeFile(workbook, 'table_data.xlsx');
  };



  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
    });

    // Define the table headers from the columns prop (skip the first one as per the UI logic)
    const tableColumn = ['SN', ...columns.slice(1).map(column => column.Header)];

    // Build the table rows using the filteredData array
    const tableRows = filteredData.map((item, rowIndex) => {
      const rowData = columns.slice(1).map((column) => {
        const accessor = column.accessor;
    
        // Handle specific columns and their logic
        if (accessor === 'groups') {
          return item.groups && item.groups.length > 0 
            ? item.groups.map(group => group.name).join(', ') // Join group names if there are multiple
            : 'N/A'; // Return '0' if no groups are present
        } else if (accessor === 'geofences') {
          return item.geofences && item.geofences.length > 0 
            ? item.geofences.map(geofence => geofence.name).join(', ') // Join geofence names if there are multiple
            : 'N/A'; // Return '0' if no geofences are present
        } else if (accessor === 'users') {
          return item.users && item.users.length > 0 
            ? item.users.map(user => user.username).join(', ') // Join usernames if there are multiple
            : 'N/A'; // Return '0' if no users are present
        } else if (accessor === 'Driver') {
          return item.Driver?.name || 'N/A';
        } else if (accessor === 'device') {
          return item.device?.name || 'N/A';
        } else {
          return item[accessor] || 'N/A';  // Fallback for other columns
        }
      });
      return [rowIndex + 1, ...rowData]; // Include row index as the first element
    });

    // Generate the PDF using the autoTable plugin
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      autoSize: true, // Automatically adjust column width based on content
    });
    doc.save('table_data.pdf');
  };


  return (
    <div className="d-flex flex-column mx-md-3 mt-3 h-auto">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="d-flex justify-content-between mb-2">
        <div>
          <h2>Devices</h2>
        </div>

        <div className="d-flex">
          <div className="me-3 d-none d-md-block">
            <input
              type="search"
              className="form-control"
              placeholder="search here...."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <button
              onClick={() => setAddModalOpen(true)}
              variant="contained"
              className="btn btn-primary"
            >
              Add Device
            </button>
          </div>
        </div>
      </div>



      <TableContainer
        component={Paper}
        sx={{
          height: 'auto', // Set the desired height
          overflowX: 'auto', // Enable horizontal scrollbar
          overflowY: 'auto', // Enable vertical scrollbar if needed
          marginBottom: '10px',
          borderRadius: '10px',
        }}
      >
        <CTable align="middle" className="mb-2 border min-vh-25 rounded-top-3" hover responsive>
          <CTableHead className="text-nowrap">
            <CTableRow>
              {/* Skip the first column */}
              {columns.slice(1).map((column, index) => (
                <CTableHeaderCell key={index} className="text-center text-white bg-secondary">
                  {column.Header}
                </CTableHeaderCell>
              ))}
              {decodedToken.superadmin ? (
                <CTableHeaderCell className="text-white text-center bg-secondary">
                  Actions
                </CTableHeaderCell>
              ) : null}
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {loading ? (
              <CTableRow>
                <CTableDataCell colSpan="15" className="text-center">
                  <div className="text-nowrap mb-2 text-center w-">
                    <p className="card-text placeholder-glow">
                      <span className="placeholder col-12" />
                    </p>
                    <p className="card-text placeholder-glow">
                      <span className="placeholder col-12" />
                    </p>
                    <p className="card-text placeholder-glow">
                      <span className="placeholder col-12" />
                    </p>
                    <p className="card-text placeholder-glow">
                      <span className="placeholder col-12" />
                    </p>
                  </div>
                </CTableDataCell>
              </CTableRow>
            ) : filteredData.length > 0 ? (
              filteredData?.map((item, index) => (
                <CTableRow key={item._id}>
                  {/* Skip the first field in the data row */}
                  {columns.slice(1).map((column) => (
                    <CTableDataCell key={column.accessor} className="text-center">
                      {column.accessor === 'groups' ? (
                        <CFormSelect
                          id="groups"
                          className=" text-center border-0"
                          style={{ width: '100px' }}
                        >
                          <option>{item.groups.length || '0'}</option>
                          {Array.isArray(item.groups) &&
                            item.groups.map((group) => (
                              <option key={group._id} value={group._id}>
                                {group.name || 'undefine group'}
                              </option>
                            ))}
                        </CFormSelect>
                      ) : column.accessor === 'geofences' ? (
                        <CFormSelect
                          id="geofence"
                          className=" text-center border-0"
                          style={{ width: '120px' }}
                        >
                          <option value="">{item.geofences.length || '0'}</option>
                          {Array.isArray(item.geofences) &&
                            item.geofences.map((geofence, index) => (
                              <option key={index} value={geofence._id}>
                                {geofence.name}
                              </option>
                            ))}
                        </CFormSelect>
                      ) : column.accessor === 'users' ? (
                        <CFormSelect
                          id="users"
                          className=" text-center border-0"
                          style={{ width: '120px' }}
                        >
                          <option value="">{item.users.length || '0'}</option>
                          {Array.isArray(item.users) &&
                            item.users.map((user) => (
                              <option key={user._id} value={user._id}>
                                {user.username}
                              </option>
                            ))}
                        </CFormSelect>
                      ) : column.accessor === 'Driver' ? (
                        <div style={{ width: '120px' }}>{item[column.accessor].name || 'N/A'}</div>
                      ) : item[column.accessor] ? (
                        item[column.accessor]
                      ) : (
                        'N/A'
                      )}
                    </CTableDataCell>
                  ))}

                  {decodedToken.superadmin ? (
                    <CTableDataCell className="text-center d-flex">
                      <IconButton aria-label="edit" onClick={() => handleEditIconClick(item)}>
                        <RiEdit2Fill
                          style={{ fontSize: '20px', color: 'lightBlue', margin: '2px' }}
                        />
                      </IconButton>
                      <IconButton
                        aria-label="delete"
                        onClick={() => handleDeleteSelected(item._id)}
                        sx={{ marginRight: '10px', color: 'red' }}
                      >
                        <AiFillDelete style={{ fontSize: '20px' }} />
                      </IconButton>
                    </CTableDataCell>
                  ) : null}
                </CTableRow>
              ))
            ) : (
              <CTableRow>
                <CTableDataCell colSpan="15" className="text-center">
                  <div
                    className="d-flex flex-column justify-content-center align-items-center"
                    style={{ height: '200px' }}
                  >
                    <p className="mb-0 fw-bold">
                      "Oops! Looks like there's no device available.
                      <br /> Maybe it's time to create some devices!"
                    </p>
                    <div>
                      <button
                        onClick={() => setAddModalOpen(true)}
                        variant="contained"
                        className="btn btn-primary m-3 text-white"
                      >
                        <span>
                          <IoMdAdd className="fs-5" />
                        </span>{' '}
                        Add Device
                      </button>
                    </div>
                  </div>
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>
      </TableContainer>
      <CDropdown className="position-fixed bottom-0 end-0 m-3">
        <CDropdownToggle
          color="secondary"
          style={{ borderRadius: '50%', padding: '10px', height: '48px', width: '48px' }}
        >
          <CIcon icon={cilSettings} />
        </CDropdownToggle>
        <CDropdownMenu>
          <CDropdownItem onClick={exportToPDF} >PDF</CDropdownItem>
          <CDropdownItem onClick={exportToExcel} >Excel</CDropdownItem>
        </CDropdownMenu>
      </CDropdown>
      <div className='d-flex justify-content-center align-items-center'>
        <div className="d-flex">
          {/* Pagination */}
          <div className="me-3"> {/* Adds margin to the right of pagination */}
            <ReactPaginate
              breakLabel="..."
              nextLabel="next >"
              onPageChange={handlePageClick}
              pageRangeDisplayed={5}
              pageCount={pageCount} // Set based on the total pages from the API
              previousLabel="< previous"
              renderOnZeroPageCount={null}
              marginPagesDisplayed={2}
              containerClassName="pagination justify-content-center "
              pageClassName="page-item"
              pageLinkClassName="page-link"
              previousClassName="page-item"
              previousLinkClassName="page-link"
              nextClassName="page-item"
              nextLinkClassName="page-link"
              activeClassName="active"
            />
          </div>
          {/* Form Control */}
          <div style={{ width: "90px" }}>
            <CFormSelect
              aria-label="Default select example"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              options={[
                { label: '10', value: '10' },
                { label: '50', value: '50' },
                { label: '500', value: '500' },
                { label: '5000', value: '5000' }
              ]}
            />
          </div>
        </div>
      </div>

      <Modal open={addModalOpen} onClose={handleModalClose}>
        <Box
          sx={{
            ...style,
            backgroundColor: '#f7f9fc',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
            padding: '30px',
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Typography variant="h6" sx={{ color: '#333', fontWeight: 'bold', fontSize: '24px' }}>
              <span role="img" aria-label="device">
                <AiOutlinePlus className="fs-2" />
              </span>{' '}
              Add Device
            </Typography>
            <IconButton onClick={handleModalClose}>
              <CloseIcon />
            </IconButton>
          </div>

          {/* Step-by-step form with progress indicator */}
          <div>
            <Stepper activeStep={currentStep} className="mb-4" alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Step 1: General Information */}
            {currentStep === 0 &&
              columns.map((col) => {
                if (
                  col.accessor === 'name' ||
                  col.accessor === 'uniqueId' ||
                  col.accessor === 'sim' ||
                  col.accessor === 'speed' ||
                  col.accessor === 'average'
                ) {
                  return (
                    <TextField
                      key={col.accessor}
                      label={col.Header}
                      variant="outlined"
                      name={col.accessor}
                      value={formData[col.accessor] || ''}
                      onChange={handleInputChange}
                      fullWidth
                      sx={{ marginBottom: 2 }}
                    />
                  )
                }
                return null // Return null for columns that don't match the condition
              })}

            {/* Step 2: device assign to user, groups, geofence etc  */}
            {currentStep === 1 &&
              columns.map((col) => {
                if (col.accessor == 'users') {
                  return (
                    <FormControl fullWidth sx={{ marginBottom: 2 }} key={col.accessor}>
                      <InputLabel>{col.Header}</InputLabel>
                      <Select
                        name={col.accessor}
                        value={formData[col.accessor] || []}
                        onChange={handleInputChange}
                        label={col.Header}
                        multiple
                      >
                        {users.map((user) => (
                          <MenuItem key={user._id} value={user._id}>
                            {user.username}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )
                } else if (col.accessor === 'groups') {
                  return (
                    <FormControl fullWidth sx={{ marginBottom: 2 }} key={col.accessor}>
                      <InputLabel>{col.Header}</InputLabel>
                      <Select
                        name={col.accessor}
                        value={formData[col.accessor] || []}
                        onChange={handleInputChange}
                        label={col.Header}
                        multiple
                      >
                        {groups.map((group) => (
                          <MenuItem key={group._id} value={group._id}>
                            {group.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )
                } else if (col.accessor === 'Driver') {
                  return (
                    <FormControl fullWidth sx={{ marginBottom: 2 }} key={col.accessor}>
                      <InputLabel>{col.Header}</InputLabel>
                      <Select
                        name={col.accessor}
                        value={formData[col.accessor] || []}
                        onChange={handleInputChange}
                        label={col.Header}
                      >
                        <MenuItem value="">select driver...</MenuItem>
                        {drivers.map((driver) => (
                          <MenuItem key={driver._id} value={driver._id}>
                            {driver.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )
                } else if (col.accessor === 'geofences') {
                  return (
                    <FormControl fullWidth sx={{ marginBottom: 2 }} key={col.accessor}>
                      <InputLabel>{col.Header}</InputLabel>
                      <Select
                        name={col.accessor}
                        value={formData[col.accessor] || []}
                        onChange={handleInputChange}
                        label={col.Header}
                        multiple
                      >
                        {areas.map((geofence) => (
                          <MenuItem key={geofence._id} value={geofence._id}>
                            {geofence.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )
                } else if (col.accessor === 'model') {
                  return (
                    <FormControl fullWidth sx={{ marginBottom: 2 }} key={col.accessor}>
                      <InputLabel>{col.Header}</InputLabel>
                      <Select
                        name={col.accessor}
                        value={formData[col.accessor] || []}
                        onChange={handleInputChange}
                        label={col.Header}
                      >
                        {models.map((model) => (
                          <MenuItem key={model.modelName} value={model.modelName}>
                            {model.modelName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )
                } else if (col.accessor === 'category') {
                  return (
                    <FormControl fullWidth sx={{ marginBottom: 2 }} key={col.accessor}>
                      <InputLabel>{col.Header}</InputLabel>
                      <Select
                        name={col.accessor}
                        value={formData[col.accessor] || []}
                        onChange={handleInputChange}
                        label={col.Header}
                      >
                        {categories.map((category) => (
                          <MenuItem key={category.categoryName} value={category.categoryName}>
                            {category.categoryName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )
                }
                return null
              })}

            {currentStep === 2 &&
              columns.map((col) => {
                if (col.accessor === 'installationdate') {
                  return (
                    <>
                      <label>Installation date: </label>
                      <TextField
                        key={col.accessor}
                        type="date"
                        name={col.accessor}
                        value={formData[col.accessor] || ''}
                        onChange={handleInputChange}
                        fullWidth
                      />
                    </>
                  )
                } else if (col.accessor === 'expirationdate') {
                  return (
                    <FormControl fullWidth sx={{ marginY: 2 }} key={col.accessor}>
                      <InputLabel>Expiration Plans</InputLabel>
                      <Select
                        onChange={(e) => {
                          handleYearSelection(parseInt(e.target.value))
                          setShowExpirationDropdown(false)
                        }}
                        label="Expiration Options"
                      >
                        <MenuItem value={1}>1 Year</MenuItem>
                        <MenuItem value={2}>2 Years</MenuItem>
                        <MenuItem value={3}>3 Years</MenuItem>
                      </Select>
                    </FormControl>
                  )
                }

                // Always return null if no conditions are met
                return null
              })}

            {/* Navigation buttons */}
            <div className="d-flex justify-content-between" style={{ marginTop: '20px' }}>
              {currentStep > 0 && (
                <Button onClick={handleBack} variant="outlined">
                  Back
                </Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button onClick={handleNext} variant="contained" color="primary">
                  Next
                </Button>
              ) : (
                <Button onClick={handleAddSubmit} variant="contained" color="primary">
                  Submit
                </Button>
              )}
            </div>
          </div>
        </Box>
      </Modal>
      <Modal open={editModalOpen} onClose={handleModalClose}>
        <Box
          sx={{
            ...style,
            backgroundColor: '#f7f9fc',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
            padding: '30px',
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Typography variant="h6" sx={{ color: '#333', fontWeight: 'bold', fontSize: '24px' }}>
              <span role="img" aria-label="device">
                <AiOutlinePlus className="fs-2" />
              </span>{' '}
              Update Device
            </Typography>
            <IconButton onClick={handleModalClose}>
              <CloseIcon />
            </IconButton>
          </div>

          {/* Step-by-step form with progress indicator */}
          <div>
            <Stepper activeStep={currentStep} className="mb-4" alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Step 1: General Information */}
            {currentStep === 0 &&
              columns.map((col) => {
                if (
                  col.accessor === 'name' ||
                  col.accessor === 'uniqueId' ||
                  col.accessor === 'sim' ||
                  col.accessor === 'speed' ||
                  col.accessor === 'average'
                ) {
                  return (
                    <TextField
                      key={col.accessor}
                      label={col.Header}
                      variant="outlined"
                      name={col.accessor}
                      value={formData[col.accessor] || ''}
                      onChange={handleInputChange}
                      fullWidth
                      sx={{ marginBottom: 2 }}
                    />
                  )
                }
                return null // Return null for columns that don't match the condition
              })}

            {/* Step 2: device assign to user, groups, geofence etc  */}
            {currentStep === 1 &&
              columns.map((col) => {
                if (col.accessor == 'users') {
                  return (
                    <FormControl fullWidth sx={{ marginBottom: 2 }} key={col.accessor}>
                      <InputLabel>{col.Header}</InputLabel>
                      <Select
                        name={col.accessor}
                        value={formData[col.accessor] || []}
                        onChange={handleInputChange}
                        label={col.Header}
                        multiple
                      >
                        {users.map((user) => (
                          <MenuItem key={user._id} value={user._id}>
                            {user.username}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )
                } else if (col.accessor === 'groups') {
                  return (
                    <FormControl fullWidth sx={{ marginBottom: 2 }} key={col.accessor}>
                      <InputLabel>{col.Header}</InputLabel>
                      <Select
                        name={col.accessor}
                        value={formData[col.accessor] || []}
                        onChange={handleInputChange}
                        label={col.Header}
                        multiple
                      >
                        {groups.map((group) => (
                          <MenuItem key={group._id} value={group._id}>
                            {group.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )
                } else if (col.accessor === 'Driver') {
                  return (
                    <FormControl fullWidth sx={{ marginBottom: 2 }} key={col.accessor}>
                      <InputLabel>{col.Header}</InputLabel>
                      <Select
                        name={col.accessor}
                        value={formData[col.accessor] || []}
                        onChange={handleInputChange}
                        label={col.Header}
                      >
                        <MenuItem value="">select driver...</MenuItem>
                        {drivers.map((driver) => (
                          <MenuItem key={driver._id} value={driver._id}>
                            {driver.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )
                } else if (col.accessor === 'geofences') {
                  return (
                    <FormControl fullWidth sx={{ marginBottom: 2 }} key={col.accessor}>
                      <InputLabel>{col.Header}</InputLabel>
                      <Select
                        name={col.accessor}
                        value={formData[col.accessor] || []}
                        onChange={handleInputChange}
                        label={col.Header}
                        multiple
                      >
                        {areas.map((geofence) => (
                          <MenuItem key={geofence._id} value={geofence._id}>
                            {geofence.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )
                } else if (col.accessor === 'model') {
                  return (
                    <FormControl fullWidth sx={{ marginBottom: 2 }} key={col.accessor}>
                      <InputLabel>{col.Header}</InputLabel>
                      <Select
                        name={col.accessor}
                        value={formData[col.accessor] || []}
                        onChange={handleInputChange}
                        label={col.Header}
                      >
                        {models.map((model) => (
                          <MenuItem key={model} value={model.modelName}>
                            {model.modelName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )
                } else if (col.accessor === 'category') {
                  return (
                    <FormControl fullWidth sx={{ marginBottom: 2 }} key={col.accessor}>
                      <InputLabel>{col.Header}</InputLabel>
                      <Select
                        name={col.accessor}
                        value={formData[col.accessor] || []}
                        onChange={handleInputChange}
                        label={col.Header}
                      >
                        {categories.map((category) => (
                          <MenuItem key={category} value={category.categoryName}>
                            {category.categoryName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )
                }
                return null
              })}

            {currentStep === 2 &&
              columns.map((col) => {
                if (col.accessor === 'installationdate') {
                  return (
                    <div className="mt-3">
                      <label>Installation date: </label>
                      <TextField
                        key={col.accessor}
                        name={col.accessor}
                        value={formData[col.accessor] || ''}
                        onChange={handleInputChange}
                        fullWidth
                        disabled
                      />
                    </div>
                  )
                } else if (col.accessor === 'expirationdate') {
                  return (
                    <div className="mt-3">
                      <label>Expiration Date: </label>
                      <TextField
                        key={col.accessor}
                        name={col.accessor}
                        value={formData[col.accessor]}
                        onChange={handleInputChange}
                        fullWidth
                        disabled
                      />
                    </div>
                  )
                } else if (col.accessor === 'extenddate') {
                  return (
                    <div className="mt-3">
                      <label>Extend Plan: </label>
                      <br />
                      <Select
                        onChange={(e) => {
                          handleExtendYearSelection(parseInt(e.target.value))
                          setShowExpirationDropdown(false)
                        }}
                        fullWidth
                      >
                        <MenuItem value={1}>1 Year</MenuItem>
                        <MenuItem value={2}>2 Years</MenuItem>
                        <MenuItem value={3}>3 Years</MenuItem>
                      </Select>
                    </div>
                  )
                }

                // Always return null if no conditions are met
                return null
              })}

            {/* Navigation buttons */}
            <div className="d-flex justify-content-between" style={{ marginTop: '20px' }}>
              {currentStep > 0 && (
                <Button onClick={handleBack} variant="outlined">
                  Back
                </Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button onClick={handleNext} variant="contained" color="primary">
                  Next
                </Button>
              ) : (
                <Button onClick={handleEditSubmit} variant="contained" color="primary">
                  Submit
                </Button>
              )}
            </div>
          </div>
        </Box>
      </Modal>

      <Modal open={extendedPasswordModel} onClose={handleModalClose}>
        <Box sx={style} style={{ height: '30%' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <Typography variant="h6">Enter Password</Typography>
            <IconButton onClick={() => setExtendedPasswordModel(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Conditional rendering based on col.accessor */}
          <input
            type="password"
            name=""
            id=""
            value={extendedPassword}
            onChange={(e) => setExtendedPassword(e.target.value)}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleCheckPassword}
            sx={{ marginTop: 2 }}
          >
            Submit
          </Button>
        </Box>
      </Modal>
    </div>
  )
}

export default Devices
