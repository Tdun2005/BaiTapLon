const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 2704;

// File paths
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const DEVICES_FILE = path.join(__dirname, 'data', 'devices.json');
const DELETED_DEVICES_FILE = path.join(__dirname, 'data', 'deleted_devices.json');
const BORROW_REQUESTS_FILE = path.join(__dirname, 'data', 'borrow_requests.json');
const REPORTS_FILE = path.join(__dirname, 'data', 'device-reports.json');
const CLASSIFIED_DEVICES_FILE = path.join(__dirname, 'data', 'classified-devices.json'); // ✅ THÊM

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});
app.options('*', cors());
app.use('/data', express.static(path.join(__dirname, 'data')));

// Utility functions
function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return [];
  }
}
function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// ========== USERS ==========
app.post('/api/register', (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role)
    return res.json({ success: false, message: 'Thiếu thông tin đăng ký' });

  const users = readJSON(USERS_FILE);
  if (users.find(u => u.username === username))
    return res.json({ success: false, message: 'Tài khoản đã tồn tại' });

  users.push({ username, password, role });
  writeJSON(USERS_FILE, users);
  res.json({ success: true, message: 'Đăng ký thành công' });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.username === username && u.password === password);
  if (user)
    res.json({ success: true, message: "Đăng nhập thành công", role: user.role });
  else
    res.json({ success: false, message: "Sai tài khoản hoặc mật khẩu" });
});

app.post('/api/reset-password', (req, res) => {
  const { username, newPassword } = req.body;
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.username === username);
  if (user) {
    user.password = newPassword;
    writeJSON(USERS_FILE, users);
    res.json({ success: true, message: "Đổi mật khẩu thành công" });
  } else {
    res.json({ success: false, message: "Không tìm thấy người dùng" });
  }
});

// ========== DEVICES ==========
app.get('/api/devices', (req, res) => {
  res.json({ success: true, data: readJSON(DEVICES_FILE) });
});

app.post('/api/devices', (req, res) => {
  const { id, name, type, status, date, desc } = req.body;
  if (!id || !name || !type || !status || !date)
    return res.status(400).json({ success: false, message: "Thiếu thông tin thiết bị" });

  const devices = readJSON(DEVICES_FILE);
  if (devices.find(d => d.id === id))
    return res.status(409).json({ success: false, message: "ID đã tồn tại" });

  const newDevice = { id, name, type, status, date, desc };
  devices.push(newDevice);
  writeJSON(DEVICES_FILE, devices);
  res.json({ success: true, message: "Thêm thiết bị thành công", data: newDevice });
});

app.get('/api/devices/:id', (req, res) => {
  const deviceId = parseInt(req.params.id);
  const devices = readJSON(DEVICES_FILE);
  const device = devices.find(d => d.id === deviceId);
  if (!device)
    return res.status(404).json({ success: false, message: "Thiết bị không tồn tại" });

  res.json({ success: true, data: device });
});

app.put('/api/devices/:id', (req, res) => {
  const deviceId = parseInt(req.params.id);
  const { status, date, desc } = req.body;

  const devices = readJSON(DEVICES_FILE);
  const index = devices.findIndex(d => d.id === deviceId);
  if (index === -1)
    return res.status(404).json({ success: false, message: "Không tìm thấy thiết bị" });

  devices[index].status = status || devices[index].status;
  devices[index].date = date || devices[index].date;
  devices[index].desc = desc || devices[index].desc;

  writeJSON(DEVICES_FILE, devices);
  res.json({ success: true, message: "Cập nhật thiết bị thành công", data: devices[index] });
});

app.delete('/api/devices/:id', (req, res) => {
  const deviceId = parseInt(req.params.id);
  const devices = readJSON(DEVICES_FILE);
  const index = devices.findIndex(d => d.id === deviceId);
  if (index === -1)
    return res.status(404).json({ success: false, message: "Thiết bị không tồn tại" });

  const removed = devices.splice(index, 1)[0];
  writeJSON(DEVICES_FILE, devices);

  const history = readJSON(DELETED_DEVICES_FILE);
  const now = new Date().toLocaleString('vi-VN');
  history.push({ ...removed, deletedAt: now });
  writeJSON(DELETED_DEVICES_FILE, history);

  res.json({ success: true, message: "Thiết bị đã bị xoá", data: removed });
});

