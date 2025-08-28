# Hướng dẫn Migration từ cấu trúc hiện tại sang Features-based Structure

## Bước 1: Tạo cấu trúc thư mục mới

```bash
# Tạo các thư mục chính
mkdir -p src/features/{weather,maps,charts}/{components,hooks,services,types}
mkdir -p src/shared/{components/ui,hooks,services,utils,types}
mkdir -p src/app/{store,router}

# Tạo các thư mục UI components
mkdir -p src/shared/components/ui/{Button,Input,Modal,Layout,Loading}
```

## Bước 2: Di chuyển components hiện tại

### Weather Feature
```bash
# Di chuyển các components liên quan đến weather
mv src/components/Map.jsx src/features/weather/components/WeatherMap/
mv src/components/RainfallControls.jsx src/features/weather/components/RainfallControls/
mv src/components/Legend.jsx src/features/weather/components/Legend/
mv src/components/DataQualityAlert.jsx src/features/weather/components/DataQualityAlert/
```

### Charts Feature
```bash
# Di chuyển charts components
mv src/components/Charts.jsx src/features/charts/components/Charts/
mv src/components/ChartsPage.jsx src/features/charts/components/ChartsPage/
mv src/components/DataTable.jsx src/features/charts/components/DataTable/
```

### Maps Feature
```bash
# Di chuyển map pages
mv src/components/MapPage.jsx src/features/maps/components/MapPage/
mv src/components/MapPage_clean.jsx src/features/maps/components/MapPageClean/
mv src/components/MapPage_simple.jsx src/features/maps/components/MapPageSimple/
```

### Shared Components
```bash
# Di chuyển shared components
mv src/components/Header.jsx src/shared/components/Layout/Header/
mv src/components/Footer.jsx src/shared/components/Layout/Footer/
mv src/components/Hero.jsx src/shared/components/Layout/Hero/
mv src/components/Features.jsx src/shared/components/Layout/Features/
```

## Bước 3: Tạo các services và hooks

### Weather Services
```javascript
// src/features/weather/services/weatherAPI.js
export class WeatherAPI {
  async getStationData(filters) {
    // Implementation
  }
  
  async getRainfallData(stationId, dateRange) {
    // Implementation
  }
}
```

### Custom Hooks
```javascript
// src/features/weather/hooks/useWeatherData.js
export const useWeatherData = (filters) => {
  // Implementation
};

// src/features/maps/hooks/useMapControl.js
export const useMapControl = () => {
  // Implementation
};
```

## Bước 4: Update imports

### Before:
```javascript
import Header from '../components/Header';
import Map from '../components/Map';
import Charts from '../components/Charts';
```

### After:
```javascript
import Header from '@/shared/components/Layout/Header';
import WeatherMap from '@/features/weather/components/WeatherMap';
import Charts from '@/features/charts/components/Charts';
```

## Bước 5: Cập nhật vite.config.js

```javascript
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@/app': path.resolve(__dirname, './src/app'),
    },
  },
});
```

## Bước 6: Tạo index files cho features

```javascript
// src/features/weather/index.js
export { default as WeatherMap } from './components/WeatherMap';
export { default as RainfallControls } from './components/RainfallControls';
export { useWeatherData } from './hooks/useWeatherData';
export { weatherAPI } from './services/weatherAPI';

// src/features/charts/index.js
export { default as Charts } from './components/Charts';
export { default as ChartsPage } from './components/ChartsPage';
export { default as DataTable } from './components/DataTable';

// src/features/maps/index.js
export { default as MapPage } from './components/MapPage';
export { default as MapPageClean } from './components/MapPageClean';
```

## Bước 7: Update App.jsx

```javascript
// Before
import Header from './components/Header';
import Footer from './components/Footer';
import MapPage from './components/MapPage';
import ChartsPage from './components/ChartsPage';

// After
import { Header, Footer } from '@/shared/components/Layout';
import { MapPage } from '@/features/maps';
import { ChartsPage } from '@/features/charts';
```

## Script tự động migration

```bash
#!/bin/bash
# migration.sh

echo "🚀 Starting migration to features-based structure..."

# Tạo cấu trúc thư mục
echo "📁 Creating directory structure..."
mkdir -p src/features/{weather,maps,charts}/{components,hooks,services,types}
mkdir -p src/shared/{components/ui,hooks,services,utils,types}
mkdir -p src/app/{store,router}

# Di chuyển files
echo "📦 Moving files..."

# Weather feature
mkdir -p src/features/weather/components/{WeatherMap,RainfallControls,Legend,DataQualityAlert}
mv src/components/Map.jsx src/features/weather/components/WeatherMap/WeatherMap.jsx
mv src/components/RainfallControls.jsx src/features/weather/components/RainfallControls/
mv src/components/Legend.jsx src/features/weather/components/Legend/
mv src/components/DataQualityAlert.jsx src/features/weather/components/DataQualityAlert/

# Charts feature  
mkdir -p src/features/charts/components/{Charts,ChartsPage,DataTable}
mv src/components/Charts.jsx src/features/charts/components/Charts/
mv src/components/ChartsPage.jsx src/features/charts/components/ChartsPage/
mv src/components/DataTable.jsx src/features/charts/components/DataTable/

# Maps feature
mkdir -p src/features/maps/components/{MapPage,MapPageClean,MapPageSimple}
mv src/components/MapPage.jsx src/features/maps/components/MapPage/
mv src/components/MapPage_clean.jsx src/features/maps/components/MapPageClean/
mv src/components/MapPage_simple.jsx src/features/maps/components/MapPageSimple/

# Shared components
mkdir -p src/shared/components/Layout/{Header,Footer,Hero,Features}
mv src/components/Header.jsx src/shared/components/Layout/Header/
mv src/components/Footer.jsx src/shared/components/Layout/Footer/
mv src/components/Hero.jsx src/shared/components/Layout/Hero/
mv src/components/Features.jsx src/shared/components/Layout/Features/

echo "✅ Migration completed! Please update your imports manually."
```

## Checklist sau migration

- [ ] Tất cả components đã được di chuyển đúng thư mục
- [ ] Imports đã được cập nhật
- [ ] Alias paths đã được cấu hình
- [ ] Index files đã được tạo
- [ ] CSS modules đã được rename
- [ ] Tests đã được di chuyển (nếu có)
- [ ] TypeScript types đã được tạo (nếu dùng TS)
- [ ] Build thành công
- [ ] Tất cả features hoạt động bình thường
