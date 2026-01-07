const fs = require('fs');
const db = require('./db'); // this loads the database connection from db.js

// Read schema.sql file
const schema = fs.readFileSync('./schema.sql', 'utf8');

// Run the SQL commands inside the schema file
db.exec(schema, (err) => {
  if (err) {
    console.error("!! Failed to execute schema:", err.message);
  } else {
    console.log("Database schema created successfully.");
  }
});