// ========== GỬI YÊU CẦU MƯỢN ==========
app.post('/api/borrow', (req, res) => {
  const { deviceId, borrowerName, days, reason, signature } = req.body;

  if (!deviceId || !borrowerName || !days || !reason || !signature) {
    return res.status(400).json({ success: false, message: "Thiếu thông tin yêu cầu" });
  }

  const devices = readJSON(DEVICES_FILE);
  const numericDeviceId = parseInt(deviceId);
  const foundDevice = devices.find(d => d.id === numericDeviceId);

  if (!foundDevice) {
    return res.status(404).json({ success: false, message: "Không tìm thấy thiết bị theo ID" });
  }

  const requests = readJSON(BORROW_REQUESTS_FILE);
  const now = new Date().toLocaleString('vi-VN');

  const newRequest = {
    id: Date.now(),
    deviceId: numericDeviceId,
    deviceName: foundDevice.name,
    borrowerName,
    days,
    reason,
    signature,
    submittedAt: now
  };

  requests.push(newRequest);
  writeJSON(BORROW_REQUESTS_FILE, requests);

  console.log("📩 Đã nhận đơn mượn thiết bị:", newRequest);
  res.json({ success: true, message: "Đã gửi yêu cầu mượn thiết bị", data: newRequest });
});

// ========== DUYỆT / XOÁ YÊU CẦU MƯỢN ==========
app.post('/api/borrow/approve', (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ success: false, message: "Thiếu ID đơn mượn" });

  let requests = readJSON(BORROW_REQUESTS_FILE);
  const index = requests.findIndex(r => r.id === parseInt(id));

  if (index === -1) return res.status(404).json({ success: false, message: "Không tìm thấy đơn mượn" });

  const removed = requests.splice(index, 1)[0];
  writeJSON(BORROW_REQUESTS_FILE, requests);

  console.log("✅ Đã duyệt và xoá đơn mượn:", removed);
  res.json({ success: true, message: "Đơn mượn đã được xử lý và xoá", data: removed });
});

// ========== BÁO CÁO SỰ CỐ ==========
app.post('/api/report', (req, res) => {
  const { deviceId, issue, returnDate, image } = req.body;
  if (!deviceId || !issue || !returnDate) {
    return res.status(400).json({ success: false, message: "Thiếu thông tin báo cáo" });
  }

  const devices = readJSON(DEVICES_FILE);
  const numericDeviceId = parseInt(deviceId);
  const foundDevice = devices.find(d => d.id === numericDeviceId);
  if (!foundDevice) {
    return res.status(404).json({ success: false, message: "Không tìm thấy thiết bị theo ID" });
  }

  const reports = readJSON(REPORTS_FILE);
  const now = new Date().toLocaleString('vi-VN');

  const newReport = {
    id: Date.now(),
    deviceId: numericDeviceId,
    deviceName: foundDevice.name,
    issue,
    returnDate,
    image,
    reportedAt: now
  };

  reports.push(newReport);
  writeJSON(REPORTS_FILE, reports);

  console.log("⚠️ Đã ghi nhận báo cáo sự cố:", newReport);
  res.json({ success: true, message: "Báo cáo sự cố thành công", data: newReport });
});

// ========== LƯU PHÂN LOẠI PHÒNG BAN ==========
app.post('/api/classified-devices', (req, res) => {
  const { devices } = req.body;
  if (!devices || !Array.isArray(devices)) {
    return res.status(400).json({ success: false, message: "Dữ liệu không hợp lệ" });
  }

  try {
    writeJSON(CLASSIFIED_DEVICES_FILE, devices);
    console.log("📦 Đã lưu phân loại thiết bị:", devices.length, "thiết bị");
    res.json({ success: true, message: "Đã lưu phân loại thiết bị thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi ghi file phân loại" });
  }
});

// ✅ START SERVER
app.listen(PORT, () => {
  console.log(`✅ API đang chạy tại http://localhost:${PORT}`);
});
