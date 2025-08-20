# KTTV React Dashboard

Ứng dụng React hiển thị dữ liệu khí tượng thủy văn với các chức năng:

- Hiển thị danh sách trạm đo
- Tra cứu và lọc dữ liệu lượng mưa theo thời gian
- Hiển thị dữ liệu trên bản đồ tương tác (Leaflet)
- Vẽ biểu đồ thống kê với Chart.js
- Xuất dữ liệu Excel/PDF
- Animation hiển thị dữ liệu theo thời gian

## Cài đặt

```bash
npm install
```

## Chạy ứng dụng

```bash
npm run dev
```

## Thư viện sử dụng

- React + Vite
- Chart.js (react-chartjs-2)
- Leaflet (react-leaflet) 
- Flatpickr (react-flatpickr)
- Font Awesome

## Cấu trúc components

- `Header`: Thanh tiêu đề và menu
- `Hero`: Banner chính
- `Features`: Các tính năng nổi bật
- `RainfallControls`: Bộ lọc và điều khiển
- `Map`: Bản đồ Leaflet hiển thị dữ liệu
- `Legend`: Chú giải màu sắc
- `Charts`: Biểu đồ Chart.js
- `DataQualityAlert`: Thông báo chất lượng dữ liệu
- `Footer`: Chân trang

## API Backend

Cần có backend cung cấp các API:
- `GET /api/rainfall/stations` - Danh sách trạm
- `GET /api/rainfall/hourly` - Dữ liệu lượng mưa theo giờ
- `GET /api/rainfall/contour` - Dữ liệu đường đẳng trị
- `GET /api/rainfall/export` - Xuất dữ liệu

Nếu không có backend, ứng dụng sẽ sử dụng dữ liệu mẫu.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
