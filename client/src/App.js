import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  // ==============================
  // STATES
  // ==============================

  const [role, setRole] = useState("User");

  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");

  const [bookings, setBookings] = useState([]);
  const [showBookings, setShowBookings] = useState(false);

  // ==============================
  // GET ROOMS
  // ==============================

  const getRooms = async () => {
    try {
      const response = await fetch("http://localhost:5000/rooms");

      const data = await response.json();

      if (response.ok) {
        setRooms(data);
      } else {
        alert("Cannot get rooms");
      }
    } catch (error) {
      console.log(error);
      alert("Cannot connect to server");
    }
  };

  // ==============================
  // LOAD ROOMS WHEN PAGE OPENS
  // ==============================

  useEffect(() => {
    getRooms();
  }, []);

  // ==============================
  // SELECT ROOM
  // ==============================

  const bookRoom = (room) => {
    setSelectedRoom(room);
  };

  // ==============================
  // CLOSE BOOKING FORM
  // ==============================

  const closeForm = () => {
    setSelectedRoom(null);

    setName("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setPurpose("");
  };

  // ==============================
  // VIEW BOOKINGS
  // ==============================

  const viewBookings = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/bookings"
      );

      const data = await response.json();

      if (response.ok) {
        setBookings(data);
        setShowBookings(true);
      } else {
        alert("Cannot get bookings");
      }
    } catch (error) {
      console.log(error);
      alert("Cannot connect to server");
    }
  };

  // ==============================
  // SUBMIT BOOKING
  // ==============================

  const submitBooking = async (e) => {
    e.preventDefault();

    // Check selected room
    if (!selectedRoom) {
      alert("Please select a room");
      return;
    }

    // Check time
    if (startTime >= endTime) {
      alert("End time must be after start time");
      return;
    }

    // Check date
    const today = new Date()
      .toISOString()
      .split("T")[0];

    if (date < today) {
      alert("You cannot book a room for a past date");
      return;
    }

    const booking = {
      room_id: selectedRoom.id,
      name: name,
      date: date,
      start_time: startTime,
      end_time: endTime,
      purpose: purpose,
    };

    try {
      const response = await fetch(
        "http://localhost:5000/bookings",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(booking),
        }
      );

      const result = await response.text();

      if (response.ok) {
        alert(result);

        closeForm();

        // Refresh bookings if already open
        if (showBookings) {
          viewBookings();
        }
      } else {
        alert(result);
      }
    } catch (error) {
      console.log(error);
      alert("Cannot connect to server");
    }
  };

  // ==============================
  // CONFIRM BOOKING
  // ==============================

  const confirmBooking = async (id) => {
    const confirmAction = window.confirm(
      "Are you sure you want to confirm this booking?"
    );

    if (!confirmAction) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/bookings/${id}/confirm`,
        {
          method: "PUT",
        }
      );

      const result = await response.text();

      if (response.ok) {
        alert(result);

        // Get updated status from database
        viewBookings();
      } else {
        alert(result);
      }
    } catch (error) {
      console.log(error);
      alert("Cannot connect to server");
    }
  };

  // ==============================
  // REJECT BOOKING
  // ==============================

  const rejectBooking = async (id) => {
    const confirmAction = window.confirm(
      "Are you sure you want to reject this booking?"
    );

    if (!confirmAction) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/bookings/${id}/reject`,
        {
          method: "PUT",
        }
      );

      const result = await response.text();

      if (response.ok) {
        alert(result);

        // Get updated status from database
        viewBookings();
      } else {
        alert(result);
      }
    } catch (error) {
      console.log(error);
      alert("Cannot connect to server");
    }
  };

  // ==============================
  // CANCEL BOOKING
  // ==============================

  const cancelBooking = async (id) => {
    const confirmAction = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmAction) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/bookings/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.text();

      if (response.ok) {
        alert(result);

        // Get updated status from database
        viewBookings();
      } else {
        alert(result);
      }
    } catch (error) {
      console.log(error);
      alert("Cannot connect to server");
    }
  };

  // ==============================
  // STATUS TEXT
  // ==============================

  const getStatus = (status) => {
    if (status === "Pending") {
      return "🟡 Pending";
    }

    if (status === "Confirmed") {
      return "🟢 Confirmed";
    }

    if (status === "Rejected") {
      return "🔴 Rejected";
    }

    if (status === "Cancelled") {
      return "⚫ Cancelled";
    }

    return status;
  };

  // ==============================
  // CHANGE ROLE
  // ==============================

  const changeRole = (newRole) => {
    setRole(newRole);

    setShowBookings(false);
    setSelectedRoom(null);
  };

  // ==============================
  // USER VIEW
  // ==============================

  const userView = () => {
    return (
      <>
        <div className="section-header">
          <h2>Available Rooms</h2>

          <button
            className="view-button"
            onClick={viewBookings}
          >
            My Bookings
          </button>
        </div>

        <div className="room-list">
          {rooms.length === 0 ? (
            <div className="message-box">
              <p>No rooms found.</p>
            </div>
          ) : (
            rooms.map((room) => (
              <div
                className="room-card"
                key={room.id}
              >
                <h3>{room.name}</h3>

                <p>
                  <strong>Location:</strong>{" "}
                  {room.location}
                </p>

                <p>
                  <strong>Capacity:</strong>{" "}
                  {room.capacity}
                </p>

                <button
                  onClick={() => bookRoom(room)}
                >
                  Book Room
                </button>
              </div>
            ))
          )}
        </div>
      </>
    );
  };

  // ==============================
  // STAFF VIEW
  // ==============================

  const staffView = () => {
    return (
      <>
        <div className="section-header">
          <h2>Staff Dashboard</h2>

          <button
            className="view-button"
            onClick={viewBookings}
          >
            View All Bookings
          </button>
        </div>
      </>
    );
  };

  // ==============================
  // ADMIN VIEW
  // ==============================

  const adminView = () => {
    return (
      <>
        <div className="section-header">
          <h2>Admin Dashboard</h2>

          <button
            className="view-button"
            onClick={viewBookings}
          >
            View All Bookings
          </button>
        </div>

        <div className="room-list">
          <div className="room-card">
            <h3>Room Management</h3>

            <p>
              Manage conference rooms.
            </p>

            <button>
              Manage Rooms
            </button>
          </div>

          <div className="room-card">
            <h3>User Management</h3>

            <p>
              Manage users and staff.
            </p>

            <button>
              Manage Users
            </button>
          </div>
        </div>
      </>
    );
  };

  // ==============================
  // RETURN
  // ==============================

  return (
    <div className="container">

      {/* HEADER */}

      <div className="header">
        <h1>Conference Room Booker</h1>

        <p>
          Book and manage conference rooms easily
        </p>
      </div>


      {/* ROLE SELECTOR */}

      <div className="role-box">

        <h2>Select Role</h2>

        <div className="role-buttons">

          <button
            className={
              role === "User"
                ? "active-role"
                : ""
            }
            onClick={() => changeRole("User")}
          >
            User
          </button>

          <button
            className={
              role === "Staff"
                ? "active-role"
                : ""
            }
            onClick={() => changeRole("Staff")}
          >
            Staff
          </button>

          <button
            className={
              role === "Admin"
                ? "active-role"
                : ""
            }
            onClick={() => changeRole("Admin")}
          >
            Admin
          </button>

        </div>

        <p>
          Current Role:{" "}
          <strong>{role}</strong>
        </p>

      </div>


      {/* ROLE CONTENT */}

      {role === "User" && userView()}

      {role === "Staff" && staffView()}

      {role === "Admin" && adminView()}


      {/* ==============================
          BOOKING FORM
      ============================== */}

      {selectedRoom && (
        <div className="form-box">

          <h2>
            Book {selectedRoom.name}
          </h2>

          <form onSubmit={submitBooking}>

            <div className="form-group">

              <label>Name</label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                required
              />

            </div>


            <div className="form-group">

              <label>Date</label>

              <input
                type="date"
                value={date}
                min={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                onChange={(e) =>
                  setDate(e.target.value)
                }
                required
              />

            </div>


            <div className="form-group">

              <label>Start Time</label>

              <input
                type="time"
                value={startTime}
                onChange={(e) =>
                  setStartTime(e.target.value)
                }
                required
              />

            </div>


            <div className="form-group">

              <label>End Time</label>

              <input
                type="time"
                value={endTime}
                onChange={(e) =>
                  setEndTime(e.target.value)
                }
                required
              />

            </div>


            <div className="form-group">

              <label>Purpose</label>

              <textarea
                value={purpose}
                onChange={(e) =>
                  setPurpose(e.target.value)
                }
                required
              />

            </div>


            <div className="form-buttons">

              <button type="submit">
                Submit Booking
              </button>

              <button
                type="button"
                className="cancel-form-button"
                onClick={closeForm}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>
      )}


      {/* ==============================
          BOOKINGS
      ============================== */}

      {showBookings && (
        <div className="bookings-section">

          <div className="section-header">

            <h2>
              {role === "User"
                ? "My Bookings"
                : "All Bookings"}
            </h2>

            <button
              className="close-button"
              onClick={() =>
                setShowBookings(false)
              }
            >
              Close
            </button>

          </div>


          {bookings.length === 0 ? (
            <div className="message-box">

              <p>
                No bookings found.
              </p>

            </div>
          ) : (
            bookings.map((booking) => {

              const room = rooms.find(
                (r) =>
                  Number(r.id) ===
                  Number(booking.room_id)
              );

              return (
                <div
                  className={`booking-box ${booking.status
                    ? booking.status.toLowerCase()
                    : ""
                    }`}
                  key={booking.id}
                >

                  <h3>
                    Booking #{booking.id}
                  </h3>


                  <p>
                    <strong>Room:</strong>{" "}
                    {room
                      ? room.name
                      : `Room ID ${booking.room_id}`}
                  </p>


                  <p>
                    <strong>Name:</strong>{" "}
                    {booking.user_name}
                  </p>


                  <p>
                    <strong>Date:</strong>{" "}
                    {booking.date}
                  </p>


                  <p>
                    <strong>Time:</strong>{" "}
                    {booking.start_time} -{" "}
                    {booking.end_time}
                  </p>


                  <p>
                    <strong>Purpose:</strong>{" "}
                    {booking.purpose}
                  </p>


                  {/* STATUS */}

                  <p>
                    <strong>Status:</strong>{" "}

                    <span
                      className={`status ${booking.status
                        ? booking.status.toLowerCase()
                        : ""
                        }`}
                    >
                      {getStatus(booking.status)}
                    </span>

                  </p>


                  {/* STAFF / ADMIN
                      CONFIRM + REJECT */}

                  {(role === "Staff" ||
                    role === "Admin") &&
                    booking.status === "Pending" && (

                      <div className="form-buttons">

                        <button
                          className="confirm-button"
                          onClick={() =>
                            confirmBooking(
                              booking.id
                            )
                          }
                        >
                          Confirm
                        </button>

                        <button
                          className="cancel-button"
                          onClick={() =>
                            rejectBooking(
                              booking.id
                            )
                          }
                        >
                          Reject
                        </button>

                      </div>

                    )}


                  {/* USER CANCEL */}

                  {role === "User" &&
                    (
                      booking.status === "Pending" ||
                      booking.status === "Confirmed"
                    ) && (

                      <button
                        className="cancel-button"
                        onClick={() =>
                          cancelBooking(
                            booking.id
                          )
                        }
                      >
                        Cancel Booking
                      </button>

                    )}


                  {/* ADMIN CANCEL */}

                  {role === "Admin" &&
                    (
                      booking.status === "Pending" ||
                      booking.status === "Confirmed"
                    ) && (

                      <button
                        className="cancel-button"
                        onClick={() =>
                          cancelBooking(
                            booking.id
                          )
                        }
                      >
                        Cancel Booking
                      </button>

                    )}

                </div>
              );
            })
          )}

        </div>
      )}

    </div>
  );
}

export default App;