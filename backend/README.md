# Backend Set Up
1. Run `npm install`
2. Create a `.env` file inside `backend/` which contains just one line: PORT=8000
3. Run `npm run dev` to launch server in dev

# Environment
You need environment variables run services in the application (like MongoDB). These are the environment variables you'll need in a `.env` file in the root backend directory *I believe*.
```
MONGODB_URI:<URI from our MongoDB atlas account>
PORT:<Port to run the project on> // not sure if we need this
```

# MongoDB Under Construction ⚠️⚠️⚠️🚧🚧🚧
Here's some information to help you get an idea of how MongoDB works:
### Schemas
They are essentially like objects and are created in the `models/` folder.
Example:
```ts
const person = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    // Admin, Volunteer, Customer
    role: {
        type: String,
        required: true,
    }
})
```
In this example a person has two properties a person schema has two properties: `name` and `role` and you can give them **types**. And now you can run queries like
```ts
try {
    const dbMessage = person.create({
    name: "Drizzy Drake",
    role: "Admin", // should make a function to check if Role input is valid
    });
} catch (e) {
    console.log(e);
}
```
In this query you're creating a user with the given info. You can also use variables instead like `name: fullName`.
```ts
person.find({ user: fullName }, "role", function (err, roles) {
    if (err) return handleError(err);
});

```
A query to find a person based on username
>NOTE: 