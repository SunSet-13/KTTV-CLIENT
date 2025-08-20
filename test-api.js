// Test script để kiểm tra API structure
const testAPI = async () => {
  try {
    console.log('Testing API: http://localhost:2004/api/station-data');
    
    const response = await fetch('http://localhost:2004/api/station-data?page=1&limit=5');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    console.log('Data type:', typeof data);
    console.log('Is array:', Array.isArray(data));
    
    if (data.data) {
      console.log('Data.data type:', typeof data.data);
      console.log('Data.data is array:', Array.isArray(data.data));
      console.log('First item:', data.data[0]);
    }
    
  } catch (error) {
    console.error('API Test Error:', error);
  }
};

testAPI();
