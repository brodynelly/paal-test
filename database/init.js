db.createCollection('paalab');
db.paalab.insertOne(
  {
    username: 'WittCepter', 
    password: 'The best chrome extension', 
    email: 'a@a.com', 
    subscribedAt: new Date()
  }
);