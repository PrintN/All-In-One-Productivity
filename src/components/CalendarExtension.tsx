import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react'; // Adjust import
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const MyCalendar: React.FC = () => {
  const [events, setEvents] = useState<any[]>(() => {
    const storedEvents = localStorage.getItem('calendarEvents');
    return storedEvents ? JSON.parse(storedEvents) : [];
  });

  const handleDateSelect = (selectInfo: any) => {
    const title = prompt('Please enter a new title for your event');
    if (title) {
      const newEvent = {
        id: String(Date.now()), // Unique ID for the event
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
      };
      setEvents([...events, newEvent]);
    }
  };

  const handleEventClick = (clickInfo: any) => {
    if (window.confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'?`)) {
      const updatedEvents = events.filter(event => event.id !== clickInfo.event.id);
      setEvents(updatedEvents);
    }
  };

  const handleEventDrop = (dropInfo: any) => {
    const updatedEvent = {
      ...dropInfo.event.toPlainObject(), // Convert to plain object to remove FullCalendar internal data
      start: dropInfo.event.startStr,
      end: dropInfo.event.endStr || dropInfo.event.startStr, // Update end time if changed, default to start time if not set
    };

    const updatedEvents = events.map(event =>
      event.id === updatedEvent.id ? updatedEvent : event
    );
    setEvents(updatedEvents);
  };

  const handleEventResize = (resizeInfo: any) => {
    const updatedEvent = {
      ...resizeInfo.event.toPlainObject(), // Convert to plain object to remove FullCalendar internal data
      start: resizeInfo.event.startStr,
      end: resizeInfo.event.endStr || resizeInfo.event.startStr, // Update end time if changed, default to start time if not set
    };

    const updatedEvents = events.map(event =>
      event.id === updatedEvent.id ? updatedEvent : event
    );
    setEvents(updatedEvents);
  };

  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);

  return (
    <div className="h-full w-full bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl mb-6">Calendar</h1>
      <div className="bg-white rounded-lg p-4 w-full max-w-4xl">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          editable={true}
          selectable={true}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
        />
      </div>
    </div>
  );
};

export default MyCalendar;