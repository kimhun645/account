import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// Simple in-memory storage for demo
const users = new Map();
const sessions = new Map();

// Initialize default user
const initUser = async () => {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync("korat123", salt, 64)) as Buffer;
  const hashedPassword = `${buf.toString("hex")}.${salt}`;
  
  users.set("korat123", {
    id: 1,
    username: "korat123",
    password: hashedPassword
  });
};

initUser();

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Simple session management
function generateSessionId() {
  return randomBytes(32).toString('hex');
}

function getSession(sessionId: string) {
  return sessions.get(sessionId);
}

function createSession(userId: number) {
  const sessionId = generateSessionId();
  sessions.set(sessionId, { userId, createdAt: Date.now() });
  return sessionId;
}

function deleteSession(sessionId: string) {
  sessions.delete(sessionId);
}

// Sample data
const budgetItems = [
  { id: 1, category: "เงินเดือน", description: "เงินเดือน", currentYear: 2000000, compareYear: 1900000 },
  { id: 2, category: "ค่าจ้าง", description: "ค่าจ้างลูกจ้าง", currentYear: 500000, compareYear: 450000 }
];

const employees = [
  { id: 1, name: "นายสมชาย", position: "ผู้อำนวยการ", level: "7", salary: 50000, status: "Active" },
  { id: 2, name: "นางสาวสมหญิง", position: "รองผู้อำนวยการ", level: "6", salary: 45000, status: "Active" }
];

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method, url } = req;
  const path = url || '/';

  try {
    // Authentication endpoints
    if (path === '/api/login' && method === 'POST') {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
      }

      const user = users.get(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const sessionId = createSession(user.id);
      res.setHeader('Set-Cookie', `session=${sessionId}; Path=/; HttpOnly; SameSite=Strict`);
      return res.status(200).json({ id: user.id, username: user.username });
    }

    if (path === '/api/logout' && method === 'POST') {
      const cookies = req.headers.cookie;
      if (cookies) {
        const sessionMatch = cookies.match(/session=([^;]+)/);
        if (sessionMatch) {
          deleteSession(sessionMatch[1]);
        }
      }
      res.setHeader('Set-Cookie', 'session=; Path=/; HttpOnly; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
      return res.status(200).end();
    }

    if (path === '/api/user' && method === 'GET') {
      const cookies = req.headers.cookie;
      if (!cookies) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const sessionMatch = cookies.match(/session=([^;]+)/);
      if (!sessionMatch) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const session = getSession(sessionMatch[1]);
      if (!session) {
        return res.status(401).json({ message: 'Invalid session' });
      }

      const user = Array.from(users.values()).find((u: any) => u.id === session.userId);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      return res.status(200).json({ id: user.id, username: user.username });
    }

    // Data endpoints
    if (path === '/api/budget-items' && method === 'GET') {
      return res.status(200).json(budgetItems);
    }

    if (path === '/api/employees' && method === 'GET') {
      return res.status(200).json(employees);
    }

    if (path === '/api/master-rates' && method === 'GET') {
      return res.status(200).json([]);
    }

    if (path === '/api/travel-expenses' && method === 'GET') {
      return res.status(200).json([]);
    }

    if (path === '/api/assistance-payments' && method === 'GET') {
      return res.status(200).json([]);
    }

    if (path === '/api/overtime-payments' && method === 'GET') {
      return res.status(200).json([]);
    }

    if (path === '/api/working-days' && method === 'GET') {
      return res.status(200).json([]);
    }

    // Frontend routes
    if (!path.startsWith('/api')) {
      return res.status(200).send(`
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ระบบจัดการงบประมาณไทย</title>
</head>
<body>
    <div id="root"></div>
    <script>
        // Redirect to your actual frontend URL
        window.location.href = "https://thai-budget-system-git-main-sorawitttos-projects.vercel.app";
    </script>
</body>
</html>
      `);
    }

    // 404 for unknown API routes
    return res.status(404).json({ message: 'API endpoint not found' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}