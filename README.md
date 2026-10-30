# Task 4 — Database-Driven Web Application

StudentHub is a responsive Student Management System using HTML, CSS, JavaScript, Node.js, Express and MongoDB/Mongoose.

## Files
- `public/index.html` — frontend page
- `public/style.css` — responsive design
- `public/app.js` — frontend CRUD actions
- `server.js` — Express API and MongoDB connection
- `.env.example` — database configuration example
- `start.bat` — Windows launcher

## Run on Windows
1. Extract this ZIP fully (do not run the project from inside the ZIP preview).
2. Open the extracted `task4_fixed` folder in VS Code.
3. Make sure Node.js is installed.
4. Ensure MongoDB Community Server is installed and running, OR create a MongoDB Atlas database and put its connection string in `.env`.
5. Double-click `start.bat`, or run these commands in the VS Code terminal:

   ```powershell
   npm install
   Copy-Item .env.example .env
   npm start
   ```

6. Open `http://localhost:3000` in your browser.

The `.env` file is created automatically by `start.bat` if missing. If you use Atlas, edit `.env` and replace `MONGODB_URI` with your Atlas connection string before starting the app.

## API endpoints
| Method | Endpoint | Operation |
|---|---|---|
| GET | `/api/students` | Read all students |
| POST | `/api/students` | Create a student |
| PUT | `/api/students/:id` | Update a student |
| DELETE | `/api/students/:id` | Delete a student |

## Troubleshooting
- `MongoDB connection failed`: MongoDB is not running or `MONGODB_URI` is incorrect. The app needs a working MongoDB database.
- `npm is not recognized`: install Node.js LTS and reopen VS Code/terminal.
- `EADDRINUSE`: change `PORT=3000` in `.env` to `PORT=3001`, then open `http://localhost:3001`.
- If the page does not load, keep the terminal open and check the error message.
