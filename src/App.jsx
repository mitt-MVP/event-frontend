import { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  const [events, setEvents] = useState([]);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
  fetch("https://event-service-anja.azurewebsites.net/api/events")
    .then(response => response.json())
    .then(data => setEvents(data))
    .catch(error => console.error("Error fetching events:", error));
}, []);

  const addEvent = () => {
    if (!name.trim() || !date) return;
    fetch("http://localhost:5000/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, date })
    })
      .then(res => res.json())
      .then(newEv => {
        setEvents([...events, newEv]);
        setName("");
        setDate("");
      });
  };

  const deleteEvent = (id) => {
    fetch(`http://localhost:5000/api/events/${id}`, { method: "DELETE" })
      .then(() => setEvents(events.filter(e => e.id !== id)));
  };

  return (
    <div className="container">
      <h1>Eventhantering</h1>

      <div className="form">
        <input
          type="text"
          placeholder="Eventnamn"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
        <button onClick={addEvent}>Lägg till</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Event</th>
            <th>Datum</th>
            <th>Åtgärder</th>
          </tr>
        </thead>
        <tbody>
          {events.length > 0 ? (
            events.map(ev => (
              <tr key={ev.id}>
                <td>{ev.name}</td>
                <td>{new Date(ev.date).toLocaleDateString()}</td>
                <td>
                  <button className="delete-btn" onClick={() => deleteEvent(ev.id)}>
                    Ta bort
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="empty">Inga event inlagda.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
