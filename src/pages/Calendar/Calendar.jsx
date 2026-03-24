import React, { useRef, useState, useCallback } from 'react';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { useEvents } from "../../modules/calendar/useEvents";
import EventModal from "../../modules/calendar/EventModal";
import Button from "../../components/ui/Button/Button";
import "./Calendar.scss";

function Calendar() {
  const calendarRef = useRef(null);

  const { events, fetchEvents, createEvent, updateEvent, deleteEvent } =
    useEvents();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Fetch events when calendar view changes
  const handleDatesSet = useCallback(
    (dateInfo) => {
      fetchEvents(dateInfo.startStr, dateInfo.endStr);
    },
    [fetchEvents],
  );

  const handleDateClick = (info) => {
    setSelectedEvent({
      start: info.dateStr,
      end: info.dateStr,
      allDay: info.allDay,
    });
    setModalOpen(true);
  };

  const handleEventClick = (info) => {
    const e = info.event;
    setSelectedEvent({
      id: e.id,
      title: e.title,
      start: e.start,
      end: e.end,
      allDay: e.allDay,
      location: e.extendedProps.location,
      description: e.extendedProps.description,
      event_type: e.extendedProps.event_type,
      color: e.backgroundColor,
    });
    setModalOpen(true);
  };

  // Drag to reschedule
  const handleEventDrop = async (info) => {
    try {
      await updateEvent(info.event.id, {
        start_time: info.event.start,
        end_time: info.event.end || info.event.start,
      });
    } catch {
      info.revert();
    }
  };

   const handleSave = async (formData, eventId) => {
     if (eventId) {
       await updateEvent(eventId, formData);
     } else {
       await createEvent(formData);
     }
  };
  
  return (
    <div className="calendar-page">
      <div className="calendar-page__header">
        <div className="calendar-page__header-left">
          <h1 className="calendar-page__title">Calendar</h1>
          <p className="calendar-page__subtitle">
            Manage your schedule and team events
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setSelectedEvent(null);
            setModalOpen(true);
          }}
        >
          + New Event
        </Button>
      </div>

      <div className="calendar-page__body">
        <FullCalendar
          ref={calendarRef}
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            listPlugin,
          ]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
          buttonText={{
            today: "Today",
            month: "Month",
            week: "Week",
            day: "Day",
            list: "Agenda",
          }}
          events={events}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={4}
          weekends={true}
          datesSet={handleDatesSet}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          height="100%"
          eventDisplay="block"
        />
      </div>

      <EventModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedEvent(null);
        }}
        onSave={handleSave}
        onDelete={deleteEvent}
        event={selectedEvent}
      />
    </div>
  );
}

export default Calendar
