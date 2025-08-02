const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

app.use(cors());
app.use(express.json());

// Hàm đọc danh sách user từ file
function readUsersFromFile() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Hàm ghi danh sách user vào file
function writeUsersToFile(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

// API đăng ký tài khoản
app.post('/api/register', (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.json({ success: false, message: 'Thiếu thông tin đăng ký' });
  }

  const users = readUsersFromFile();
  const existingUser = users.find(u => u.username === username);

  if (existingUser) {
    return res.json({ success: false, message: 'Tài khoản đã tồn tại' });
  }

  users.push({ username, password, role });
  writeUsersToFile(users);
  res.json({ success: true, message: 'Đăng ký thành công' });
});

// API đăng nhập
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const users = readUsersFromFile();
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    res.json({ success: true, message: "Đăng nhập thành công", role: user.role });
  } else {
    res.json({ success: false, message: "Sai tài khoản hoặc mật khẩu" });
  }
});

// API đổi mật khẩu
app.post('/api/reset-password', (req, res) => {
  const { username, newPassword } = req.body;
  const users = readUsersFromFile();
  const user = users.find(u => u.username === username);

  if (user) {
    user.password = newPassword;
    writeUsersToFile(users);
    res.json({ success: true, message: "Đổi mật khẩu thành công" });
  } else {
    res.json({ success: false, message: "Không tìm thấy người dùng" });
  }
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`✅ Backend API đang chạy tại http://localhost:${PORT}`);
});
