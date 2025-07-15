this project builkd with Node.js express  and PostgreSQl that allow you proper event managment and it also handle business logic.


#setup instruction :
  git clone (repo clone url)
  cd Event_management
  #install all dependencies 
  npm install
  
#setup .env file
  PORT=5000
  DB_HOST=localhost
  DB_PORT=5432
  DB_USER=your_db_user
  DB_PASSWORD=your_db_password
  DB_NAME=event_management

#database initialization:

  CREATE TABLE Event_Detail (
  Unique_Id SERIAL PRIMARY KEY,
  Title VARCHAR(80),
  Event_Time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  Event_Location TEXT,
  Capacity INT
);

CREATE TABLE User_Entity(
  Unique_Id SERIAL PRIMARY KEY,
  User_Name VARCHAR(40),
  EMAIL TEXT UNIQUE
);

CREATE TABLE Registrations(
  Unique_Id SERIAL PRIMARY KEY,
  event_id INT REFERENCES Event_Detail(Unique_Id) ON DELETE CASCADE,
  user_id INT REFERENCES User_Entity(Unique_Id) ON DELETE CASCADE,
  Time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (event_id, user_id)
);

CREATE OR REPLACE FUNCTION check_event_capacity()
RETURNS TRIGGER AS $$
DECLARE
  current_count INT;
  max_capacity INT;
BEGIN
  SELECT COUNT(*) INTO current_count
  FROM Registrations
  WHERE event_id = NEW.event_id;

  SELECT Capacity INTO max_capacity
  FROM Event_Detail
  WHERE Unique_Id = NEW.event_id;

  IF current_count >= max_capacity THEN
    RAISE EXCEPTION 'Registration failed: event capacity is full (capacity = %)', max_capacity;
  END IF;

  RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER restrict_event_capacity
  BEFORE INSERT ON Registrations
  FOR EACH ROW
  EXECUTE FUNCTION check_event_capacity();

#API description :
  This event management api allow you to create , delete events , registeration for particular events , cancel registration , list of upxcoming event , get all event stats

#example :
  for event creation :
  {
  "title": "Tech Conference",
  "event_time": "2025-08-01T10:00:00Z",
  "location": "New York",
  "capacity": 500
}

