# Backend Set Up
1. Run `npm install`
2. Create a `.env` file inside `backend/`. To test locally, your .env file should look like this:
```
PORT=8000
MONGODB_URI='mongodb://127.0.0.1:27017'
```
4. Run `npm run dev` to launch server in dev

# Environment
You need environment variables run services in the application (like MongoDB). These are the environment variables you'll need in a `.env` file in the root backend directory *I believe*.
```
MONGODB_URI:<URI from our MongoDB atlas account>
PORT:<Port to run the project on> // not sure if we need this
```

# MongoDB Under Construction ⚠️⚠️⚠️🚧🚧🚧
Here's some information to help you get an idea of how MongoDB works:

## CLI Commands
> Make sure you have Mongo CLI downloaded and working.

`cd` do the project directory and run:
```
mongosh
```
And pray to god it works cause it sux when it doesn't.
Then you can use the `person` schema we created in the `schemas/` directory. In order to do so run:
```
use person
```
Then you can create a new person by running:
```js
db.myCollections.insertOne({ 
    name: "Billy Joe Bob", 
    role: "Argumentative Research Paper" 
    })
```
Here we're creating a collection named `myCollection` and inserting a person in there with those values.

You can also run `find()` functions using:
```js
db.myCollections.find({ name: "Billy Joe Bob" })
```
Here we're filtering by name of the person in the db.

```js
db.myCollections.updateOne({name: "Billy Joe Bob"}, {$set{ name: "Phil" }})
```
here ur doing `.updateOne(<filter>, {$set<updated: value>})

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