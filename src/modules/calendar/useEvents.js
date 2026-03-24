import { useState, useCallback } from "react";
import { eventService } from "../../services/eventService";

export function useEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchEvents = useCallback(async (start, end) => {
    setLoading(true)
    setError(null)
    try {
      const data = await eventService.getEvents(start, end)
      setEvents(data)
    } catch {
      setError('Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [])

  const createEvent = async (data) => {
    const newEvent = await eventService.createEvent(data)
    setEvents(prev => [...prev, newEvent])
    return newEvent
  }

  const updateEvent = async (id, data) => {
    const updated = await eventService.updateEvent(id, data)
    setEvents(prev => prev.map(e => e.id === id ? updated : e))
    return updated
  }

  const deleteEvent = async (id) => {
    await eventService.deleteEvent(id)
    setEvents(prev => prev.filter(e => e.id !==id))
  }

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent
  }
}