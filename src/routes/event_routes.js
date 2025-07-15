const express = require('express');
const { createEvent, getEvent, Register, getAllRegistration, cancelRegistration, upcomingEvent, eventStats, deleteEvent } = require('../controller/event_controller');

const router = express.Router();

router.post('/create',createEvent);
router.delete('/delete/:id',deleteEvent);
router.get('/events',getEvent);
router.post('/register',Register);
router.get('/allRegister',getAllRegistration);
router.delete("/cancel/:id", cancelRegistration);
router.get('/upcoming',upcomingEvent);
router.get('/stats',eventStats);

module.exports = router