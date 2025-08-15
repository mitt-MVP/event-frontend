import { useMemo, useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/events";

const ICONS = {
  dash: "📊",
  bookings: "🗓️",
  invoices: "🧾",
  inbox: "📥",
  calendar: "📅",
  events: "🎉",
  files: "📁",
  finance: "💳",
  gallery: "🖼️",
  feedback: "💬",
};

const TYPE_TO_LABEL = {
  schedule: "Schedule",
  event: "Event",
  meeting: "Meeting",
  setup: "Setup",
};

function Sidebar() {
  const items = [
    { key: "dashboard", label: "Dashboard", icon: ICONS.dash },
    { key: "bookings", label: "Bookings", icon: ICONS.bookings },
    { key: "invoices", label: "Invoices", icon: ICONS.invoices },
    { key: "inbox", label: "Inbox", icon: ICONS.inbox },
    { key: "calendar", label: "Calendar", icon: ICONS.calendar, active: true },
    { key: "events", label: "Events", icon: ICONS.events },
    { key: "files", label: "Files", icon: ICONS.files },
    { key: "financials", label: "Financials", icon: ICONS.finance },
    { key: "gallery", label: "Gallery", icon: ICONS.gallery },
    { key: "feedback", label: "Feedback", icon: ICONS.feedback },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">Ventixe</div>
      <nav className="nav">
        {items.map((it) => (
          <button
            key={it.key}
            className={`nav-item ${it.active ? "is-active" : ""}`}
          >
            <span className="nav-icon">{it.icon}</span>
            <span className="nav-text">{it.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-card">
        <div className="card-ill"></div>
        <div className="card-title">Experience enhanced features</div>
        <div className="card-sub">Try the new version</div>
        <button className="card-btn">Try the new version</button>
      </div>
      <button className="signout">Sign Out</button>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="topbar">
      <div className="page-title">
        <div className="crumb">Dashboard / Calendar</div>
        <h1>Calendar</h1>
      </div>
      <div className="top-actions">
        <div className="search">
          <span>🔍</span>
          <input placeholder="Search anything" />
        </div>
        <button className="icon-btn">❓</button>
        <button className="icon-btn">🔔</button>
        <button className="avatar">A</button>
      </div>
    </header>
  );
}

function ChipsBar({ stats }) {
  return (
    <div className="chips">
      {stats.map((s) => (
        <div className="chip" key={s.label}>
          <div className="chip-count">{s.count}</div>
          <div className="chip-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

function MonthHeader({ ym, setYm }) {
  const monthFmt = ym.toLocaleString("en-US", { month: "long", year: "numeric" });

  function shift(n) {
    const d = new Date(ym);
    d.setMonth(d.getMonth() + n);
    setYm(d);
  }

  return (
    <div className="month-header">
      <div className="month-title">
        <button className="round" onClick={() => shift(-1)}>‹</button>
        <span>{monthFmt}</span>
        <button className="round" onClick={() => shift(1)}>›</button>
      </div>
      <div className="month-actions">
        <button className="seg active">Month</button>
        <button className="seg" disabled>Week</button>
        <button className="seg" disabled>Day</button>
        <button className="ghost small" onClick={() => {
          const el = document.getElementById("add-form");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }}>+ New Agenda</button>
      </div>
    </div>
  );
}

function calendarMatrix(year, month) {
 
  const first = new Date(year, month, 1);
  const start = new Date(first);
  const dow = start.getDay(); // 0..6
  start.setDate(1 - dow);
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push(d);
  }
  return cells;
}

function Calendar({ ym, events, onSelect }) {
  const year = ym.getFullYear();
  const month = ym.getMonth();

  const cells = useMemo(() => calendarMatrix(year, month), [year, month]);

  const evMap = useMemo(() => {
    const m = {};
    events.forEach((e) => {
      (m[e.date] ||= []).push(e);
    });
    return m;
  }, [events]);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="calendar">
      <div className="weekday-row">
        {weekDays.map((w) => (
          <div key={w} className="weekday">{w}</div>
        ))}
      </div>
      <div className="grid">
        {cells.map((d, i) => {
          const inMonth = d.getMonth() === month;
          const ds = d.toISOString().slice(0, 10);
          const dayEvents = evMap[ds] || [];
          const isToday = ds === todayStr;
          return (
            <div
              className={`cell ${inMonth ? "" : "dim"} ${isToday ? "today" : ""}`}
              key={i}
              onClick={() => onSelect({ date: ds, events: dayEvents })}
            >
              <div className="date">{d.getDate()}</div>
              <div className="events">
                {dayEvents.map((e) => (
                  <div key={e.id} className={`pill ${e.type}`}>
                    <span className="dot" /> {e.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Details({ selected, onDelete }) {
  if (!selected) {
    return <div className="details empty-box">Select a date to see details</div>;
  }
  const { date, events } = selected;
  const pretty = new Date(date).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "short", day: "numeric",
  });

  return (
    <div className="details">
      <div className="details-title">Schedule Details</div>
      <div className="details-date">{pretty}</div>
      {events.length === 0 ? (
        <div className="muted">No events</div>
      ) : (
        events.map((e) => (
          <div className="details-card" key={e.id}>
            <div className={`badge ${e.type}`}>{TYPE_TO_LABEL[e.type] ?? "Event"}</div>
            <div className="dc-title">{e.title}</div>
            <div className="dc-meta">{e.location ? e.location : "—"}</div>
            {(e.contactName || e.contactEmail || e.contactPhone) && (
              <>
                <div className="dc-person">{e.contactName ?? ""}</div>
                <div className="dc-contact">
                  {[e.contactPhone, e.contactEmail].filter(Boolean).join(" • ")}
                </div>
              </>
            )}
            <div className="details-actions">
              <button className="delete-btn" onClick={() => onDelete(e.id)}>Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function AddEventForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("2029-05-20");
  const [type, setType] = useState("meeting");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title || !date) return;
    const payload = { title, date, type };
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      alert("Kunde inte skapa event");
      return;
    }
    const created = await res.json();
    onAdd(created);
    setTitle("");
  }

  return (
    <form id="add-form" className="form" onSubmit={handleSubmit}>
      <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="schedule">Schedule</option>
        <option value="event">Event</option>
        <option value="meeting">Meeting</option>
        <option value="setup">Setup</option>
      </select>
      <button type="submit">Add</button>
    </form>
  );
}

export default function App() {
  
  const [ym, setYm] = useState(new Date(2029, 4, 1));
  const [selected, setSelected] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        if (mounted) setEvents(data);
      } catch (e) {
        console.error("Kunde inte hämta events:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

 
  const stats = useMemo(() => {
    const counts = { schedule: 0, event: 0, meeting: 0, setup: 0 };
    events.forEach((e) => {
      const t = (e.type || "").toLowerCase();
      if (counts[t] !== undefined) counts[t] += 1;
    });
    return [
      { label: "All Schedules", count: Object.values(counts).reduce((a, b) => a + b, 0) },
      { label: "Event", count: counts.event },
      { label: "Meeting", count: counts.meeting },
      { label: "Setup and Rehearsal", count: counts.setup },
    ];
  }, [events]);

  async function handleDelete(id) {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (res.status === 204) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
      // uppdatera details-panelen om den tittade på den raderade dagen
      if (selected?.events?.some((e) => e.id === id)) {
        const remaining = selected.events.filter((e) => e.id !== id);
        setSelected({ ...selected, events: remaining });
      }
    } else if (res.status === 404) {
      alert("Eventet fanns inte (kanske redan raderat).");
    } else {
      alert("Kunde inte radera event.");
    }
  }

  function handleAdd(created) {
    setEvents((prev) => [...prev, created]);
  }

  return (
    <div className="layout">
      <Sidebar />
      <main className="content">
        <Topbar />
        <ChipsBar stats={stats} />
        <MonthHeader ym={ym} setYm={setYm} />

        <AddEventForm onAdd={handleAdd} />

        <div className="main-panels">
          <div className="panel">
            {loading ? (
              <div className="calendar loading">Loading events…</div>
            ) : (
              <Calendar ym={ym} events={events} onSelect={setSelected} />
            )}
            <div className="sub-chips">
              <div className="chip small"><span className="dot schedule" /> Schedule</div>
              <div className="chip small"><span className="dot event" /> Event</div>
              <div className="chip small"><span className="dot meeting" /> Meeting</div>
              <div className="chip small"><span className="dot setup" /> Setup</div>
            </div>
          </div>
          <Details selected={selected} onDelete={handleDelete} />
        </div>
      </main>
    </div>
  );
}
