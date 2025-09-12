db.getSiblingDB('admin').auth(
    "root",
    "root"
);

db.createUser({
    user: "quadcoach",
    pwd: "quadcoach",
    roles: [
        {
            role: "readWrite",
            db: "quadcoach"
        }
    ],
    mechanisms: ["SCRAM-SHA-1", "SCRAM-SHA-256"]
});