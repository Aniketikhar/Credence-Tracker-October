import React, { useEffect, useState } from 'react'
import { IoLocationOutline } from 'react-icons/io5'
import { BsWindowFullscreen } from 'react-icons/bs'
import { BsChatDots } from 'react-icons/bs'
import { FaRegEdit } from 'react-icons/fa'
import { LiaFileInvoiceDollarSolid } from 'react-icons/lia'
import { TbReport } from 'react-icons/tb'
import { LuHelpCircle } from 'react-icons/lu'
import { BiLogOutCircle } from 'react-icons/bi'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'




const _nav = (role, decodedToken) => {

  let devices, users, driver, groups, geofence, notification, maintenance, preferences, category, model, status, distance, history, stop, travel, idle, sensor, alerts, vehicle, geofenceReport;  
  console.log(decodedToken);
  
  if(role != 'superadmin'){
    ({
      devices,
      users,
      driver,
      groups,
      geofence,
      notification,
      maintenance,
      preferences,
      category,
      model,
      status,
      distance,
      history,
      stop,
      travel,
      idle,
      sensor,
      alerts,
      vehicle,
      geofenceReport
    } = decodedToken.user);
  }

  console.log(role)

  

  return [
    {
      component: CNavItem,
      name: 'Dashboard',
      to: '/dashboard',
      icon: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BsWindowFullscreen style={{ marginRight: '15px', fontSize: '19px' }} />
        </div>
      ),
    },
    {
      component: CNavItem,
      name: 'Live Tracking',
      to: '/livetrack',
      icon: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <IoLocationOutline style={{ marginLeft: '0px', marginRight: '15px', fontSize: '23px' }} />
        </div>
      ),
    },
    ...(role == 'superadmin'
      ? [
          {
            component: CNavTitle,
            name: 'Manage',
          },
          {
            component: CNavGroup,
            name: 'Master',
            icon: (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <LiaFileInvoiceDollarSolid style={{ marginRight: '15px', fontSize: '22px' }} />
              </div>
            ),
            items: [
              { component: CNavItem, name: 'Devices', to: '/devices' },
              { component: CNavItem, name: 'Users', to: '/users' },
              { component: CNavItem, name: 'Group', to: '/group' },
              { component: CNavItem, name: 'Geofences', to: '/geofences' },
              { component: CNavItem, name: 'Driver', to: '/driver' },
              { component: CNavItem, name: 'Notifications', to: '/notifications' },
              { component: CNavItem, name: 'Maintenance', to: '/maintenance' },
              { component: CNavItem, name: 'Category', to: '/category' },
              { component: CNavItem, name: 'Model', to: '/model' },
            ],
          },
          {
            component: CNavGroup,
            name: 'Report',
            icon: (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <TbReport style={{ marginRight: '15px', fontSize: '22px' }} />
              </div>
            ),
            items: [
              { component: CNavItem, name: 'Status Reports', to: '/statusreports' },
              { component: CNavItem, name: 'Distance Reports', to: '/distancereports' },
              { component: CNavItem, name: 'History', to: '/history' },
              { component: CNavItem, name: 'Stops', to: '/stops' },
              { component: CNavItem, name: 'Travels Report', to: '/travelsreport' },
              { component: CNavItem, name: 'Idle Report', to: '/idlereport' },
              { component: CNavItem, name: 'Sensor Reports', to: '/sensorreports' },
              { component: CNavItem, name: 'Alerts/Events', to: '/alerts-events' },
              { component: CNavItem, name: 'Vehicle Reports', to: '/vehiclereport' },
              { component: CNavItem, name: 'Geofence Report', to: '/geofencereport' },
            ],
          },
          {
            component: CNavGroup,
            name: 'Expense Management',
            icon: (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FaRegEdit style={{ marginRight: '15px', fontSize: '20px' }} />
              </div>
            ),
            items: [
              { component: CNavItem, name: 'Invoice', to: '/invoice' },
              { component: CNavItem, name: 'PO', to: '/po' },
              { component: CNavItem, name: 'Inventory', to: '/inventory-management' },
            ],
          },
        ]
      : [
          {
            component: CNavTitle,
            name: 'Manage',
          },
          (devices || users || groups || geofence || driver || notification || preferences || maintenance ) &&
          {
            component: CNavGroup,
            name: 'Master',
            icon: (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <LiaFileInvoiceDollarSolid style={{ marginRight: '15px', fontSize: '22px' }} />
              </div>
            ),
            items: [
              devices && { component: CNavItem, name: 'Devices', to: '/devices' },
              users && { component: CNavItem, name: 'Users', to: '/users' },
              groups && { component: CNavItem, name: 'Group', to: '/group' },
              geofence && { component: CNavItem, name: 'Geofences', to: '/geofences' },
              driver && { component: CNavItem, name: 'Driver', to: '/driver' },
              notification && { component: CNavItem, name: 'Notifications', to: '/notifications' },
              // preferences && { component: CNavItem, name: 'Preferences', to: '/preferences' },
              maintenance && { component: CNavItem, name: 'Maintenance', to: '/maintenance' },
            ].filter(Boolean),
          },
          (status || distance || history || stop || travel || idle || sensor || alerts || dayreport || vehicle || geofenceReport) &&
          {
            component: CNavGroup,
            name: 'Report',
            icon: (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <TbReport style={{ marginRight: '15px', fontSize: '22px' }} />
              </div>
            ),
            items: [
              status && {
                component: CNavItem,
                name: 'Status Reports',
                to: '/statusreports',
              },
              distance && {
                component: CNavItem,
                name: 'Distance Reports',
                to: '/distancereports',
              },
              history && { component: CNavItem, name: 'History', to: '/history' },
              stop && { component: CNavItem, name: 'Stops', to: '/stops' },
              travel && { component: CNavItem, name: 'Travels Report', to: '/travelsreport' },
              idle && { component: CNavItem, name: 'Idle Report', to: '/idlereport' },
              sensor && {
                component: CNavItem,

                name: 'Sensor Reports',
                to: '/sensorreports',
              },
              alerts && { component: CNavItem, name: 'Alerts/Events', to: '/alerts-events' },
              vehicle && { component: CNavItem, name: 'Vehicle Reports', to: '/vehiclereport' },
              geofenceReport && { component: CNavItem, name: 'Geofence Report', to: '/geofencereport' },
            ].filter(Boolean),
          },
          {
            component: CNavGroup,
            name: 'Expense Management',
            icon: (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FaRegEdit style={{ marginRight: '15px', fontSize: '20px' }} />
              </div>
            ),
            items: [
              { component: CNavItem, name: 'Invoice', to: '/invoice' },
              { component: CNavItem, name: 'PO', to: '/po' },
              { component: CNavItem, name: 'Inventory', to: '/inventory-management' },
            ],
          },
        ].filter(Boolean)),
    {
      component: CNavItem,
      name: 'Chat Bot',
      to: '/chatbot',
      icon: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BsChatDots style={{ marginRight: '15px', fontSize: '20px' }} />
        </div>
      ),
    },
    {
      component: CNavItem,
      name: 'Help & Support',
      to: '/h&s',
      icon: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <LuHelpCircle style={{ marginRight: '15px', fontSize: '23px' }} />
        </div>
      ),
    },
    
  ]
}

export default _nav
