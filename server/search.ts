// Simple user search for messaging
export const searchEndpoint = (req: any, res: any) => {
  const { q } = req.query;
  
  if (!q || typeof q !== 'string') {
    return res.json([]);
  }
  
  // Test users for the search functionality
  const users = [
    {
      id: "550e8400-e29b-41d4-a716-446655440002",
      username: "indieartist", 
      firstName: "Indie",
      lastName: "Artist",
      role: "artist",
      profileImage: null,
      isVerified: true
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440003",
      username: "musiclover",
      firstName: "Music", 
      lastName: "Lover",
      role: "fan",
      profileImage: null,
      isVerified: false
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440004", 
      username: "beatmaker",
      firstName: "Beat",
      lastName: "Maker", 
      role: "artist",
      profileImage: null,
      isVerified: false
    }
  ];
  
  const query = q.toLowerCase();
  const filtered = users.filter((user: any) => 
    user.username.toLowerCase().includes(query) ||
    user.firstName.toLowerCase().includes(query) ||
    user.lastName.toLowerCase().includes(query)
  );
  
  res.json(filtered);
};