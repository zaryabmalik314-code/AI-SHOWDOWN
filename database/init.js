const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/orphanage_ai'
});

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS children (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        age INTEGER NOT NULL,
        gender VARCHAR(10),
        photo_url TEXT,
        admitted_date DATE DEFAULT CURRENT_DATE,
        medical_notes TEXT,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS health_records (
        id SERIAL PRIMARY KEY,
        child_id INTEGER REFERENCES children(id) ON DELETE CASCADE,
        record_type VARCHAR(50) NOT NULL,
        description TEXT,
        doctor_name VARCHAR(100),
        record_date DATE DEFAULT CURRENT_DATE,
        next_due DATE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS visitors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        cnic VARCHAR(15),
        phone VARCHAR(15),
        purpose TEXT,
        photo_url TEXT,
        check_in TIMESTAMP DEFAULT NOW(),
        check_out TIMESTAMP,
        status VARCHAR(20) DEFAULT 'checked_in'
      );

      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) DEFAULT 'medium',
        message TEXT NOT NULL,
        zone VARCHAR(50),
        snapshot_url TEXT,
        acknowledged BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS zones (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        description TEXT,
        camera_url TEXT,
        expected_count INTEGER DEFAULT 0,
        current_count INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active'
      );

      CREATE TABLE IF NOT EXISTS activity_log (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        description TEXT,
        zone_id INTEGER REFERENCES zones(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Seed zones
    const zoneCount = await client.query('SELECT COUNT(*) FROM zones');
    if (parseInt(zoneCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO zones (name, description, expected_count) VALUES
        ('Main Hall', 'Central play and activity area', 15),
        ('Dormitory A', 'Boys sleeping quarters', 10),
        ('Dormitory B', 'Girls sleeping quarters', 10),
        ('Kitchen', 'Food preparation area - restricted', 3),
        ('Garden', 'Outdoor play area', 12),
        ('Main Gate', 'Entry and exit point', 0),
        ('Study Room', 'Homework and tutoring area', 8);
      `);
    }

    // Seed sample children
    const childCount = await client.query('SELECT COUNT(*) FROM children');
    if (parseInt(childCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO children (name, age, gender, admitted_date, medical_notes) VALUES
        ('Ahmed Khan', 8, 'Male', '2024-01-15', 'Healthy, regular checkups'),
        ('Fatima Ali', 6, 'Female', '2024-03-20', 'Mild asthma, inhaler prescribed'),
        ('Hassan Raza', 10, 'Male', '2023-11-01', 'No known conditions'),
        ('Ayesha Bibi', 7, 'Female', '2024-05-10', 'Allergic to peanuts'),
        ('Usman Tariq', 9, 'Male', '2023-08-22', 'Wears glasses, annual eye checkup'),
        ('Zainab Noor', 5, 'Female', '2024-07-01', 'Vaccinations up to date'),
        ('Bilal Ahmed', 11, 'Male', '2023-06-15', 'Fractured arm (healed)'),
        ('Sana Malik', 8, 'Female', '2024-02-28', 'Regular dental checkups needed');
      `);
    }

    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Database init error:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

initDB();
