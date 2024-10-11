import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import {
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
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
  MenuItem,
  OutlinedInput,
} from '@mui/material'
import { RiEdit2Fill } from 'react-icons/ri'
import { AiFillDelete } from 'react-icons/ai'
import ReactPaginate from 'react-paginate'
import Gmap from '../Googlemap/Gmap'
import CloseIcon from '@mui/icons-material/Close'
import { GoogleMap, Marker, Polygon, useLoadScript } from '@react-google-maps/api'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import toast, { Toaster } from 'react-hot-toast'

const Geofences = () => {
  const deviceData = useSelector((state) => state.device.data)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [limit, setLimit] = useState(10)
  const [pageCount, setPageCount] = useState()

  const handleEditModalClose = () => setEditModalOpen(false)
  const handleAddModalClose = () => setAddModalOpen(false)

  const PlaceType = [
    { value: 'ATM', label: 'ATM' },
    { value: 'Airport', label: 'Airport' },
    { value: 'Bank', label: 'Bank' },
    { value: 'Beach', label: 'Beach' },
    { value: 'Bus_Stop', label: 'Bus Stop' },
    { value: 'Restaurant', label: 'Restaurant' },
    { value: 'Dairy', label: 'Dairy' },
    { value: 'District', label: 'District' },
    { value: 'Facility', label: 'Facility' },
    { value: 'Factory', label: 'Factory' },
    { value: 'Fuel_Station', label: 'Fuel Station' },
    { value: 'Highway_point', label: 'Highway Point' },
    { value: 'Home', label: 'Home' },
    { value: 'Hospital', label: 'Hospital' },
    { value: 'Hotel', label: 'Hotel' },
    { value: 'Mosque', label: 'Mosque' },
    { value: 'Office', label: 'Office' },
    { value: 'Other', label: 'Other' },
    { value: 'Police_Station', label: 'Police Station' },
    { value: 'Post_Office', label: 'Post Office' },
    { value: 'Railway_Station', label: 'Railway Station' },
    { value: 'Recycle_Station', label: 'Recycle Station' },
    { value: 'School', label: 'School' },
    { value: 'Traffic_Signal', label: 'Traffic Signal' },
    { value: 'State_Border', label: 'State Border' },
    { value: 'Sub_Division', label: 'Sub Division' },
    { value: 'Temple', label: 'Temple' },
    { value: 'Theater', label: 'Theater' },
    { value: 'Theme_Park', label: 'Theme Park' },
    { value: 'Toll_Gate', label: 'Toll Gate' },
    { value: 'Tunnel', label: 'Tunnel' },
    { value: 'University', label: 'University' },
    { value: 'Way_Bridge', label: 'Way Bridge' },
    { value: 'Sensative_Points', label: 'Sensitive Points' },
    { value: 'Dumping_Yard', label: 'Dumping Yard' },
    { value: 'Mine', label: 'Mine' },
    { value: 'No_POI_Report', label: 'No POI Report' },
    { value: 'Entry_Restriction', label: 'Entry Restriction' },
    { value: 'Tyre_Shop', label: 'Tyre Shop' },
    { value: 'Workshop', label: 'Workshop' },
    { value: 'Yard', label: 'Yard' },
    { value: 'Parking_Place', label: 'Parking Place' },
    { value: 'Driver_Home', label: 'Driver Home' },
    { value: 'Customer', label: 'Customer' },
    { value: 'Puspakom', label: 'Puspakom' },
    { value: 'Exit_Restriction', label: 'Exit Restriction' },
    { value: 'Gurudwara', label: 'Gurudwara' },
    { value: 'Church', label: 'Church' },
    { value: 'Distributor', label: 'Distributor' },
    { value: 'State', label: 'State' },
    { value: 'WaterFall', label: 'WaterFall' },
    { value: 'Depot', label: 'Depot' },
    { value: 'Terminal', label: 'Terminal' },
    { value: 'Port', label: 'Port' },
  ]

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '40%',
    maxHeight: '90vh',
    BorderRadius: '10px',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    overflowY: 'auto', // Enable vertical scrolling
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
    marginTop: '8px',
  }
  if (deviceData) {
    console.log('hey bro this is device data : ', deviceData)
  } else {
    console.log('abe yaar device data nh hai')
  }

  const deviceOptions = deviceData?.devices?.map((device) => ({
    value: device.deviceId,
    label: device.name,
  }))

  const [selectedDevices, setSelectedDevices] = useState([])

  const handleDeviceChange = (selected) => {
    setSelectedDevices(selected)
  }

  // ############ map code #################################

  const [selectedLocation, setSelectedLocation] = useState({ lat: 21.1458, lng: 79.0882 })
  const [polygonCoords, setPolygonCoords] = useState([])

  // Load Google Maps API
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyAvHHoPKPwRFui0undeEUrz00-8w6qFtik', // Replace with your API key
  })

  const onMapClick = (event) => {
    const newCoords = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    }
    setPolygonCoords((prev) => [...prev, newCoords]) // Add new coordinates to the polygon
    setSelectedLocation(newCoords)
  }

  if (polygonCoords) {
    console.log('this is selected points', polygonCoords)
  }

  // ######################### get geofences ##############################################
  const fetchGeofenceData = async (page = 1) => {
    const accessToken = Cookies.get('authToken')
    const url = `${import.meta.env.VITE_API_URL}/geofence?page=${page}&limit=${limit}`

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: 'Bearer ' + accessToken,
        },
      })

      if (response.data.geofences) {
        setData(response.data.geofences)
        setPageCount(response.data.pagination.totalPages)
        console.log(response.data.geofences)
        console.log(response.data.pagination.totalPages)
        setLoading(false)
      }
    } catch (error) {
      setLoading(false)
      console.error('Error fetching data:', error)
      throw error // Re-throw the error for further handling if needed
    }
  }

  useEffect(() => {
    fetchGeofenceData()
  }, [])

  const handlePageClick = (e) => {
    console.log(e.selected + 1)
    let page = e.selected + 1
    setLoading(true)
    fetchGeofenceData(page)
  }

  // ################ add geofence #########################################

  const handleAddGeofence = async (e) => {
    e.preventDefault()
    console.log(polygonCoords)
    console.log(formData)
    const updatedFormData = {
      ...formData,
      area: polygonCoords, // Add your polygonCoords here
      deviceIds: selectedDevices.map((device) => device.value),
    }

    console.log('this is updated formdata: ', updatedFormData)

    try {
      const accessToken = Cookies.get('authToken')
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/geofence`,
        updatedFormData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      )

      if (response.status == 201) {
        toast.success('Geofence is created successfully')
        fetchGeofenceData()
        setFormData({})
        setPolygonCoords([])
        setAddModalOpen(false)
      }
    } catch (error) {
      toast.error("An error occured")
      throw error.response ? error.response.data : new Error('An error occurred')
    }
  }

  // ###########################################################################
  // ######################  Edit Geofence ###################################

  const EditGeofenceSubmit = async (e) => {
    e.preventDefault()
    console.log(formData)

    const editedData = {
      ...formData,
      area: polygonCoords, // Add your polygonCoords here
      deviceIds: selectedDevices.map((device) => device.value),
    }
    try {
      const accessToken = Cookies.get('authToken')
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/Geofence/${formData._id}`,
        editedData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )

      if (response.status === 200) {
        toast.success('Geofence is edited successfully')
        fetchGeofenceData()
        setFormData({})
        setPolygonCoords([])
        setEditModalOpen(false)
      }
    } catch (error) {
      toast.error("An error occured")
      throw error.response ? error.response.data : new Error('An error occurred')
    }
  }

  const handleEditGeofence = async (item) => {
    console.log(item)
    setEditModalOpen(true)
    setFormData({ ...item })
    console.log('this is before edit', formData)
  }

  // #########################################################################

  // ######################## Delete Geofence ################################

  const deleteGeofenceSubmit = async (item) => {
    alert('you want to delete this Geofence')
    console.log(item)

    try {
      const accessToken = Cookies.get('authToken')
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/Geofence/${item._id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.status === 200) {
        toast.error('Geofence is deleted successfully')
        fetchGeofenceData()
      }
    } catch (error) {
      toast.error("An error occured")
      throw error.response ? error.response.data : new Error('An error occurred')
    }
  }

  //  ###############################################################

  return (
    <div className="d-flex flex-column mx-md-3 mt-3 h-auto">
      <Toaster position="top-center" reverseOrder={false}/>
      <div className="d-flex justify-content-between mb-2">
        <div>
          <h2>Geofence</h2>
        </div>

        <div className="d-flex">
          <div className="me-3 d-none d-md-block">
            <input
              type="search"
              className="form-control"
              placeholder="search here..."
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
              Add Geofence
            </button>
          </div>
        </div>
      </div>
      <div className="d-md-none mb-2">
        <input
          type="search"
          className="form-control"
          placeholder="search here..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="row">
        <div className="col-12 col-md-6">
          <TableContainer component={Paper} style={{ maxHeight: '800px', marginBottom: '10px' }}>
            {loading ? (
              <>
                <div className="text-nowrap mb-2" style={{ width: '240px' }}>
                  <p className="card-text placeholder-glow">
                    <span className="placeholder col-7" />
                    <span className="placeholder col-4" />
                    <span className="placeholder col-4" />
                    <span className="placeholder col-6" />
                    <span className="placeholder col-8" />
                  </p>
                  <p className="card-text placeholder-glow">
                    <span className="placeholder col-7" />
                    <span className="placeholder col-4" />
                    <span className="placeholder col-4" />
                    <span className="placeholder col-6" />
                    <span className="placeholder col-8" />
                  </p>
                </div>
              </>
            ) : (
              <CTable align="middle" className="mb-2 border min-vh-25 rounded-top-3" hover responsive>
                <CTableHead className="text-nowrap">
                  <CTableRow>
                    <CTableHeaderCell
                      className=" text-center text-white bg-secondary">
                      Geofence Name
                    </CTableHeaderCell>
                    <CTableHeaderCell
                      className=" text-center text-white bg-secondary">
                      Type
                    </CTableHeaderCell>
                    <CTableHeaderCell
                      className=" text-center text-white bg-secondary">
                      Vehicles
                    </CTableHeaderCell>

                    <CTableHeaderCell
                      className=" text-center text-white bg-secondary">
                      Actions
                    </CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {data?.map((item, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell className="text-center">{item.name}</CTableDataCell>
                      <CTableDataCell className="text-center">{item.type}</CTableDataCell>
                      <CTableDataCell className="text-center">
                        {item.deviceIds.map((device) => (
                          <span>{device.name} ,</span>
                        ))}
                      </CTableDataCell>
                      <CTableDataCell
                        className="text-center d-flex"
                        style={{ justifyContent: 'center', alignItems: 'center' }}
                      >
                        <IconButton aria-label="edit" onClick={() => handleEditGeofence(item)}>
                          <RiEdit2Fill
                            style={{ fontSize: '25px', color: 'lightBlue', margin: '5.3px' }}
                          />
                        </IconButton>
                        <IconButton aria-label="delete" onClick={() => deleteGeofenceSubmit(item)}>
                          <AiFillDelete
                            style={{ fontSize: '25px', color: 'red', margin: '5.3px' }}
                          />
                        </IconButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </TableContainer>
          {pageCount > 1 && (
            <ReactPaginate
              breakLabel="..."
              nextLabel="next >"
              onPageChange={handlePageClick}
              pageRangeDisplayed={5}
              pageCount={pageCount} // Set based on the total pages from the API
              previousLabel="< previous"
              renderOnZeroPageCount={null}
              marginPagesDisplayed={2}
              containerClassName="pagination justify-content-center"
              pageClassName="page-item"
              pageLinkClassName="page-link"
              previousClassName="page-item"
              previousLinkClassName="page-link"
              nextClassName="page-item"
              nextLinkClassName="page-link"
              activeClassName="active"
            />
          )}
        </div>
        <div className="col-12 col-md-6">
          <div style={{ flex: 1 }}>{data.length > 0 && <Gmap data={data} />}</div>
        </div>
      </div>

      <Modal
        open={addModalOpen}
        onClose={handleAddModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div className="d-flex justify-content-between">
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Add New Geofence
            </Typography>
            <IconButton
              // style={{ marginLeft: 'auto', marginTop: '-40px', color: '#aaa' }}
              onClick={handleAddModalClose}
            >
              <CloseIcon />
            </IconButton>
          </div>
          <DialogContent>
            <form onSubmit={handleAddGeofence}>
              <Typography variant="subtitle1" style={{ marginTop: '20px' }}>
                Select Geofence Location:
              </Typography>
              {/* Check if Google Maps is loaded */}
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ height: '300px', width: '100%', }}
                  center={selectedLocation}
                  zoom={13}
                  onClick={onMapClick} // Set marker on click
                >
                  {polygonCoords.length > 0 && (
                    <Polygon
                      paths={polygonCoords}
                      options={{
                        fillColor: 'lightblue',
                        fillOpacity: 0.5,
                        strokeColor: 'blue',
                        strokeOpacity: 1,
                        strokeWeight: 2,
                      }}
                    />
                  )}
                  <Marker position={selectedLocation} />
                </GoogleMap>
              ) : (
                <div>Loading Google Maps...</div>
              )}
              <br />
              <TextField
                fullWidth
                label="Geofence Name"
                name="name"
                value={formData.name !== undefined ? formData.name : ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <Select
                placeholder="Select Place Type..."
                value={PlaceType.find((option) => option.value === formData.type) || ''}
                onChange={(selectedOption) =>
                  setFormData({ ...formData, type: selectedOption ? selectedOption.value : '' })
                }
                options={PlaceType}
              />

              <Select
                isMulti
                options={deviceOptions}
                onChange={handleDeviceChange}
                value={selectedDevices}
                placeholder="Select devices"
              />

              <Button
                variant="contained"
                color="primary"
                type="submit"
                style={{ marginTop: '20px' }}
              >
                Submit
              </Button>
            </form>
          </DialogContent>
        </Box>
      </Modal>
      <Modal
        open={editModalOpen}
        onClose={handleEditModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div className="d-flex justify-content-between">
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Edit New Geofence
            </Typography>
            <IconButton
              // style={{ marginLeft: 'auto', marginTop: '-40px', color: '#aaa' }}
              onClick={handleEditModalClose}
            >
              <CloseIcon />
            </IconButton>
          </div>
          <DialogContent>
            <form onSubmit={EditGeofenceSubmit}>
              <Typography variant="subtitle1" style={{ marginTop: '20px' }}>
                Select Geofence Location:
              </Typography>
              {/* Check if Google Maps is loaded */}
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ height: '300px', width: '100%' }}
                  center={selectedLocation}
                  zoom={13}
                  onClick={onMapClick} // Set marker on click
                >
                  {polygonCoords.length > 0 && (
                    <Polygon
                      paths={polygonCoords}
                      options={{
                        fillColor: 'lightblue',
                        fillOpacity: 0.5,
                        strokeColor: 'blue',
                        strokeOpacity: 1,
                        strokeWeight: 2,
                      }}
                    />
                  )}
                  <Marker position={selectedLocation} />
                </GoogleMap>
              ) : (
                <div>Loading Google Maps...</div>
              )}
              <br />
              <TextField
                fullWidth
                label="Geofence Name"
                name="name"
                value={formData.name !== undefined ? formData.name : ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              {/* <FormControl fullWidth margin="normal">
                <InputLabel>Placetype</InputLabel>
                <Select
                  value={formData.type !== undefined ? formData.type : ''}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  fullWidth
                >
                  <MenuItem value="ATM">ATM</MenuItem>
                  <MenuItem value="Airport">Airport</MenuItem>
                  <MenuItem value="Bank">Bank</MenuItem>
                  <MenuItem value="Beach">Beach</MenuItem>
                  <MenuItem value="Bus_Stop">Bus Stop</MenuItem>
                  <MenuItem value="Restaurant">Restaurant</MenuItem>
                  <MenuItem value="Dairy">Dairy</MenuItem>
                  <MenuItem value="District">District</MenuItem>
                  <MenuItem value="Facility">Facility</MenuItem>
                  <MenuItem value="Factory">Factory</MenuItem>
                  <MenuItem value="Fuel_Station">Fuel Station</MenuItem>
                  <MenuItem value="Highway_point">Highway Point</MenuItem>
                  <MenuItem value="Home">Home</MenuItem>
                  <MenuItem value="Hospital">Hospital</MenuItem>
                  <MenuItem value="Hotel">Hotel</MenuItem>
                  <MenuItem value="Mosque">Mosque</MenuItem>
                  <MenuItem value="Office">Office</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                  <MenuItem value="Police_Station">Police Station</MenuItem>
                  <MenuItem value="Post_Office">Post Office</MenuItem>
                  <MenuItem value="Railway_Station">Railway Station</MenuItem>
                  <MenuItem value="Recycle_Station">Recycle Station</MenuItem>
                  <MenuItem value="School">School</MenuItem>
                  <MenuItem value="Traffic_Signal">Traffic Signal</MenuItem>
                  <MenuItem value="State_Border">State Border</MenuItem>
                  <MenuItem value="Sub_Division">Sub Division</MenuItem>
                  <MenuItem value="Temple">Temple</MenuItem>
                  <MenuItem value="Theater">Theater</MenuItem>
                  <MenuItem value="Theme_Park">Theme Park</MenuItem>
                  <MenuItem value="Toll_Gate">Toll Gate</MenuItem>
                  <MenuItem value="Tunnel">Tunnel</MenuItem>
                  <MenuItem value="University">University</MenuItem>
                  <MenuItem value="Way_Bridge">Way Bridge</MenuItem>
                  <MenuItem value="Sensative_Points">Sensitive Points</MenuItem>
                  <MenuItem value="Dumping_Yard">Dumping Yard</MenuItem>
                  <MenuItem value="Mine">Mine</MenuItem>
                  <MenuItem value="No_POI_Report">No POI Report</MenuItem>
                  <MenuItem value="Entry_Restriction">Entry Restriction</MenuItem>
                  <MenuItem value="Tyre_Shop">Tyre Shop</MenuItem>
                  <MenuItem value="Workshop">Workshop</MenuItem>
                  <MenuItem value="Yard">Yard</MenuItem>
                  <MenuItem value="Parking_Place">Parking Place</MenuItem>
                  <MenuItem value="Driver_Home">Driver Home</MenuItem>
                  <MenuItem value="Customer">Customer</MenuItem>
                  <MenuItem value="Puspakom">Puspakom</MenuItem>
                  <MenuItem value="Exit_Restriction">Exit Restriction</MenuItem>
                  <MenuItem value="Gurudwara">Gurudwara</MenuItem>
                  <MenuItem value="Church">Church</MenuItem>
                  <MenuItem value="Distributor">Distributor</MenuItem>
                  <MenuItem value="State">State</MenuItem>
                  <MenuItem value="WaterFall">WaterFall</MenuItem>
                  <MenuItem value="Depot">Depot</MenuItem>
                  <MenuItem value="Terminal">Terminal</MenuItem>
                  <MenuItem value="Port">Port</MenuItem>
                </Select>
              </FormControl> */}

              <Select
                placeholder="Select Place Type..."
                value={PlaceType.find((option) => option.value === formData.type) || ''}
                onChange={(selectedOption) =>
                  setFormData({ ...formData, type: selectedOption ? selectedOption.value : '' })
                }
                options={PlaceType}
              />

              <Select
                isMulti
                options={deviceOptions}
                onChange={handleDeviceChange}
                value={selectedDevices}
                placeholder="Select devices"
              />

              <Button
                variant="contained"
                color="primary"
                type="submit"
                style={{ marginTop: '20px' }}
              >
                Submit
              </Button>
            </form>
          </DialogContent>
        </Box>
      </Modal>
    </div>
  )
}

export default Geofences
