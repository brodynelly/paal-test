// Switch to the admin database
db = db.getSiblingDB("admin");

// Create a root user if it doesn't exist
db.createUser({
  user: "PAAL",
  pwd: "PAAL",
  roles: [ { role: "root", db: "admin" } ]
});
