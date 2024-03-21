const express = require('express');
const mysql = require('mysql');

const app = express();
app.use(express.json());

const connection = mysql.createConnection({
  host: 'sql5.freesqldatabase.com',
  user: 'sql5693290',
  password: 'HpEALIJBct',
  database: 'sql5693290'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database!');
});

// Endpoint to get leaderboard entries
app.get('/leaderboard', (req, res) => {
  connection.query('SELECT * FROM leaderboard ORDER BY lap_time ASC', (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(results);
    }
  });
});

// Endpoint to add a new leaderboard entry
app.post('/leaderboard', (req, res) => {
  const { driverName, trackName, carName, lapTime, youtubeLink } = req.body;
  connection.query('INSERT INTO leaderboard (driver_name, track_name, car_name, lap_time, youtube_link) VALUES (?, ?, ?, ?, ?)',
    [driverName, trackName, carName, lapTime, youtubeLink],
    (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.sendStatus(201); // Created
      }
    }
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

document.addEventListener("DOMContentLoaded", function() {
    // Function to fetch and display leaderboard data
    function fetchLeaderboard() {
      fetch('/leaderboard') // Fetch leaderboard data from the server
        .then(response => response.json()) // Parse the JSON response
        .then(data => {
          // Clear the current leaderboard table
          const leaderboardTable = document.getElementById('leaderboard');
          leaderboardTable.innerHTML = ''; // Clear existing rows
  
          // Loop through the data and add rows to the leaderboard table
          data.forEach((entry, index) => {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
              <td>${index + 1}</td>
              <td>${entry.driver_name}</td>
              <td>${entry.track_name}</td>
              <td>${entry.car_name}</td>
              <td>${entry.lap_time}</td>
              <td><a href="${entry.youtube_link}" target="_blank">Watch</a></td>
            `;
            leaderboardTable.appendChild(newRow);
          });
        })
        .catch(error => console.error('Error fetching leaderboard:', error));
    }
  
    // Call fetchLeaderboard() function to initially load the leaderboard
    fetchLeaderboard();
  
    // Add event listener to the leaderboardForm for form submission
    document.getElementById('leaderboardForm').addEventListener('submit', function(event) {
      event.preventDefault();
  
      // Get form data
      const formData = new FormData(this);
  
      // Convert form data to JSON
      const jsonObject = {};
      formData.forEach((value, key) => {
        jsonObject[key] = value;
      });
  
      // POST form data to server
      fetch('/leaderboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonObject)
      })
        .then(response => {
          if (response.ok) {
            // If successful, fetch and display updated leaderboard
            fetchLeaderboard();
            // Reset form fields
            this.reset();
          } else {
            throw new Error('Failed to add entry to leaderboard');
          }
        })
        .catch(error => console.error('Error adding entry to leaderboard:', error));
    });
  });