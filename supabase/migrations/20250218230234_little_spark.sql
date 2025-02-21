/*
  # Initial Schema Setup for IoT Pig Monitoring

  1. New Tables
    - pig_group: Groups of pigs in stalls
    - pig: Individual pig information
    - bcs_data: Body Condition Score measurements
    - posture: Posture monitoring data
    - devices: IoT device information
    - device_sens_data: Sensor data from devices

  2. Security
    - Enable RLS on all tables
    - Add read access policies for authenticated users
*/

-- Create tables in public schema
CREATE TABLE IF NOT EXISTS pig_group (
  group_id INTEGER PRIMARY KEY,
  stall_id INTEGER,
  farm_id INTEGER,
  special TEXT
);

CREATE TABLE IF NOT EXISTS pig (
  pig_id INTEGER PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES pig_group(group_id),
  breed VARCHAR(50),
  age INTEGER,
  parity INTEGER,
  insertion_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_update_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bcs_data (
  record_id SERIAL PRIMARY KEY,
  pig_id INTEGER NOT NULL REFERENCES pig(pig_id),
  bcs_score DOUBLE PRECISION NOT NULL,
  timestamp_info TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posture (
  record_id SERIAL PRIMARY KEY,
  pig_id INTEGER NOT NULL REFERENCES pig(pig_id),
  posture INTEGER NOT NULL,
  timestamp_info TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS devices (
  device_id SERIAL PRIMARY KEY,
  device_name TEXT NOT NULL,
  device_type TEXT,
  insertion_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS device_sens_data (
  record_id SERIAL PRIMARY KEY,
  device_id INTEGER NOT NULL REFERENCES devices(device_id),
  temperature DOUBLE PRECISION NOT NULL,
  entry_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE pig_group ENABLE ROW LEVEL SECURITY;
ALTER TABLE pig ENABLE ROW LEVEL SECURITY;
ALTER TABLE bcs_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE posture ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_sens_data ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Enable read access for authenticated users" ON pig_group
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON pig
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON bcs_data
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON posture
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON devices
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON device_sens_data
  FOR SELECT TO authenticated USING (true);