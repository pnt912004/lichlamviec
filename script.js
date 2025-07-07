// Dữ liệu thời gian biểu
let timetableData = {};
let currentEditingCell = null;

// Khung thời gian mặc định
let defaultTimeSlots = [
  "7:00-7:30",
  "7:30-8:00",
  "8:00-8:30",
  "8:30-9:00",
  "9:00-9:30",
  "9:30-10:00",
  "10:00-10:30",
  "10:30-11:00",
  "11:00-11:30",
  "11:30-12:00",
  "12:00-12:30",
  "12:30-13:00",
  "13:00-13:30",
  "13:30-14:00",
  "14:00-14:30",
  "14:30-15:00",
  "15:00-15:30",
  "15:30-16:00",
  "16:00-16:30",
  "16:30-17:00",
  "17:00-17:30",
  "17:30-18:00",
  "18:00-18:30",
  "18:30-19:00",
  "19:00-19:30",
  "19:30-20:00",
  "20:00-20:30",
  "20:30-21:00",
  "21:00-21:30",
];

const days = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const dayNames = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ Nhật",
];

// Khởi tạo khi trang web load
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded");
  loadData();
  generateTimetable();

  // Thêm event listener cho modal
  window.addEventListener("click", function (event) {
    const modal = document.getElementById("modal");
    if (event.target === modal) {
      closeModal();
    }
  });

  // Thêm event listener cho phím ESC
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeModal();
    }
  });
});

// Tạo bảng thời gian biểu
function generateTimetable() {
  console.log("Generating timetable...");
  const tbody = document.getElementById("timetable-body");

  if (!tbody) {
    console.error("Không tìm thấy tbody");
    return;
  }

  tbody.innerHTML = "";

  defaultTimeSlots.forEach((timeSlot) => {
    const row = document.createElement("tr");

    // Cột thời gian
    const timeCell = document.createElement("td");
    timeCell.className = "time-cell";
    timeCell.textContent = timeSlot;
    row.appendChild(timeCell);

    // Cột cho từng ngày
    days.forEach((day) => {
      const cell = document.createElement("td");
      cell.className = "schedule-cell";
      cell.setAttribute("data-time", timeSlot);
      cell.setAttribute("data-day", day);
      cell.addEventListener("click", () => editCell(timeSlot, day));

      // Hiển thị nội dung nếu có
      const cellData = getCellData(timeSlot, day);
      if (cellData) {
        updateCellDisplay(cell, cellData);
      }

      row.appendChild(cell);
    });

    tbody.appendChild(row);
  });

  console.log("Timetable generated successfully");
}

// Lấy dữ liệu của một ô
function getCellData(time, day) {
  const key = time + "-" + day;
  return timetableData[key] || null;
}

// Cập nhật hiển thị của một ô
function updateCellDisplay(cell, data) {
  cell.innerHTML = "";
  cell.className = "schedule-cell";

  if (data && (data.subject || data.teacher || data.room)) {
    const content = document.createElement("div");
    content.className = "cell-content";

    if (data.subject) {
      const subject = document.createElement("div");
      subject.className = "cell-subject";
      subject.textContent = data.subject;
      content.appendChild(subject);
    }

    if (data.teacher) {
      const teacher = document.createElement("div");
      teacher.className = "cell-teacher";
      teacher.textContent = data.teacher;
      content.appendChild(teacher);
    }

    if (data.room) {
      const room = document.createElement("div");
      room.className = "cell-room";
      room.textContent = data.room;
      content.appendChild(room);
    }

    cell.appendChild(content);

    // Áp dụng màu sắc
    if (data.color && data.color !== "default") {
      cell.classList.add("subject-" + data.color);
    } else {
      cell.classList.add("subject-default");
    }
  }
}

// Mở modal để chỉnh sửa ô
function editCell(time, day) {
  console.log("Editing cell:", time, day);
  currentEditingCell = { time, day };
  const cellData = getCellData(time, day);

  // Điền dữ liệu hiện tại vào form
  document.getElementById("subject").value = cellData?.subject || "";
  document.getElementById("teacher").value = cellData?.teacher || "";
  document.getElementById("room").value = cellData?.room || "";
  document.getElementById("notes").value = cellData?.notes || "";
  document.getElementById("color").value = cellData?.color || "default";

  // Hiển thị modal
  document.getElementById("modal").style.display = "block";
  document.getElementById("subject").focus();
}

// Đóng modal
function closeModal() {
  document.getElementById("modal").style.display = "none";
  currentEditingCell = null;
}

// Lưu dữ liệu ô
function saveCell() {
  if (!currentEditingCell) return;

  const time = currentEditingCell.time;
  const day = currentEditingCell.day;
  const key = time + "-" + day;

  const data = {
    subject: document.getElementById("subject").value.trim(),
    teacher: document.getElementById("teacher").value.trim(),
    room: document.getElementById("room").value.trim(),
    notes: document.getElementById("notes").value.trim(),
    color: document.getElementById("color").value,
  };

  // Chỉ lưu nếu có ít nhất một trường được điền
  if (data.subject || data.teacher || data.room || data.notes) {
    timetableData[key] = data;
  } else {
    delete timetableData[key];
  }

  // Cập nhật hiển thị
  const cell = document.querySelector(
    '[data-time="' + time + '"][data-day="' + day + '"]'
  );
  if (cell) {
    updateCellDisplay(cell, timetableData[key]);
  }

  // Tự động lưu
  saveData();
  closeModal();

  // Hiển thị thông báo
  showNotification("Đã lưu thành công!", "success");
}

