import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../utils/axios";
import { AuthContext } from "../context/AuthContext";

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        console.debug("UserDashboard: requesting bookings", {
          url: `${api.defaults.baseURL}/booking/my-bookings`,
          authHeader: api.defaults.headers.common?.Authorization,
          localUser: user,
        });

        const { data } = await api.get("booking/my-bookings");

        console.debug("UserDashboard: bookings response", data);

        setBookings(data.bookings || []);
      } catch (err) {
        console.error(
          "UserDashboard: fetchBookings error",
          err?.response?.status,
          err?.response?.data,
          err?.message,
        );

        if (err.response?.status === 404) {
          setBookings([]);
        } else if (err.response?.status === 401) {
          setError("Unauthorized. Please login again.");
        } else {
          setError(err.response?.data?.message || "Failed to load bookings.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user]);

  const handleCancel = async (bookingId) => {
    if (!bookingId) return;

    setActionLoading(true);
    setError("");

    try {
      await api.delete(`booking/${bookingId}`);
      setBookings((prev) =>
        prev.filter((booking) => booking._id !== bookingId),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel booking.");
    } finally {
      setActionLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-lg p-10 mt-10 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
          Please sign in to view your dashboard.
        </h2>
        <Link
          to="/login"
          className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gray-900 text-white font-semibold hover:bg-black transition"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_2.6fr]">
        <section className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-3xl bg-gray-900 text-white flex items-center justify-center text-2xl font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-[0.24em] mb-2">
                Welcome back
              </p>
              <h1 className="text-3xl font-extrabold text-gray-900">
                {user.name}
              </h1>
            </div>
          </div>

          <div className="space-y-4 text-sm text-gray-600">
            <div className="rounded-3xl bg-gray-50 border border-gray-200 p-5">
              <p className="text-gray-500">Email</p>
              <p className="font-semibold text-gray-900">{user.email}</p>
            </div>
            <div className="rounded-3xl bg-gray-50 border border-gray-200 p-5">
              <p className="text-gray-500">Account Status</p>
              <p className="font-semibold text-gray-900">
                {user.isVerified ? "Verified" : "Verification Pending"}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="text-base font-semibold text-gray-500 uppercase tracking-[0.24em] mb-4">
              Quick actions
            </h2>
            <div className="grid gap-3">
              <Link
                to="/"
                className="block w-full text-center px-4 py-3 rounded-2xl bg-gray-900 text-white font-semibold hover:bg-black transition"
              >
                Browse Events
              </Link>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-[0.24em] mb-2">
                Your bookings
              </p>
              <h2 className="text-3xl font-extrabold text-gray-900">
                Manage your events
              </h2>
            </div>
            <div className="rounded-3xl bg-gray-900 text-white px-5 py-3 text-sm font-semibold">
              {bookings.length} booking{bookings.length === 1 ? "" : "s"}
            </div>
          </div>

          {loading ? (
            <div className="rounded-3xl bg-white p-10 border border-gray-100 shadow-sm text-center text-gray-600">
              Loading your bookings...
            </div>
          ) : error ? (
            <div className="rounded-3xl bg-red-50 p-6 border border-red-100 text-red-700">
              {error}
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-3xl bg-white p-10 border border-gray-100 shadow-sm text-center">
              <p className="text-xl font-semibold text-gray-900 mb-3">
                No bookings yet
              </p>
              <p className="text-gray-500 mb-6">
                Book an event and your reservation will appear here.
              </p>
              <Link
                to="/"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gray-900 text-white font-semibold hover:bg-black transition"
              >
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {bookings.map((booking) => {
                const event = booking.eventId || {};
                return (
                  <div
                    key={booking._id}
                    className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <Link
                          to={`/events/${event._id}`}
                          className="text-xl font-semibold text-gray-900 hover:text-gray-700"
                        >
                          {event.title || "Untitled event"}
                        </Link>
                        <p className="text-sm text-gray-500 mt-2">
                          {event.location || "Location not available"}
                        </p>
                      </div>
                      <div className="space-y-2 text-right text-sm text-gray-600">
                        <p>
                          <span className="font-semibold text-gray-900">
                            Date:
                          </span>{" "}
                          {event.date
                            ? new Date(event.date).toLocaleDateString()
                            : "TBD"}
                        </p>
                        <p>
                          <span className="font-semibold text-gray-900">
                            Amount:
                          </span>{" "}
                          {booking.amount
                            ? `₹${booking.amount}`
                            : event.price
                              ? `₹${event.price}`
                              : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-gray-50 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-gray-400">
                          Status
                        </p>
                        <p className="mt-2 font-semibold text-gray-900 capitalize">
                          {booking.status || "pending"}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-gray-50 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-gray-400">
                          Payment
                        </p>
                        <p className="mt-2 font-semibold text-gray-900 capitalize">
                          {booking.paymentStatus || "unpaid"}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-gray-50 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-gray-400">
                          Seats
                        </p>
                        <p className="mt-2 font-semibold text-gray-900">
                          {event.availableSeats ?? "-"} left
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <Link
                        to={`/events/${event._id}`}
                        className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-gray-900 text-white text-sm font-semibold hover:bg-black transition"
                      >
                        View Event
                      </Link>
                      {booking.status !== "cancelled" && (
                        <button
                          onClick={() => handleCancel(booking._id)}
                          disabled={actionLoading}
                          className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-red-50 text-red-700 text-sm font-semibold border border-red-100 hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default UserDashboard;
