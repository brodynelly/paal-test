// Switch to the admin database
db = db.getSiblingDB("admin");

// Create a root user
db.createUser({
  user: "PAAL",
  pwd: "PAAL",
  roles: [ { role: "root", db: "admin" } ]
});