// Xóa nội dung ô
function deleteCell() {
  if (!currentEditingCell) return;

  const time = currentEditingCell.time;
  const day = currentEditingCell.day;
  const key = time + "-" + day;

  delete timetableData[key];

  // Cập nhật hiển thị
  const cell = document.querySelector(
    '[data-time="' + time + '"][data-day="' + day + '"]'
  );
  if (cell) {
    updateCellDisplay(cell, null);
  }

  // Tự động lưu
  saveData();
  closeModal();

  // Hiển thị thông báo
  showNotification("Đã xóa thành công!", "success");
}

// Thêm khung thời gian mới
function addTimeSlot() {
  const timeSlot = prompt("Nhập khung thời gian mới (VD: 21:30-22:00):");
  if (timeSlot && timeSlot.trim()) {
    const trimmedSlot = timeSlot.trim();
    if (!defaultTimeSlots.includes(trimmedSlot)) {
      defaultTimeSlots.push(trimmedSlot);
      defaultTimeSlots.sort();
      generateTimetable();
      saveData();
      showNotification("Đã thêm khung thời gian mới!", "success");
    } else {
      showNotification("Khung thời gian này đã tồn tại!", "warning");
    }
  }
}

// Lưu dữ liệu vào bộ nhớ
function saveData() {
  try {
    const dataToSave = {
      timetableData: timetableData,
      timeSlots: defaultTimeSlots,
      lastUpdate: new Date().toISOString(),
    };
    localStorage.setItem("timetableData", JSON.stringify(dataToSave)); // lưu vào localStorage
    console.log("Dữ liệu đã được lưu vào localStorage");
  } catch (error) {
    console.error("Lỗi khi lưu dữ liệu:", error);
    showNotification("Lỗi khi lưu dữ liệu!", "error");
  }
}

// Tải dữ liệu từ bộ nhớ
function loadData() {
  try {
    const savedDataStr = localStorage.getItem("timetableData");
    if (savedDataStr) {
      const savedData = JSON.parse(savedDataStr);
      timetableData = savedData.timetableData || {};
      if (savedData.timeSlots) {
        defaultTimeSlots = savedData.timeSlots;
      }
      console.log("Dữ liệu đã được tải từ localStorage");
    }
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu:", error);
    showNotification("Lỗi khi tải dữ liệu!", "error");
  }
}

// Xóa tất cả dữ liệu
function clearAll() {
  if (confirm("Bạn có chắc chắn muốn xóa toàn bộ thời gian biểu?")) {
    timetableData = {};
    localStorage.removeItem("timetableData"); // xóa khỏi localStorage
    generateTimetable();
    showNotification("Đã xóa toàn bộ dữ liệu!", "success");
  }
}

// Xuất dữ liệu
function exportData() {
  try {
    const dataToExport = {
      timetableData: timetableData,
      timeSlots: defaultTimeSlots,
      exportDate: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download =
      "timetable_" + new Date().toISOString().split("T")[0] + ".json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    showNotification("Đã xuất dữ liệu thành công!", "success");
  } catch (error) {
    console.error("Lỗi khi xuất dữ liệu:", error);
    showNotification("Lỗi khi xuất dữ liệu!", "error");
  }
}
function exportAsImage() {
    const table = document.querySelector('.timetable'); // chỉ chụp phần bảng
    if (!table) {
        showNotification('Không tìm thấy bảng thời khóa biểu!', 'error');
        return;
    }

    html2canvas(table, {
        backgroundColor: '#ffffff', // nền trắng
        scale: 2 // tăng độ nét
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'thoikhoabieu_' + new Date().toISOString().split('T')[0] + '.png';
        link.href = canvas.toDataURL('image/png');
        link.click();

        showNotification('Đã xuất ảnh thời khóa biểu!', 'success');
    }).catch(error => {
        console.error('Lỗi khi xuất ảnh:', error);
        showNotification('Lỗi khi xuất ảnh!', 'error');
    });
}

// Hiển thị thông báo
function showNotification(message, type) {
  type = type || "info";

  // Tạo element thông báo
  const notification = document.createElement("div");
  notification.className = "notification notification-" + type;
  notification.textContent = message;

  // Thêm CSS cơ bản
  notification.style.position = "fixed";
  notification.style.top = "20px";
  notification.style.right = "20px";
  notification.style.padding = "15px 20px";
  notification.style.borderRadius = "8px";
  notification.style.color = "white";
  notification.style.fontWeight = "600";
  notification.style.zIndex = "10000";
  notification.style.transform = "translateX(100%)";
  notification.style.transition = "transform 0.3s ease";
  notification.style.maxWidth = "300px";
  notification.style.boxShadow = "0 5px 20px rgba(0,0,0,0.2)";

  // Thêm màu sắc theo type
  if (type === "success") {
    notification.style.background =
      "linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)";
  } else if (type === "error") {
    notification.style.background =
      "linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)";
  } else if (type === "warning") {
    notification.style.background =
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)";
  } else {
    notification.style.background =
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)";
  }

  // Thêm vào DOM
  document.body.appendChild(notification);

  // Hiển thị thông báo
  setTimeout(function () {
    notification.style.transform = "translateX(0)";
  }, 100);

  // Ẩn thông báo sau 3 giây
  setTimeout(function () {
    notification.style.transform = "translateX(100%)";
    setTimeout(function () {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}
