# 🌦️ Trang Bản Đồ KTTV - Hướng Dẫn Sử Dụng

## ✨ Giới thiệu
Trang bản đồ KTTV được thiết kế theo phong cách chuyên nghiệp của Trung tâm Thông tin và Dữ liệu Khí tượng Thủy văn, cung cấp giao diện hiện đại và trực quan để theo dõi dữ liệu khí tượng.

## 🎯 Cách truy cập

1. **Mở ứng dụng** tại `http://localhost:5174`
2. **Click vào "Bản đồ KTTV"** trong menu header
3. **Hoặc** từ trang chủ, sử dụng navigation để chuyển đến trang bản đồ

## 🖥️ Giao diện chính

### 📋 **Header - Thanh điều hướng**
- **Logo và tên trung tâm** KTTV
- **Menu điều hướng**: Trang chủ, Dữ liệu, Bản đồ, Tìm kiếm, Hướng dẫn, Liên hệ
- **Thiết kế gradient** xanh dương chuyên nghiệp

### 📱 **Sidebar bên trái - Bộ lọc dữ liệu**
- **🔄 Thu gọn/Mở rộng**: Click vào nút toggle sidebar
- **5 loại dữ liệu**:
  - 🌧️ **Lượng mưa** (mặc định)
  - 🌡️ **Nhiệt độ**
  - 💨 **Gió**  
  - 💧 **Độ ẩm**
  - 📊 **Áp suất**

- **🗺️ Bộ lọc địa lý**:
  - **Vùng**: Miền Bắc/Trung/Nam
  - **Tỉnh**: Dropdown đầy đủ 63 tỉnh thành

- **📅 Bộ lọc thời gian**:
  - **Chọn ngày**: Date picker
  - **Bộ lọc giờ**: Đêm, Sáng, Chiều, Tối, Tất cả

### 🗺️ **Bản đồ chính - Khu vực hiển thị**
- **Leaflet map** tương tác với OpenStreetMap
- **Markers tròn** với màu sắc theo lượng mưa
- **Hover effects**: Phóng to khi di chuột
- **Click để xem popup** thông tin chi tiết trạm
- **Auto-fit bounds** khi có dữ liệu mới

### 📊 **Legend bên phải - Chú giải và thống kê**
- **🎨 Thang màu**: 9 mức độ lượng mưa từ 0mm đến 100+mm
- **📈 Thống kê realtime**:
  - Tổng số trạm
  - Số trạm có mưa/không mưa  
  - Phân loại theo mức độ mưa
- **Số lượng trạm** cho từng mức màu

## 🎨 **Thang màu lượng mưa**

| Mức độ | Màu sắc | Mô tả |
|--------|---------|-------|
| 0 mm | 🤍 Trắng | Không mưa |
| 0.1-5 mm | 🟢 Xanh lá nhạt | Mưa rất nhỏ |
| 5-15 mm | 🟡 Vàng | Mưa nhỏ |
| 15-25 mm | 🟠 Cam | Mưa vừa |
| 25-40 mm | 🔴 Đỏ nhạt | Mưa khá |
| 40-60 mm | 🌸 Hồng đậm | Mưa to |
| 60-80 mm | 🟣 Tím | Mưa rất to |
| 80-100 mm | 🟦 Xanh tím đậm | Mưa cực to |
| 100+ mm | 🔴 Đỏ đậm | Mưa đặc biệt to |

## 🔧 **Chức năng tương tác**

### 📍 **Thông tin trạm - Popup**
Khi click vào marker, hiển thị:
- **Tên trạm** và mã trạm
- **Tọa độ** (Latitude, Longitude)  
- **Lượng mưa hiện tại** với màu sắc tương ứng
- **Thời gian** cập nhật dữ liệu

### 🔄 **Bộ lọc tương tác**
- **Radio buttons** chọn loại dữ liệu
- **Dropdowns** chọn vùng và tỉnh
- **Date picker** chọn ngày
- **Time buttons** chọn khung giờ
- **Auto-refresh** khi thay đổi bộ lọc

### 📱 **Responsive Design**
- **Desktop**: Sidebar + Map + Legend 3 cột
- **Tablet**: Sidebar thu gọn, Legend overlay
- **Mobile**: Full-screen sidebar và legend

## 🚀 **Tính năng nâng cao**

### ⚡ **Performance**
- **useCallback, useMemo** tối ưu re-render
- **Debounced filtering** tránh quá nhiều API calls
- **Lazy loading** cho markers
- **Memory cleanup** khi unmount

### 🎭 **Animation & Effects**
- **Smooth transitions** 0.3s cho tất cả elements
- **Hover effects** cho markers và buttons
- **Loading spinner** khi tải dữ liệu
- **Gradient backgrounds** cho header

### 🔌 **API Integration**
- **REST API**: `http://localhost:2004/api/station-rain`
- **Error handling** với retry button
- **Loading states** với overlay
- **Data validation** và filtering

## 🎯 **Khuyến nghị sử dụng**

### 👍 **Best Practices**
1. **Chọn vùng trước** rồi mới chọn tỉnh để tối ưu hiệu suất
2. **Sử dụng bộ lọc thời gian** để xem dữ liệu cụ thể
3. **Hover qua markers** để xem thông tin nhanh
4. **Click markers** để xem thông tin chi tiết
5. **Thu gọn sidebar** để có nhiều không gian bản đồ hơn

### ⚠️ **Lưu ý**
- Dữ liệu được cập nhật từ API backend
- Nếu API không khả dụng, hệ thống sẽ hiển thị thông báo lỗi
- Trang responsive hoạt động tốt trên mọi thiết bị
- Sử dụng modern browsers để có trải nghiệm tốt nhất

## 📞 **Hỗ trợ**
Nếu gặp vấn đề, vui lòng kiểm tra:
1. **Development server** đang chạy tại `http://localhost:5174`
2. **API backend** đang hoạt động tại `http://localhost:2004`
3. **Console logs** để debug lỗi
4. **Network tab** để kiểm tra API calls

---
**Phiên bản**: 1.0.0  
**Cập nhật**: Tháng 8, 2025  
**Phát triển bởi**: KTTV Development Team
