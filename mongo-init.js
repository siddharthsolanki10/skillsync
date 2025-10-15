// MongoDB Initialization Script
// This script creates the SkillSync database and sets up initial collections

db = db.getSiblingDB("skillsync");

// Create collections with validation
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "password", "name"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "must be a valid email address",
        },
        password: {
          bsonType: "string",
          description: "must be a hashed password string",
        },
        name: {
          bsonType: "string",
          description: "must be a string",
        },
      },
    },
  },
});

db.createCollection("roadmaps");
db.createCollection("userprogresses");
db.createCollection("careers");
db.createCollection("documentations");
db.createCollection("learningpaths");

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.roadmaps.createIndex({ userId: 1, field: 1, level: 1 });
db.roadmaps.createIndex({ roadmapId: 1 }, { unique: true });
db.userprogresses.createIndex({ userId: 1, roadmapId: 1 });

print("✅ SkillSync database initialized successfully!");
print(
  "📦 Collections created: users, roadmaps, userprogresses, careers, documentations, learningpaths"
);
print("🔍 Indexes created for optimized queries");
