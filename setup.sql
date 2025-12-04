
DROP TABLE IF EXISTS donation CASCADE;
DROP TABLE IF EXISTS milestone CASCADE;
DROP TABLE IF EXISTS survey CASCADE;
DROP TABLE IF EXISTS registration CASCADE;
DROP TABLE IF EXISTS eventoccurrence CASCADE;
DROP TABLE IF EXISTS eventtemplate CASCADE;
DROP TABLE IF EXISTS participant CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE participant (
    participantid INTEGER PRIMARY KEY,
    participantemail TEXT UNIQUE NOT NULL,
    participantpassword VARCHAR(255) NOT NULL DEFAULT 'password123',
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

CREATE TABLE eventtemplate (
    eventtemplateid INTEGER PRIMARY KEY,
    eventname TEXT UNIQUE NOT NULL,
    eventtype TEXT,
    eventdescription TEXT,
    eventrecurrencepattern TEXT,
    eventdefaultcapacity INTEGER
);

CREATE TABLE eventoccurrence (
    eventoccurrenceid INTEGER PRIMARY KEY,
    eventtemplateid INTEGER NOT NULL REFERENCES eventtemplate(eventtemplateid),
    eventname TEXT NOT NULL,
    eventdatetimestart TIMESTAMP NOT NULL,
    eventdatetimeend TIMESTAMP,
    eventlocation TEXT,
    eventcapacity INTEGER,
    eventregistrationdeadline TIMESTAMP
);

CREATE TABLE registration (
    registrationid INTEGER PRIMARY KEY,
    participantid INTEGER NOT NULL REFERENCES participant(participantid),
    eventoccurrenceid INTEGER NOT NULL REFERENCES eventoccurrence(eventoccurrenceid),
    registrationstatus TEXT,
    registrationattendedflag SMALLINT,
    registrationcheckintime TIMESTAMP,
    registrationcreatedat TIMESTAMP
);

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

CREATE TABLE milestone (
    milestoneid INTEGER PRIMARY KEY,
    participantid INTEGER NOT NULL REFERENCES participant(participantid),
    milestonetitle TEXT NOT NULL,
    milestonedate DATE NOT NULL
);

CREATE TABLE donation (
    donationid INTEGER PRIMARY KEY,
    participantid INTEGER NOT NULL REFERENCES participant(participantid),
    donationdate DATE NOT NULL,
    donationamount NUMERIC(10,2) NOT NULL
);

CREATE TABLE users (
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    email character varying(50) COLLATE pg_catalog."default" NOT NULL,
    password character varying(100) COLLATE pg_catalog."default" NOT NULL,
    role character varying(7) COLLATE pg_catalog."default" NOT NULL,
    created_date date NOT NULL DEFAULT CURRENT_DATE,
    full_name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id)
);
