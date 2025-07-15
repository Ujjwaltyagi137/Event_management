const pool = require("../connection/database")

const createEvent = async (req,res)=>{
    try {
    const {title , Event_Location, Event_Time , Capacity} = req.body;

    if (Capacity>1000) {
        return res.status(400).json({
            success : false,
            error : 'exceed max capacity limit(1000)'
        })
    }
    const event = await pool.query(
        "INSERT INTO Event_Detail (title , Event_Location, Event_Time , Capacity) VALUES ($1, $2, $3, $4) RETURNING *",
        [title , Event_Location, Event_Time , Capacity]
    )
        return res.status(200).json({
            success : true,
            data : event.rows[0],
            error : null
        })
    } catch (error) {
        console.log(`error in creating event ${error.message}`)
        return res.status(500).json({
            success : false,
            data : null,
            error :error.message
        })
    }
}

const deleteEvent = async (req,res)=>{
    try {
        await pool.query("DELETE FROM Event_Detail WHERE Unique_Id = $1", [req.params.id]);
        res.json({ message: "Event deleted" });
    } catch (error) {
        console.log(`Event deletion failed ${error.message}`)
        return res.status(500).json({
            success : false,
            data : null,
            error :error.message
        })
    }
}

const getEvent = async (req,res)=>{
    try {
        const result = await pool.query("SELECT * from Event_Detail") ;
        if(result.rows.length === 0) {
            console.log('Event not found');
            return res.status(400).json({
            success : false,
            error : 'user not found'
        })
        }
        return res.status(200).json({
            success : true,
            data : result.rows,
            error : null
        })
    } catch (error) {
        console.log(`error in fetching event ${error.message}`)
        return res.status(500).json({
            success : false,
            data : null,
            error :error.message
        })
    }
}

const Register = async (req ,res)=>{
    try {
        const {event_id,user_id} = req.body;

        const eventdetail = await pool.query(
      "SELECT * FROM Event_Detail WHERE Unique_Id = $1",
      [event_id]
    );
    const event = eventdetail.rows[0];

    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Event not found",
      });
    }

    if (new Date(event.Event_Time) <= new Date()) {
      return res.status(400).json({
        success: false,
        error: "Cannot register for a past event",
      });
    }

    const countQuery = await pool.query(
      "SELECT COUNT(*) FROM Registrations WHERE event_id = $1",
      [event_id]
    );
    const currentCount = parseInt(countQuery.rows[0].count);

    if (currentCount >= event.Capacity) {
      return res.status(400).json({
        success: false,
        error: "Event is full. Registration not allowed",
      });
    }

        const result = await pool.query(
            "INSERT INTO Registrations (event_id,user_id) VALUES ($1, $2) RETURNING *",
            [event_id,user_id]
        )
        return res.status(200).json({
            success : true,
            data : result.rows[0],
            error : null
        })
    } catch (error) {
        console.log(`User registration failed event ${error.message}`)
        return res.status(500).json({
            success : false,
            data : null,
            error :error.message
        })
    }
}
const getAllRegistration = async (req,res)=>{
    try {
        const result = await pool.query("SELECT * from Registrations") ;
        if(result.rows.length === 0) {
            console.log('Registrations not found');
            return res.status(400).json({
            success : false,
            error : 'Registrations not found'
        })
        }
        return res.status(200).json({
            success : true,
            data : result.rows,
            error : null
        })
    } catch (error) {
        console.log(`Registration fetching failed event ${error.message}`)
        return res.status(500).json({
            success : false,
            data : null,
            error :error.message
        })
    }
}

const cancelRegistration = async (req,res)=>{
    try {
        await pool.query("DELETE FROM Registrations WHERE Unique_Id = $1", [req.params.id]);
        res.json({ message: "Registration deleted" });
    } catch (error) {
        console.log(`Registration cancel failed event ${error.message}`)
        return res.status(500).json({
            success : false,
            data : null,
            error :error.message
        })
    }
}

const upcomingEvent = async (req ,res)=>{
    try {
        const result = await pool.query("SELECT * FROM Event_Detail WHERE Event_Time > NOW() ORDER BY Event_Time ASC");
        return res.status(200).json({
        success: true,
        data: result.rows,
    });
    } catch (error) {
        console.log(`Upcoming event fetch failed ${error.message}`)
        return res.status(500).json({
            success : false,
            data : null,
            error :error.message
        })
    }
}

const eventStats = async (req,res) =>{
    try {
        const result = await pool.query(`
      SELECT 
        e.Unique_Id AS event_id,
        e.Title,
        e.Capacity,
        COUNT(r.Unique_Id) AS total_registrations,
        (e.Capacity - COUNT(r.Unique_Id)) AS remaining_capacity,
        ROUND((COUNT(r.Unique_Id) * 100.0 / NULLIF(e.Capacity, 0)), 2) AS percentage_used
      FROM Event_Detail e
      LEFT JOIN Registrations r ON e.Unique_Id = r.event_id
      GROUP BY e.Unique_Id, e.Title, e.Capacity
      ORDER BY e.Event_Time ASC;
    `);

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
    } catch (error) {
        console.log(`eventStats fetch failed ${error.message}`)
        return res.status(500).json({
            success : false,
            data : null,
            error :error.message
        })
    }
}
module.exports = {createEvent,deleteEvent,getEvent,Register,getAllRegistration,cancelRegistration,upcomingEvent,eventStats};