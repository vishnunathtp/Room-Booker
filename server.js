const express = require("express");
const cors = require("cors");
const db = require("./db");
const room = require("./room");

const app = express();

app.use(cors());
app.use(express.json());


// ==============================
// HOME
// ==============================

app.get("/", (req, res) => {
    res.send("Room Booker Server is running");
});


// ==============================
// GET ALL ROOMS
// ==============================

app.get("/rooms", (req, res) => {

    room.getRooms((err, result) => {

        if (err) {

            console.log(err);

            res.status(500).send(
                "Cannot get rooms"
            );

        } else {

            res.send(result);

        }

    });

});


// ==============================
// ADD BOOKING
// ==============================

app.post("/bookings", (req, res) => {

    const {
        room_id,
        name,
        date,
        start_time,
        end_time,
        purpose
    } = req.body;


    // Check required fields

    if (
        !room_id ||
        !name ||
        !date ||
        !start_time ||
        !end_time ||
        !purpose
    ) {

        return res.status(400).send(
            "All fields are required"
        );

    }


    // Check time

    if (start_time >= end_time) {

        return res.status(400).send(
            "End time must be after start time"
        );

    }


    // ==============================
    // CHECK ROOM AVAILABILITY
    // ==============================

    const checkSql = `
        SELECT *
        FROM bookings
        WHERE room_id = ?
        AND date = ?
        AND status != 'Rejected'
        AND status != 'Cancelled'
        AND start_time < ?
        AND end_time > ?
    `;


    db.query(
        checkSql,
        [
            room_id,
            date,
            end_time,
            start_time
        ],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).send(
                    "Error checking room availability"
                );

            }


            // Room already booked

            if (result.length > 0) {

                return res.status(400).send(
                    "Room is already booked for this time"
                );

            }


            // ==============================
            // SAVE BOOKING
            // ==============================

            const sql = `
                INSERT INTO bookings
                (
                    room_id,
                    user_name,
                    date,
                    start_time,
                    end_time,
                    purpose,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;


            db.query(
                sql,
                [
                    room_id,
                    name,
                    date,
                    start_time,
                    end_time,
                    purpose,
                    "Pending"
                ],
                (err, result) => {

                    if (err) {

                        console.log(err);

                        return res.status(500).send(
                            "Booking failed"
                        );

                    }


                    res.send(
                        "Booking submitted successfully. Waiting for approval."
                    );

                }
            );

        }
    );

});


// ==============================
// VIEW ALL BOOKINGS
// ==============================

app.get("/bookings", (req, res) => {

    const sql = `
        SELECT *
        FROM bookings
        ORDER BY date, start_time
    `;


    db.query(
        sql,
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).send(
                    "Cannot get bookings"
                );

            }


            res.send(result);

        }
    );

});


// ==============================
// CONFIRM BOOKING
// ==============================

app.put("/bookings/:id/confirm", (req, res) => {

    const id = req.params.id;


    const sql = `
        UPDATE bookings
        SET status = 'Confirmed'
        WHERE id = ?
        AND status = 'Pending'
    `;


    db.query(
        sql,
        [id],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).send(
                    "Cannot confirm booking"
                );

            }


            if (result.affectedRows === 0) {

                return res.status(400).send(
                    "Booking is not pending or was not found"
                );

            }


            res.send(
                "Booking confirmed successfully"
            );

        }
    );

});


// ==============================
// REJECT BOOKING
// ==============================

app.put("/bookings/:id/reject", (req, res) => {

    const id = req.params.id;


    const sql = `
        UPDATE bookings
        SET status = 'Rejected'
        WHERE id = ?
        AND status = 'Pending'
    `;


    db.query(
        sql,
        [id],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).send(
                    "Cannot reject booking"
                );

            }


            if (result.affectedRows === 0) {

                return res.status(400).send(
                    "Booking is not pending or was not found"
                );

            }


            res.send(
                "Booking rejected successfully"
            );

        }
    );

});


// ==============================
// CANCEL BOOKING
// ==============================

app.delete("/bookings/:id", (req, res) => {

    const id = req.params.id;


    const sql = `
        UPDATE bookings
        SET status = 'Cancelled'
        WHERE id = ?
        AND status IN ('Pending', 'Confirmed')
    `;


    db.query(
        sql,
        [id],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).send(
                    "Cancel failed"
                );

            }


            if (result.affectedRows === 0) {

                return res.status(400).send(
                    "Booking cannot be cancelled or was not found"
                );

            }


            res.send(
                "Booking cancelled successfully"
            );

        }
    );

});


// ==============================
// START SERVER
// ==============================

app.listen(5000, () => {

    console.log(
        "Server running on port 5000"
    );

});