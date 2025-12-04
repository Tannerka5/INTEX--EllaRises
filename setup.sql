-- ============================================================
-- TABLE: participant
-- ============================================================
CREATE TABLE participant (
    participantid INTEGER PRIMARY KEY,
    participantemail TEXT UNIQUE NOT NULL,
    participantfirstname TEXT,
    participantlastname TEXT,
    participantdob DATE,
    participantrole TEXT,
    participantphone TEXT,
    participantcity TEXT,
    participantstate TEXT,
    participantzip TEXT,
    participantschooloremployer TEXT,
    participantfieldofinterest TEXT
);

-- ============================================================
-- TABLE: eventtemplate
-- ============================================================
CREATE TABLE eventtemplate (
    eventtemplateid INTEGER PRIMARY KEY,
    eventname TEXT UNIQUE NOT NULL,
    eventtype TEXT,
    eventdescription TEXT,
    eventrecurrencepattern TEXT,
    eventdefaultcapacity INTEGER
);

-- ============================================================
-- TABLE: eventoccurrence
-- ============================================================
CREATE TABLE eventoccurrence (
    eventoccurrenceid INTEGER PRIMARY KEY,
    eventtemplateid INTEGER NOT NULL REFERENCES eventtemplate(eventtemplateid),
    eventdatetimestart TIMESTAMP NOT NULL,
    eventdatetimeend TIMESTAMP,
    eventlocation TEXT,
    eventcapacity INTEGER,
    eventregistrationdeadline TIMESTAMP
);

-- ============================================================
-- TABLE: registration
-- ============================================================
CREATE TABLE registration (
    registrationid INTEGER PRIMARY KEY,
    participantid INTEGER NOT NULL REFERENCES participant(participantid),
    eventoccurrenceid INTEGER NOT NULL REFERENCES eventoccurrence(eventoccurrenceid),
    registrationstatus TEXT,
    registrationattendedflag SMALLINT,
    registrationcheckintime TIMESTAMP,
    registrationcreatedat TIMESTAMP
);

-- Unique constraint: one registration per participant per event occurrence
CREATE UNIQUE INDEX registration_unique_pair
    ON registration (participantid, eventoccurrenceid);

-- ============================================================
-- TABLE: survey
-- ============================================================
CREATE TABLE survey (
    surveyid INTEGER PRIMARY KEY,
    participantid INTEGER NOT NULL REFERENCES participant(participantid),
    eventoccurrenceid INTEGER NOT NULL REFERENCES eventoccurrence(eventoccurrenceid),
    surveysatisfactionscore INTEGER,
    surveyusefulnessscore INTEGER,
    surveyinstructorscore INTEGER,
    surveyrecommendationscore INTEGER,
    surveyoverallscore INTEGER,
    surveynpsbucket TEXT,
    surveycomments TEXT,
    surveysubmissiondate TIMESTAMP
);

-- Unique constraint: one survey per participant per event occurrence
CREATE UNIQUE INDEX survey_unique_pair
    ON survey (participantid, eventoccurrenceid);

-- ============================================================
-- TABLE: milestone
-- ============================================================
CREATE TABLE milestone (
    milestoneid INTEGER PRIMARY KEY,
    participantid INTEGER NOT NULL REFERENCES participant(participantid),
    milestonetitle TEXT NOT NULL,
    milestonedate DATE NOT NULL
);

-- ============================================================
-- TABLE: donation
-- ============================================================
CREATE TABLE donation (
    donationid INTEGER PRIMARY KEY,
    participantid INTEGER NOT NULL REFERENCES participant(participantid),
    donationdate DATE NOT NULL,
    donationamount NUMERIC
);

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL UNIQUE REFERENCES participant(participantemail),
    password VARCHAR(100) NOT NULL,
    role VARCHAR(7) NOT NULL,
    created_date DATE NOT NULL DEFAULT CURRENT_DATE,
    full_name VARCHAR(50) NOT NULL
);
