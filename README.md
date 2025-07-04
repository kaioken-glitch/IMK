# IMK

# Informed Mkenya

**Informed Mkenya** is a simple, full-stack news/article platform built with vanilla JavaScript, Node.js, and a file-based JSON backend. Users can sign up, log in, create articles, comment, like, save, and interact with posts. The UI is responsive and includes a mobile-friendly navigation menu.

---

## Features

- **User Authentication**: Sign up, log in, and manage sessions (stored in `localStorage`).
- **Profile Setup**: Set alias and profile picture after signup.
- **Article Management**: Create, edit, and delete news articles (only by the author).
- **Interactions**: Like, view, share, save, and comment on articles.
- **Comment System**: Users and post authors can delete comments.
- **Responsive Design**: Mobile navigation menu with hamburger toggle.
- **File-based Backend**: Uses a simple `db.json` file for data storage (no database required).

---

## Project Structure

```
Informed Mkenya/
├── css/
│   └── index.css
├── script/
│   └── app.js
├── assets/
│   └── (images, icons, etc.)
├── db.json
├── server.js
├── index.html
└── README.md
```

---

## Getting Started

### 1. **Clone the Repository**

```bash
git clone https://github.com/yourusername/informed-mkenya.git
cd informed-mkenya
```

### 2. **Install Dependencies**

```bash
npm install express body-parser cors
```

### 3. **Run the Backend Server**

```bash
node server.js
```

- The API will run at [http://localhost:3000](http://localhost:3000)
- Data is stored in `db.json` in the project root.

### 4. **Open the Frontend**

Just open `index.html` in your browser.  
For best results, use [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VS Code or any static server.

---

## Preview

![Preview](./assets/IMKpreview.png)

---

## API Endpoints


| Method | Endpoint         | Description            |
|--------|------------------|------------------------|
| GET    | `/users`         | List all users         |
| GET    | `/users/:id`     | Get user by ID         |
| POST   | `/users`         | Create new user        |
| PATCH  | `/users/:id`     | Update user            |
| GET    | `/posts`         | List all posts         |
| GET    | `/posts/:id`     | Get post by ID         |
| POST   | `/posts`         | Create new post        |
| PATCH  | `/posts/:id`     | Update post            |
| DELETE | `/posts/:id`     | Delete post            |

All data is stored in `db.json`.

---

## Usage Notes

- **Session**: User session is stored in `localStorage` and expires after ~2 months.
- **Profile Images**: Uploaded as base64 strings and stored in the user object.
- **Markdown**: Article content supports Markdown formatting.
- **Mobile Menu**: Hamburger toggles `.mobileNavOverlay` with `.show` class for mobile navigation.

---

## Customization

- **Styling**: Edit `css/index.css` for custom styles.
- **Assets**: Place images/icons in the `assets/` folder.
- **Backend**: For production, consider replacing the file-based backend with a real database.

---

## Troubleshooting

- **Page reloads on button click**: Ensure all action buttons use `type="button"` and are not inside a `<form>`.
- **Mobile menu not showing**: Make sure `.mobileNavOverlay.show { display: flex !important; }` is in your CSS and JS toggles the `.show` class.
- **CORS issues**: The backend uses CORS by default, but check your browser console for errors.

---

## License

MIT License

---

## Credits

- [Font Awesome](https://fontawesome.com/) for icons
- [Marked.js](https://marked.js.org/) for Markdown parsing

---

## Author

[Kaioken-Glitch]  

---