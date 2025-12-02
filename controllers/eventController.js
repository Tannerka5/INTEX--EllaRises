const db = require("../db");

module.exports = {

  // LIST
  async list(req, res) {
    const result = await db.query(`
      SELECT eo.*, 
             et.eventname AS templatename,
             (SELECT COUNT(*) 
              FROM registration r 
              WHERE r.eventoccurrenceid = eo.eventoccurrenceid) AS attendees
      FROM eventoccurrence eo
      LEFT JOIN eventtemplate et 
        ON et.eventtemplateid = eo.eventtemplateid
      ORDER BY eo.eventdatetimestart ASC
    `);

    res.render("events/index", { events: result.rows });
  },

  // NEW FORM
  async newForm(req, res) {
    const templates = await db.query(`
      SELECT * FROM eventtemplate ORDER BY eventname ASC
    `);

    res.render("events/new", { templates: templates.rows });
  },

  // CREATE
  async create(req, res) {
    const { 
      eventtemplateid,
      eventname,
      eventdatetimestart,
      eventdatetimeend,
      eventlocation,
      eventcapacity,
      eventregistrationdeadline
    } = req.body;

    await db.query(`
      INSERT INTO eventoccurrence
        (eventtemplateid, eventname, eventdatetimestart, eventdatetimeend,
         eventlocation, eventcapacity, eventregistrationdeadline)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
    `, [
      eventtemplateid,
      eventname,
      eventdatetimestart,
      eventdatetimeend || null,
      eventlocation,
      eventcapacity || null,
      eventregistrationdeadline || null
    ]);

    res.redirect("/events");
  },

  // EDIT FORM
  async editForm(req, res) {
    const id = req.params.id;

    const eventRes = await db.query(`
      SELECT * FROM eventoccurrence WHERE eventoccurrenceid = $1
    `, [id]);

    if (eventRes.rows.length === 0) return res.status(404).render("404");

    const event = eventRes.rows[0];

    const templates = await db.query(`
      SELECT * FROM eventtemplate ORDER BY eventname ASC
    `);

    event.startLocal = event.eventdatetimestart.toISOString().slice(0,16);
    event.endLocal = event.eventdatetimeend ? event.eventdatetimeend.toISOString().slice(0,16) : "";
    event.deadlineLocal = event.eventregistrationdeadline ? event.eventregistrationdeadline.toISOString().slice(0,16) : "";

    res.render("events/edit", { event, templates: templates.rows });
  },

  // UPDATE
  async update(req, res) {
    const id = req.params.id;

    const {
      eventtemplateid,
      eventname,
      eventdatetimestart,
      eventdatetimeend,
      eventlocation,
      eventcapacity,
      eventregistrationdeadline
    } = req.body;

    await db.query(`
      UPDATE eventoccurrence
      SET eventtemplateid=$1,
          eventname=$2,
          eventdatetimestart=$3,
          eventdatetimeend=$4,
          eventlocation=$5,
          eventcapacity=$6,
          eventregistrationdeadline=$7
      WHERE eventoccurrenceid=$8
    `, [
      eventtemplateid,
      eventname,
      eventdatetimestart,
      eventdatetimeend || null,
      eventlocation,
      eventcapacity || null,
      eventregistrationdeadline || null,
      id
    ]);

    res.redirect("/events");
  },

  // DELETE
  async delete(req, res) {
    await db.query(
      "DELETE FROM eventoccurrence WHERE eventoccurrenceid = $1",
      [req.params.id]
    );
    res.redirect("/events");
  }
};