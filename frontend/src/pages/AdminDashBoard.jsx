import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../utils/axios";

const AdminDashBoard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    category: "",
    totalSeats: "",
    price: "",
    image: "",
  });

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("events");
      setEvents(data.events || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load events.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchEvents();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchEvents]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.title || !form.description || !form.date || !form.location || !form.category || !form.totalSeats || !form.price) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setCreateLoading(true);
      const payload = {
        title: form.title,
        description: form.description,
        date: form.date,
        location: form.location,
        category: form.category,
        totalSeats: Number(form.totalSeats),
        price: Number(form.price),
        image: form.image,
      };

      await api.post("events", payload);
      setSuccess("Event created successfully.");
      setForm({
        title: "",
        description: "",
        date: "",
        location: "",
        category: "",
        totalSeats: "",
        price: "",
        image: "",
      });
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create event.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Delete this event? This action cannot be undone.")) {
      return;
    }

    setDeleteLoadingId(eventId);
    setError("");
    setSuccess("");

    try {
      await api.delete(`events/${eventId}`);
      setEvents((prev) => prev.filter((event) => event._id !== eventId));
      setSuccess("Event deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete event.");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const totalEvents = events.length;
  const totalSeats = events.reduce((sum, event) => sum + (event.totalSeats || 0), 0);
  const availableSeats = events.reduce((sum, event) => sum + (event.availableSeats || 0), 0);
  const lowSeatsCount = events.filter((event) => event.availableSeats <= 10).length;

  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState("");
  const [updateLoadingId, setUpdateLoadingId] = useState(null);

  const fetchAdminBookings = useCallback(async () => {
    try {
      setBookingsLoading(true);
      setBookingsError("");
      const { data } = await api.get("booking");
      setBookings(data.bookings || []);
    } catch (err) {
      if (err.response?.status === 404) {
        setBookings([]);
      } else {
        setBookingsError(err.response?.data?.message || "Unable to load bookings.");
      }
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void fetchAdminBookings();
    }, 0);
    return () => window.clearTimeout(t);
  }, [fetchAdminBookings]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">Admin Dashboard</p>
          <h1 className="text-4xl font-extrabold text-gray-900">Manage Events & Reservations</h1>
          <p className="mt-3 text-gray-600 max-w-2xl">
            Create and manage your events, review event capacity, and keep your platform organized.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
        >
          View Public Site
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500 uppercase tracking-[0.24em] mb-3">Events</p>
          <p className="text-3xl font-extrabold text-gray-900">{totalEvents}</p>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500 uppercase tracking-[0.24em] mb-3">Total Seats</p>
          <p className="text-3xl font-extrabold text-gray-900">{totalSeats}</p>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500 uppercase tracking-[0.24em] mb-3">Available Seats</p>
          <p className="text-3xl font-extrabold text-gray-900">{availableSeats}</p>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500 uppercase tracking-[0.24em] mb-3">Low Seats</p>
          <p className="text-3xl font-extrabold text-gray-900">{lowSeatsCount}</p>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.5fr_1.5fr]">
        <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
              <p className="text-sm text-gray-500">Add an event that will be visible to users immediately.</p>
            </div>
            <span className="text-xs uppercase tracking-[0.24em] text-gray-400">Admin Only</span>
          </div>

          {error && (
            <div className="rounded-3xl bg-red-50 border border-red-100 p-4 text-red-700 mb-5">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-3xl bg-green-50 border border-green-100 p-4 text-green-700 mb-5">
              {success}
            </div>
          )}

          <form onSubmit={handleCreateEvent} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Event Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                required
                rows={4}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  required
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  required
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  required
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Seats</label>
                <input
                  type="number"
                  min="1"
                  value={form.totalSeats}
                  onChange={(e) => handleChange("totalSeats", e.target.value)}
                  required
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price</label>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  required
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
              <input
                type="url"
                value={form.image}
                onChange={(e) => handleChange("image", e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <button
              type="submit"
              disabled={createLoading}
              className="inline-flex items-center justify-center rounded-2xl bg-gray-900 px-6 py-3 text-white font-semibold transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createLoading ? "Creating..." : "Create Event"}
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Events</h2>
              <p className="text-sm text-gray-500">Manage existing events and delete outdated listings.</p>
            </div>
            <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">{events.length} events</span>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-gray-100 bg-gray-50 p-8 text-center text-gray-600">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
              No events found. Create your first event using the form.
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event._id} className="rounded-3xl border border-gray-100 bg-gray-50 p-6 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <Link to={`/events/${event._id}`} className="text-xl font-semibold text-gray-900 hover:text-gray-700">
                        {event.title}
                      </Link>
                      <p className="mt-2 text-sm text-gray-500">{event.location} • {new Date(event.date).toLocaleDateString()}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3 text-sm text-gray-600">
                      <div className="rounded-2xl bg-white p-4 text-center">
                        <p className="text-xs uppercase tracking-[0.24em] text-gray-400">Seats</p>
                        <p className="mt-2 font-semibold text-gray-900">{event.availableSeats}/{event.totalSeats}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4 text-center">
                        <p className="text-xs uppercase tracking-[0.24em] text-gray-400">Price</p>
                        <p className="mt-2 font-semibold text-gray-900">{event.price === 0 ? "Free" : `₹${event.price}`}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4 text-center">
                        <p className="text-xs uppercase tracking-[0.24em] text-gray-400">Category</p>
                        <p className="mt-2 font-semibold text-gray-900">{event.category}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-gray-600">{event.description.slice(0, 120)}{event.description.length > 120 ? "..." : ""}</div>
                    <button
                      onClick={() => handleDeleteEvent(event._id)}
                      disabled={deleteLoadingId === event._id}
                      className="inline-flex items-center justify-center rounded-2xl bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 border border-red-100 hover:bg-red-100 transition disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deleteLoadingId === event._id ? "Deleting..." : "Delete Event"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bookings</h2>
            <p className="text-sm text-gray-500">Review and update booking status and payment state.</p>
          </div>
          <button
            onClick={() => fetchAdminBookings()}
            className="rounded-2xl bg-gray-900 text-white px-4 py-2 text-sm font-semibold hover:bg-black"
          >
            Refresh
          </button>
        </div>

        {bookingsError && (
          <div className="rounded-3xl bg-red-50 border border-red-100 p-4 text-red-700 mb-5">
            {bookingsError}
          </div>
        )}

        {bookingsLoading ? (
          <div className="rounded-3xl border border-gray-100 bg-gray-50 p-8 text-center text-gray-600">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-600">No bookings found.</div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b._id} className="rounded-3xl border border-gray-100 bg-gray-50 p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-semibold text-gray-900 truncate">{b.eventId?.title || 'Event'}</div>
                    <div className="mt-1 text-sm text-gray-600 truncate">User: {b.userId?.name || b.userId?.email || '—'}</div>
                    <div className="text-sm text-gray-500 mt-2">{b.eventId?.location} • {b.eventId?.date ? new Date(b.eventId.date).toLocaleDateString() : 'TBD'}</div>
                  </div>

                  <div className="grid grid-cols-[auto_auto_auto] items-center gap-x-4 gap-y-2 lg:ml-6">
                    <div className="flex flex-col w-36 items-center">
                      <label className="text-sm text-gray-700 text-center font-medium">Status</label>
                      <select defaultValue={b.status} onChange={(e) => {
                        const updated = { ...b, status: e.target.value };
                        setBookings((prev) => prev.map(x => x._id === b._id ? updated : x));
                      }} className="rounded-lg border px-3 h-10 w-35 relative z-50">
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </div>

                    <div className="flex flex-col w-36 items-center">
                      <label className="text-sm text-gray-700 text-center font-medium">Payment</label>
                      <select defaultValue={b.paymentStatus} onChange={(e) => {
                        const updated = { ...b, paymentStatus: e.target.value };
                        setBookings((prev) => prev.map(x => x._id === b._id ? updated : x));
                      }} className="rounded-lg border px-3 h-10 w-35 relative z-50">
                        <option value="unpaid">unpaid</option>
                        <option value="paid">paid</option>
                      </select>
                    </div>

                    <button
                      onClick={async () => {
                        setUpdateLoadingId(b._id);
                        try {
                          const payload = { status: b.status, paymentStatus: b.paymentStatus };
                          const { data } = await api.put(`booking/${b._id}`, payload);
                          setBookings((prev) => prev.map(x => x._id === b._id ? data.booking : x));
                        } catch (err) {
                          console.error("Update booking error", err);
                          setBookingsError(err.response?.data?.message || "Failed to update booking.");
                        } finally {
                          setUpdateLoadingId(null);
                        }
                      }}
                      disabled={updateLoadingId === b._id}
                      className="rounded-2xl bg-gray-900 text-white px-4 text-sm font-semibold hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed h-10 flex items-center justify-center self-center mt-4"
                    >
                      {updateLoadingId === b._id ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashBoard;
