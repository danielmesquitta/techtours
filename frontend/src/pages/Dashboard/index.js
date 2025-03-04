import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import socketio from 'socket.io-client'

import { Container, Notifications, Accept, Reject } from './styles'
import api from '../../services/api'
import Button from '../../components/Button'

export default function Dashboard() {
  const [spots, setSpots] = useState([])
  const [requests, setRequests] = useState([])

  const user_id = localStorage.getItem('user')
  const socket = useMemo(
    () =>
      socketio('http://localhost:3333', {
        query: { user_id },
      }),
    [user_id]
  )

  useEffect(() => {
    socket.on('booking_request', data => {
      setRequests([...requests, data])
    })
  }, [requests, socket])

  useEffect(() => {
    async function loadSpots() {
      const user_id = localStorage.getItem('user')
      const response = await api.get('/dashboard', {
        headers: { user_id },
      })
      setSpots(response.data)
    }
    loadSpots()
  }, [])

  async function handleAccept(id) {
    await api.post(`/bookings/${id}/approvals`)
    setRequests(requests.filter(request => request._id != id))
  }

  async function handleReject(id) {
    await api.post(`/bookings/${id}/rejections`)
    setRequests(requests.filter(request => request._id != id))
  }

  return (
    <>
      <Notifications>
        {requests.map(request => (
          <li key={request._id}>
            <p>
              <strong>{request.user.email} </strong>está solicitanto uma reserva
              em<strong> {request.spot.company} </strong>para a data:
              <strong> {request.date} </strong>
            </p>
            <Accept onClick={() => handleAccept(request._id)}>ACEITAR</Accept>
            <Reject onClick={() => handleReject(request._id)}>REJECT</Reject>
          </li>
        ))}
      </Notifications>

      <Container>
        {spots.map(spot => (
          <li key={spot._id}>
            <header
              style={{ backgroundImage: `url(${spot.thumbnail_url})` }}
            ></header>
            <strong>{spot.company}</strong>
            <span>{spot.price ? `R$${spot.price}/dia` : 'Gratuito'}</span>
          </li>
        ))}
      </Container>
      <Link to="/new">
        <Button>Cadastrar novo spot</Button>
      </Link>
    </>
  )
}
