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
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    email character varying(50) COLLATE pg_catalog."default" NOT NULL,
    password character varying(100) COLLATE pg_catalog."default" NOT NULL,
    role character varying(7) COLLATE pg_catalog."default" NOT NULL,
    created_date date NOT NULL DEFAULT CURRENT_DATE,
    full_name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    participantid integer NULL REFERENCES participant(participantid),
    CONSTRAINT users_pkey PRIMARY KEY (id)
);