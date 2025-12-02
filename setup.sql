
DROP TABLE IF EXISTS donation CASCADE;
DROP TABLE IF EXISTS milestone CASCADE;
DROP TABLE IF EXISTS survey CASCADE;
DROP TABLE IF EXISTS registration CASCADE;
DROP TABLE IF EXISTS eventoccurrence CASCADE;
DROP TABLE IF EXISTS eventtemplate CASCADE;
DROP TABLE IF EXISTS participant CASCADE;

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


INSERT INTO eventtemplate (eventtemplateid, eventname)
VALUES 
  (1, 'STEAM Workshop'),
  (2, 'Ballet Practice'),
  (3, 'Mentorship Session'),
  (4, 'Arts & Culture Event');