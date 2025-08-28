# 🗺️ API Provinces Integration Guide

## 📋 API Endpoints Overview

### 1. `/api/provinces/grouped` - Gom nhóm tất cả trạm theo từng tỉnh
```http
GET http://localhost:2004/api/provinces/grouped
```
**Response Format:**
```json
[
  {
    "province": "Hà Nội",
    "stations": [
      {
        "StationID": "108001",
        "StationName": "Hà Nội",
        "StationNo": "HN",
        "Latitude": 21.0285,
        "Longitude": 105.8542,
        "Province": "Hà Nội"
      }
    ]
  }
]
```

### 2. `/api/provinces/statistics` - Thống kê trạm theo tỉnh
```http
GET http://localhost:2004/api/provinces/statistics
```
**Response Format:**
```json
{
  "Hà Nội": 15,
  "TP. Hồ Chí Minh": 23,
  "Đà Nẵng": 8,
  "Hải Phòng": 12
}
```

### 3. `/api/provinces/stations` - Tìm kiếm trạm theo tỉnh
```http
GET http://localhost:2004/api/provinces/stations?province=Hà Nội
```
**Response Format:**
```json
[
  {
    "StationID": "108001",
    "StationName": "Hà Nội",
    "StationNo": "HN",
    "Latitude": 21.0285,
    "Longitude": 105.8542,
    "RainValue": 12.5,
    "DtDate": "2025-08-27T10:00:00.000Z",
    "Province": "Hà Nội"
  }
]
```

## 🎯 Integration Features

### ✅ **MapPageKTTV.jsx - Giao diện KTTV chính**

#### **🔄 Auto-loading provinces:**
- `loadProvinces()` - Tải danh sách tỉnh từ `/grouped`
- `loadProvinceStats()` - Tải thống kê từ `/statistics`
- Hiển thị số lượng trạm trong dropdown: "Hà Nội (15 trạm)"

#### **📍 Province filtering:**
- Dropdown select với tất cả tỉnh thành
- Auto-load stations khi chọn tỉnh
- Hiển thị thông tin số trạm dưới dropdown

#### **🎨 UI Components:**
```jsx
<select value={filters.province} onChange={(e) => updateFilter('province', e.target.value)}>
  <option value="">Tất cả tỉnh thành</option>
  {provinces.map(province => (
    <option key={provinceName} value={provinceName}>
      {provinceName} {stationCount && `(${stationCount} trạm)`}
    </option>
  ))}
</select>
```

### ✅ **MapPage.jsx - Bản đồ với tìm kiếm nâng cao**

#### **🔍 Text-based province search:**
- Input field cho phép gõ tên tỉnh
- Debounced search (500ms) để tránh quá nhiều API calls
- Fallback về filter client-side nếu API lỗi

#### **⚡ Real-time filtering:**
```jsx
<input
  type="text"
  placeholder="Tìm theo tỉnh/thành phố... (vd: Hà Nội, TP. Hồ Chí Minh)"
  value={filters.searchProvince}
  onChange={(e) => updateFilter('searchProvince', e.target.value)}
/>
```

## 🔧 Implementation Details

### **📡 API Integration Functions:**

#### **MapPageKTTV.jsx:**
```javascript
// Load all provinces
const loadProvinces = async () => {
  const response = await fetch(`${API_PROVINCES_URL}/grouped`);
  const data = await response.json();
  setProvinces(data || []);
};

// Load province statistics
const loadProvinceStats = async () => {
  const response = await fetch(`${API_PROVINCES_URL}/statistics`);
  const data = await response.json();
  setProvinceStats(data || {});
};

// Load stations by specific province
const loadStationsByProvince = async (provinceName) => {
  const response = await fetch(`${API_PROVINCES_URL}/stations?province=${encodeURIComponent(provinceName)}`);
  const data = await response.json();
  // Process and display stations
};
```

#### **MapPage.jsx:**
```javascript
// Debounced province search
const loadStationsByProvince = async (provinceName) => {
  const response = await fetch(`${API_PROVINCES_URL}/stations?province=${encodeURIComponent(provinceName)}`);
  const data = await response.json();
  if (data?.length > 0) {
    processApiData(data);
  }
};
```

## 🎨 User Experience Features

### **🎯 MapPageKTTV - Professional Interface:**
1. **Dropdown Selection**: Professional select với số lượng trạm
2. **Province Info**: Hiển thị thông tin chi tiết dưới dropdown
3. **Auto-loading**: Tự động tải khi chọn tỉnh
4. **Statistics Display**: Thống kê realtime trong legend

### **🔍 MapPage - Search Interface:**
1. **Text Input**: Gõ tự do tên tỉnh
2. **Debounced Search**: Tối ưu performance với delay 500ms
3. **Fallback Filtering**: Dự phòng khi API lỗi
4. **Combined Search**: Kết hợp với tìm kiếm ID/tên trạm

## 🚀 Performance Optimizations

### **⚡ Caching Strategy:**
- Province list chỉ load 1 lần khi khởi tạo
- Statistics cache trong state
- Debounced API calls

### **🎛️ Error Handling:**
- Fallback to static province list
- Graceful degradation when API unavailable
- User-friendly error messages

### **📱 Responsive Design:**
- Mobile-friendly dropdowns
- Touch-optimized inputs
- Adaptive layouts

## 🧪 Testing Guide

### **✅ Test Cases:**

1. **Load provinces list:**
   ```bash
   curl http://localhost:2004/api/provinces/grouped
   ```

2. **Get province statistics:**
   ```bash
   curl http://localhost:2004/api/provinces/statistics
   ```

3. **Search stations by province:**
   ```bash
   curl "http://localhost:2004/api/provinces/stations?province=Hà Nội"
   ```

### **🎯 UI Testing:**
1. **MapPageKTTV**: Chọn tỉnh từ dropdown → Xem stations hiển thị
2. **MapPage**: Gõ tên tỉnh → Xem kết quả real-time
3. **Error handling**: Tắt API → Kiểm tra fallback
4. **Performance**: Test debouncing và caching

## 📊 Expected Results

### **✨ User Benefits:**
- **Faster navigation** - Tìm nhanh trạm theo tỉnh
- **Better organization** - Dữ liệu được nhóm theo tỉnh
- **Real-time stats** - Số lượng trạm theo từng tỉnh
- **Improved UX** - Giao diện trực quan và responsive

### **🔧 Technical Benefits:**
- **Reduced data transfer** - Chỉ load trạm cần thiết
- **Better API structure** - Tách biệt theo chức năng
- **Scalable architecture** - Dễ mở rộng thêm tỉnh/region
- **Optimized performance** - Debouncing và caching

---
**🚀 Ready to use tại `http://localhost:5174`**  
**📚 API Base URL: `http://localhost:2004/api/provinces`**
