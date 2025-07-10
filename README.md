# 🍏 WideApple — Interdimensional Fruit Exchange API

[![Built with Cursor](https://img.shields.io/badge/Built%20with-Cursor-blueviolet?logo=cursor&logoColor=white)](https://www.cursor.so/)

**WideApple** is a sci-fi-themed REST API simulating a fictional economy where fruits are traded across alternate dimensions. Explore alien vendors, rare fruits, and interdimensional taxes — all through a modern Python backend.

---

## ⚙️ Tech Stack
- **Backend:** FastAPI (Python)
- **Database:** PostgreSQL + SQLAlchemy
- **Migrations:** Alembic
- **Task Scheduling:** APScheduler
- **Testing:** unittest + FastAPI TestClient
- **Package Manager:** [uv](https://github.com/astral-sh/uv)
- **Containerization:** Docker Compose

---

## 🚀 Features
- `GET /fruits` — List fruits with flavor profiles, rarity, and origins
- `GET /vendors` — View alien vendors and their inventories
- `POST /trade` — Simulate fruit trade across dimensions (with tax logic)
- `GET /prices` — Query historical fruit prices (with filtering by fruit, date range, etc.)
- **Background job:** Simulates and stores daily fruit prices for each fruit

---

## 🐳 Quickstart (Docker Compose)

1. **Clone the repo:**
   ```bash
   git clone https://github.com/yourusername/wide_apple.git
   cd wide_apple
   ```
2. **Build and start services:**
   ```bash
   docker-compose up --build
   ```
   This will:
   - Build the FastAPI app and PostgreSQL containers
   - Run Alembic migrations
   - Start the API at [http://localhost:8000](http://localhost:8000)

3. **API Docs:**
   - Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🧪 Running Tests

**Inside Docker:**
```bash
docker exec -it wide_apple-app-1 uv run python -m unittest discover -v tests
```

---

## 🛠️ Development (Local)

- **Install [uv](https://github.com/astral-sh/uv):**
  ```bash
  pip install uv
  ```
- **Install dependencies:**
  ```bash
  uv sync
  ```
- **Set up PostgreSQL** and update your `DATABASE_URL` in `.env` or environment variables.
- **Run migrations:**
  ```bash
  uv run alembic upgrade head
  ```
- **Start the app:**
  ```bash
  uv run python src/app/main.py
  ```

---

## 🧑‍💻 Contributing
Pull requests welcome! Please add tests for new features and follow the existing code style.

---

## 💡 Built with Cursor
This project was developed using [Cursor](https://www.cursor.com/) — an AI-powered code editor that accelerates development and collaboration.

---

## 📄 License
MIT