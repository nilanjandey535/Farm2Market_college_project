// Test script for zone-based crop suggestion system
const API_URL = 'http://localhost:4000/api';

async function testZoneBasedCrops() {
  console.log('🧪 Testing Zone-Based Crop Suggestion System\n');
  console.log('=' .repeat(60));

  console.log('\n📍 Test 1: Farmer WITHOUT region/area assigned');
  console.log('-'.repeat(60));
  try {
    const response = await fetch(`${API_URL}/weather/crops/999999`);
    const data = await response.json();

    if (!response.ok) {
      console.log('✅ Expected error received:', data.error);
      if (data.error.includes('address') || data.error.includes('pincode')) {
        console.log('✅ Correct error message about address/pincode requirement');
      }
    } else {
      console.log('❌ Expected error but got success:', data);
    }
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
  }

  console.log('\n🌾 Test 2: North India Farmer (Delhi/Punjab region)');
  console.log('-'.repeat(60));
  console.log('Expected crops: Wheat, Rice, Mustard, Sugarcane, Potato, Maize');
  console.log('Note: This test requires a farmer with region_id pointing to North India region');

  console.log('\n🥥 Test 3: South India Farmer (Tamil Nadu/Karnataka)');
  console.log('-'.repeat(60));
  console.log('Expected crops: Coconut, Coffee, Rice, Banana, Turmeric, Groundnut');
  console.log('Note: This test requires a farmer with region_id pointing to South India region');

  console.log('\n🍵 Test 4: East India Farmer (West Bengal/Assam)');
  console.log('-'.repeat(60));
  console.log('Expected crops: Jute, Rice, Tea, Maize, Vegetables, Litchi');
  console.log('Note: This test requires a farmer with region_id pointing to East India region');

  console.log('\n🌵 Test 5: West India Farmer (Maharashtra/Gujarat)');
  console.log('-'.repeat(60));
  console.log('Expected crops: Cotton, Soybean, Groundnut, Grapes, Onion, Bajra');
  console.log('Note: This test requires a farmer with region_id pointing to West India region');

  console.log('\n🌾 Test 6: Central India Farmer (MP/Chhattisgarh)');
  console.log('-'.repeat(60));
  console.log('Expected crops: Wheat, Gram, Soybean, Maize, Garlic, Coriander');
  console.log('Note: This test requires a farmer with region_id pointing to Central India region');

  console.log('\n🏔️ Test 7: North-East India Farmer (Assam/Meghalaya)');
  console.log('-'.repeat(60));
  console.log('Expected crops: Tea, Areca Nut, Rice, Ginger, Turmeric, Pineapple');
  console.log('Note: This test requires a farmer with region_id pointing to North-East region');

  console.log('\n' + '='.repeat(60));
  console.log('\n📋 Manual Testing Instructions:');
  console.log('1. Login to Super Admin panel');
  console.log('2. Create a new region (e.g., "Delhi", "Chennai", "Kolkata")');
  console.log('3. Assign the region to a farmer account');
  console.log('4. Login as that farmer');
  console.log('5. Navigate to Weather & Crop Suggestion');
  console.log('6. Verify zone-specific crops are displayed');
  console.log('7. Check zone badge shows correct zone name');

  console.log('\n🔍 Backend Console Logs:');
  console.log('Watch for: "Zone-based crops for region..." log messages');
  console.log('This will show which zone was detected for each request');
}

testZoneBasedCrops();
