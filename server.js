const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Hàm helper ghi file JSON
function writeJsonFile(filename, data, res, label) {
  if (!Array.isArray(data)) {
    return res.status(400).send(`${label} phải là mảng`);
  }
  fs.writeFile(filename, JSON.stringify(data, null, 2), err => {
    if (err) {
      console.error(`Lỗi ghi file ${filename}:`, err);
      return res.status(500).send(`Lỗi ghi file ${label}`);
    }
    res.send(`Đã cập nhật ${filename}`);
  });
}

// Hàm helper đọc file JSON
function readJsonFile(filename, res) {
  fs.readFile(filename, (err, data) => {
    if (err || !data.length) return res.json([]);
    try {
      const arr = JSON.parse(data);
      if (!Array.isArray(arr)) return res.json([]);
      res.json(arr);
    } catch (e) {
      console.error(`Lỗi đọc file ${filename}:`, e);
      res.json([]);
    }
  });
}

// Định nghĩa các resource và file tương ứng
const resources = [
  { name: 'teachers', file: 'teachers.json', label: 'Giáo viên' },
  { name: 'degrees', file: 'degrees.json', label: 'Bằng cấp' },
  { name: 'faculties', file: 'faculties.json', label: 'Khoa' },
  { name: 'courses', file: 'courses.json', label: 'Học phần' },
  { name: 'semesters', file: 'semesters.json', label: 'Kỳ học' },
  { name: 'classsections', file: 'classsections.json', label: 'Lớp học phần' },
  { name: 'lecturerassignments', file: 'lecturerassignments.json', label: 'Phân công giảng viên' },
];

// Tạo API GET/POST cho từng resource
resources.forEach(({ name, file, label }) => {
  app.post(`/api/${name}`, (req, res) => writeJsonFile(file, req.body, res, label));
  app.get(`/api/${name}`, (req, res) => readJsonFile(file, res));
});

// API ghi salary.json: chỉ ghi đè nếu tên và mã giáo viên trùng, còn lại thì nối thêm
app.post('/api/salary', (req, res) => {
  const filePath = 'salary.json';
  const newSalary = req.body;
  fs.readFile(filePath, 'utf8', (err, data) => {
    let arr = [];
    if (!err && data) {
      try { arr = JSON.parse(data); } catch {}
    }
    // Kiểm tra nếu đã có bản ghi cùng tên và mã giáo viên thì ghi đè, ngược lại thì nối thêm
    const idx = arr.findIndex(s => s.name === newSalary.name && s.teacherId === newSalary.teacherId);
    if (idx !== -1) {
      arr[idx] = newSalary;
    } else {
      arr.push(newSalary);
    }
    fs.writeFile(filePath, JSON.stringify(arr, null, 2), err2 => {
      if (err2) return res.status(500).send('Lỗi ghi file salary.json');
      res.send('Đã lưu salary');
    });
  });
});

app.listen(PORT, () => console.log(`Server chạy ở http://localhost:${PORT}`));
app.use(express.static(__dirname));
