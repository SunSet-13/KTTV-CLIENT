# KTTV Client - Weather Station Map Application

Ứng dụng React hiển thị bản đồ các trạm khí tượng với dữ liệu mưa realtime.

## Tính năng chính

- 🗺️ **Bản đồ tương tác**: Hiển thị vị trí các trạm KTTV trên bản đồ Leaflet
- 🌧️ **Dữ liệu mưa**: Hiển thị lượng mưa theo màu sắc và kích thước marker
- 🔍 **Tìm kiếm**: Tìm kiếm theo mã trạm hoặc tên trạm
- 📅 **Bộ lọc thời gian**: Nhập ngày/tháng/năm/giờ để xem dữ liệu lịch sử
- 📊 **Thống kê**: Hiển thị số liệu tổng quan về các trạm
- 🎨 **Chú giải màu**: Legend cho các mức độ lượng mưa

## Công nghệ sử dụng

- **React 18** - Frontend framework
- **Vite** - Build tool và dev server
- **Leaflet** - Thư viện bản đồ tương tác
- **CSS3** - Styling và responsive design

## Cài đặt và chạy

### Yêu cầu
- Node.js >= 16
- npm hoặc yarn

### Cài đặt dependencies
```bash
npm install
# hoặc
yarn install
```

### Chạy development server
```bash
npm run dev
# hoặc
yarn dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

### Build cho production
```bash
npm run build
# hoặc
yarn build
```

## Cấu trúc project

```
src/
├── components/
│   ├── MapPage.jsx          # Component chính hiển thị bản đồ
│   ├── MapPage.css          # Styling cho bản đồ
│   ├── Header.jsx           # Header component
│   ├── Charts.jsx           # Component biểu đồ
│   └── ...
├── App.jsx                  # Root component
└── main.jsx                # Entry point
```

## API Integration

Ứng dụng kết nối với API backend tại `http://localhost:2004/api/station-rain` để lấy dữ liệu:

- **Endpoint**: `/api/station-rain`
- **Method**: GET
- **Parameters**: 
  - `datetime` (optional): Lọc theo thời gian (format: YYYY-MM-DDTHH:mm)

### Response format
```json
{
  "data": [
    {
      "StationID": 123,
      "StationNo": "1020401001",
      "StationName": "Cao Bang",
      "Latitude": 22.666667,
      "Longitude": 106.25,
      "RainValue": 12.5,
      "DtDate": "2025-08-20T10:00:00.000Z"
    }
  ],
  "count": 1000
}
```

## Tính năng chi tiết

### Bản đồ
- Hiển thị các trạm KTTV bằng circle markers
- Màu sắc thay đổi theo lượng mưa (từ vàng nhạt đến đỏ đậm)
- Kích thước marker tỉ lệ với lượng mưa
- Click vào marker để xem thông tin chi tiết

### Bộ lọc
- **Tìm kiếm**: Nhập mã trạm hoặc tên trạm
- **Thời gian**: 4 ô input riêng cho ngày/tháng/năm/giờ
- **Lọc mưa**: Checkbox để chỉ hiển thị trạm có mưa > X mm

### Màu sắc chú giải
- 🟡 0-1 mm: Vàng nhạt
- 🟠 1-5 mm: Cam nhạt  
- 🟠 5-10 mm: Cam
- 🔴 10-20 mm: Đỏ nhạt
- 🔴 20-30 mm: Đỏ
- 🔴 30-50 mm: Đỏ đậm
- 🔴 50+ mm: Đỏ đen

## Scripts có sẵn

- `dev`: Chạy development server
- `build`: Build cho production
- `lint`: Chạy ESLint
- `preview`: Preview build production

## Thông tin liên hệ

- Repository: [https://github.com/SunSet-13/KTTV-CLIENT.git](https://github.com/SunSet-13/KTTV-CLIENT.git)
- Backend API: [https://github.com/SunSet-13/KTTV-SERVER.git](https://github.com/SunSet-13/KTTV-SERVER.git)
