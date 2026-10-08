const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data.json');

const defaultData = {
  orphanages: [
    // SOS Children's Villages (6)
    { id: 1, name: "SOS Children's Village", city: 'Lahore', district: 'Lahore', address: 'Johar Town, Lahore', lat: 31.4697, lng: 74.2728, total_children: 120, staff_count: 35, cameras: 24, status: 'online', risk_level: 'low' },
    { id: 2, name: "SOS Children's Village", city: 'Rawalpindi', district: 'Rawalpindi', address: 'G.T. Road, opposite High Court, Rawalpindi', lat: 33.5651, lng: 73.0169, total_children: 95, staff_count: 28, cameras: 20, status: 'online', risk_level: 'low' },
    { id: 3, name: "SOS Children's Village", city: 'Faisalabad', district: 'Faisalabad', address: 'Faisalabad', lat: 31.4500, lng: 73.1100, total_children: 85, staff_count: 24, cameras: 18, status: 'online', risk_level: 'low' },
    { id: 4, name: "SOS Children's Village", city: 'Multan', district: 'Multan', address: 'Multan', lat: 30.2100, lng: 71.4700, total_children: 78, staff_count: 22, cameras: 17, status: 'online', risk_level: 'low' },
    { id: 5, name: "SOS Children's Village", city: 'Sargodha', district: 'Sargodha', address: 'Sargodha', lat: 32.0850, lng: 72.6700, total_children: 70, staff_count: 20, cameras: 14, status: 'online', risk_level: 'low' },
    { id: 6, name: "SOS Children's Village", city: 'Sialkot', district: 'Sialkot', address: 'Sialkot', lat: 32.5000, lng: 74.5300, total_children: 65, staff_count: 18, cameras: 14, status: 'online', risk_level: 'low' },

    // Punjab SWD Model Children Homes (15)
    { id: 7, name: 'Punjab Model Children Home (Boys)', city: 'Lahore', district: 'Lahore', address: 'Lahore', lat: 31.5400, lng: 74.3500, total_children: 55, staff_count: 14, cameras: 10, status: 'online', risk_level: 'low' },
    { id: 8, name: 'Punjab Model Children Home (Girls)', city: 'Lahore', district: 'Lahore', address: 'Lahore', lat: 31.5300, lng: 74.3400, total_children: 48, staff_count: 12, cameras: 8, status: 'online', risk_level: 'low' },
    { id: 9, name: 'Punjab Model Children Home (Boys)', city: 'Faisalabad', district: 'Faisalabad', address: 'Faisalabad', lat: 31.4187, lng: 73.0791, total_children: 52, staff_count: 13, cameras: 8, status: 'online', risk_level: 'low' },
    { id: 10, name: 'Punjab Model Children Home (Girls)', city: 'Sialkot', district: 'Sialkot', address: 'Sialkot', lat: 32.4945, lng: 74.5229, total_children: 40, staff_count: 10, cameras: 6, status: 'online', risk_level: 'medium' },
    { id: 11, name: 'Punjab Model Children Home (Girls)', city: 'Gujranwala', district: 'Gujranwala', address: 'Gujranwala', lat: 32.1877, lng: 74.1945, total_children: 38, staff_count: 10, cameras: 6, status: 'online', risk_level: 'low' },
    { id: 12, name: 'Punjab Model Children Home (Boys)', city: 'Rawalpindi', district: 'Rawalpindi', address: 'Rawalpindi', lat: 33.5900, lng: 73.0400, total_children: 50, staff_count: 13, cameras: 8, status: 'online', risk_level: 'low' },
    { id: 13, name: 'Punjab Model Children Home (Girls)', city: 'Rawalpindi', district: 'Rawalpindi', address: 'Rawalpindi', lat: 33.5800, lng: 73.0300, total_children: 44, staff_count: 11, cameras: 7, status: 'online', risk_level: 'low' },
    { id: 14, name: 'Punjab Model Children Home (Boys)', city: 'Sargodha', district: 'Sargodha', address: 'Sargodha', lat: 32.0740, lng: 72.6861, total_children: 42, staff_count: 11, cameras: 6, status: 'online', risk_level: 'low' },
    { id: 15, name: 'Punjab Model Children Home (Girls)', city: 'Sargodha', district: 'Sargodha', address: 'Sargodha', lat: 32.0650, lng: 72.6950, total_children: 36, staff_count: 9, cameras: 5, status: 'online', risk_level: 'medium' },
    { id: 16, name: 'Punjab Model Children Home (Boys)', city: 'Bahawalpur', district: 'Bahawalpur', address: 'Bahawalpur', lat: 29.3944, lng: 71.6811, total_children: 45, staff_count: 12, cameras: 7, status: 'online', risk_level: 'low' },
    { id: 17, name: 'Punjab Model Children Home (Girls)', city: 'Bahawalpur', district: 'Bahawalpur', address: 'Bahawalpur', lat: 29.3844, lng: 71.6911, total_children: 38, staff_count: 10, cameras: 6, status: 'online', risk_level: 'low' },
    { id: 18, name: 'Punjab Model Children Home (Boys)', city: 'D.G. Khan', district: 'Dera Ghazi Khan', address: 'D.G. Khan', lat: 30.0489, lng: 70.6455, total_children: 40, staff_count: 10, cameras: 5, status: 'online', risk_level: 'medium' },
    { id: 19, name: 'Punjab Model Children Home (Girls)', city: 'D.G. Khan', district: 'Dera Ghazi Khan', address: 'D.G. Khan', lat: 30.0550, lng: 70.6350, total_children: 35, staff_count: 9, cameras: 4, status: 'offline', risk_level: 'high' },
    { id: 20, name: 'Punjab Model Children Home (Boys)', city: 'Narowal', district: 'Narowal', address: 'Narowal', lat: 32.1020, lng: 74.8730, total_children: 32, staff_count: 8, cameras: 4, status: 'online', risk_level: 'low' },
    { id: 21, name: 'Punjab Model Children Home (Girls)', city: 'Narowal', district: 'Narowal', address: 'Narowal', lat: 32.1100, lng: 74.8650, total_children: 28, staff_count: 7, cameras: 4, status: 'online', risk_level: 'low' },

    // Dar-ul-Falah Mother & Children Homes (6)
    { id: 22, name: 'Dar-ul-Falah', city: 'Lahore', district: 'Lahore', address: 'Lahore', lat: 31.5100, lng: 74.3200, total_children: 30, staff_count: 8, cameras: 5, status: 'online', risk_level: 'low' },
    { id: 23, name: 'Dar-ul-Falah', city: 'Rawalpindi', district: 'Rawalpindi', address: 'Rawalpindi', lat: 33.6000, lng: 73.0200, total_children: 25, staff_count: 7, cameras: 4, status: 'online', risk_level: 'low' },
    { id: 24, name: 'Dar-ul-Falah', city: 'Sargodha', district: 'Sargodha', address: 'Sargodha', lat: 32.0800, lng: 72.7050, total_children: 22, staff_count: 6, cameras: 3, status: 'online', risk_level: 'medium' },
    { id: 25, name: 'Dar-ul-Falah', city: 'Sialkot', district: 'Sialkot', address: 'Sialkot', lat: 32.5100, lng: 74.5100, total_children: 20, staff_count: 6, cameras: 3, status: 'online', risk_level: 'low' },
    { id: 26, name: 'Dar-ul-Falah', city: 'Multan', district: 'Multan', address: 'Multan', lat: 30.1700, lng: 71.5100, total_children: 28, staff_count: 7, cameras: 4, status: 'online', risk_level: 'low' },
    { id: 27, name: 'Dar-ul-Falah', city: 'Bahawalpur', district: 'Bahawalpur', address: 'Bahawalpur', lat: 29.3700, lng: 71.7000, total_children: 24, staff_count: 6, cameras: 3, status: 'online', risk_level: 'low' },

    // CPWB Child Protection Institutions (14)
    { id: 28, name: 'CPWB Child Protection Institution', city: 'Lahore', district: 'Lahore', address: 'Angoori Bagh, Shalimar Link Road, Lahore', lat: 31.5800, lng: 74.3100, total_children: 65, staff_count: 20, cameras: 16, status: 'online', risk_level: 'low' },
    { id: 29, name: 'CPWB Child Protection Institution', city: 'Faisalabad', district: 'Faisalabad', address: 'Faisalabad', lat: 31.4300, lng: 73.0600, total_children: 48, staff_count: 14, cameras: 10, status: 'online', risk_level: 'low' },
    { id: 30, name: 'CPWB Child Protection Institution', city: 'Rawalpindi', district: 'Rawalpindi', address: 'Rawalpindi', lat: 33.5700, lng: 73.0500, total_children: 52, staff_count: 15, cameras: 12, status: 'online', risk_level: 'low' },
    { id: 31, name: 'CPWB Child Protection Institution', city: 'Multan', district: 'Multan', address: 'Multan', lat: 30.1500, lng: 71.5400, total_children: 44, staff_count: 12, cameras: 8, status: 'online', risk_level: 'low' },
    { id: 32, name: 'CPWB Child Protection Institution', city: 'Gujranwala', district: 'Gujranwala', address: 'Gujranwala', lat: 32.2000, lng: 74.1800, total_children: 38, staff_count: 10, cameras: 7, status: 'online', risk_level: 'low' },
    { id: 33, name: 'CPWB Child Protection Institution', city: 'Sialkot', district: 'Sialkot', address: 'Sialkot', lat: 32.4800, lng: 74.5400, total_children: 35, staff_count: 9, cameras: 6, status: 'online', risk_level: 'medium' },
    { id: 34, name: 'CPWB Child Protection Institution', city: 'Bahawalpur', district: 'Bahawalpur', address: 'Bahawalpur', lat: 29.4000, lng: 71.6700, total_children: 40, staff_count: 10, cameras: 6, status: 'online', risk_level: 'low' },
    { id: 35, name: 'CPWB Child Protection Institution', city: 'Rahim Yar Khan', district: 'Rahim Yar Khan', address: 'Rahim Yar Khan', lat: 28.4212, lng: 70.2989, total_children: 36, staff_count: 9, cameras: 5, status: 'online', risk_level: 'medium' },
    { id: 36, name: 'CPWB Child Protection Institution', city: 'Sahiwal', district: 'Sahiwal', address: 'Sahiwal', lat: 30.6682, lng: 73.1114, total_children: 32, staff_count: 8, cameras: 5, status: 'online', risk_level: 'low' },
    { id: 37, name: 'CPWB Child Protection Unit', city: 'Kasur', district: 'Kasur', address: 'Kasur', lat: 31.1167, lng: 74.4500, total_children: 28, staff_count: 8, cameras: 6, status: 'online', risk_level: 'low' },
    { id: 38, name: 'CPWB Child Protection Unit', city: 'Rajanpur', district: 'Rajanpur', address: 'Rajanpur', lat: 29.1044, lng: 70.3301, total_children: 22, staff_count: 6, cameras: 3, status: 'offline', risk_level: 'high' },
    { id: 39, name: 'CPWB Child Protection Institution', city: 'Sargodha', district: 'Sargodha', address: 'Sargodha', lat: 32.0900, lng: 72.6750, total_children: 34, staff_count: 9, cameras: 5, status: 'online', risk_level: 'low' },
    { id: 40, name: 'CPWB Child Protection Institution', city: 'Hafizabad', district: 'Hafizabad', address: 'Hafizabad', lat: 32.0709, lng: 73.6880, total_children: 26, staff_count: 7, cameras: 4, status: 'online', risk_level: 'low' },
    { id: 41, name: 'CPWB Child Protection Institution', city: 'D.G. Khan', district: 'Dera Ghazi Khan', address: 'D.G. Khan', lat: 30.0600, lng: 70.6550, total_children: 30, staff_count: 8, cameras: 4, status: 'online', risk_level: 'medium' },

    // Edhi Foundation Child Homes (8)
    { id: 42, name: 'Edhi Foundation Child Home', city: 'Lahore', district: 'Lahore', address: 'Edhi Centre, Lahore', lat: 31.5560, lng: 74.3100, total_children: 45, staff_count: 12, cameras: 8, status: 'online', risk_level: 'low' },
    { id: 43, name: 'Edhi Foundation Child Home (Gulberg)', city: 'Lahore', district: 'Lahore', address: 'Gulberg, Lahore', lat: 31.5150, lng: 74.3500, total_children: 38, staff_count: 10, cameras: 6, status: 'online', risk_level: 'low' },
    { id: 44, name: 'Edhi Foundation Child Home (Township)', city: 'Lahore', district: 'Lahore', address: 'Township, Lahore', lat: 31.4750, lng: 74.3150, total_children: 35, staff_count: 9, cameras: 5, status: 'online', risk_level: 'low' },
    { id: 45, name: 'Edhi Foundation Child Home', city: 'Multan', district: 'Multan', address: 'Multan', lat: 30.1900, lng: 71.4900, total_children: 42, staff_count: 11, cameras: 7, status: 'online', risk_level: 'low' },
    { id: 46, name: 'Edhi Foundation Child Home', city: 'Rawalpindi', district: 'Rawalpindi', address: 'Rawalpindi', lat: 33.5550, lng: 73.0600, total_children: 40, staff_count: 10, cameras: 6, status: 'online', risk_level: 'low' },
    { id: 47, name: 'Edhi Foundation Child Home', city: 'Faisalabad', district: 'Faisalabad', address: 'Faisalabad', lat: 31.4050, lng: 73.0950, total_children: 36, staff_count: 9, cameras: 5, status: 'online', risk_level: 'low' },
    { id: 48, name: 'Edhi Foundation Child Home', city: 'Gujranwala', district: 'Gujranwala', address: 'Gujranwala', lat: 32.1750, lng: 74.2050, total_children: 30, staff_count: 8, cameras: 4, status: 'online', risk_level: 'low' },
    { id: 49, name: 'Edhi Foundation Child Home', city: 'Bahawalpur', district: 'Bahawalpur', address: 'Bahawalpur', lat: 29.3600, lng: 71.7100, total_children: 28, staff_count: 7, cameras: 4, status: 'online', risk_level: 'medium' },

    // Al-Khidmat Aghosh Homes (7)
    { id: 50, name: 'Aghosh Home (Al-Khidmat)', city: 'Attock', district: 'Attock', address: 'Attock', lat: 33.7660, lng: 72.3609, total_children: 55, staff_count: 14, cameras: 10, status: 'online', risk_level: 'low' },
    { id: 51, name: 'Aghosh Home (Al-Khidmat)', city: 'Gujranwala', district: 'Gujranwala', address: 'Gujranwala', lat: 32.2050, lng: 74.2100, total_children: 50, staff_count: 13, cameras: 8, status: 'online', risk_level: 'low' },
    { id: 52, name: 'Aghosh Home (Al-Khidmat)', city: 'Rawalpindi', district: 'Rawalpindi', address: 'Rawalpindi', lat: 33.5850, lng: 73.0350, total_children: 48, staff_count: 12, cameras: 8, status: 'online', risk_level: 'low' },
    { id: 53, name: 'Aghosh Home (Al-Khidmat)', city: 'Faisalabad', district: 'Faisalabad', address: 'Faisalabad', lat: 31.4350, lng: 73.0500, total_children: 45, staff_count: 12, cameras: 7, status: 'online', risk_level: 'low' },
    { id: 54, name: 'Aghosh Home (Al-Khidmat) Boys', city: 'Sheikhupura', district: 'Sheikhupura', address: 'Sheikhupura', lat: 31.7131, lng: 73.9850, total_children: 42, staff_count: 11, cameras: 6, status: 'online', risk_level: 'low' },
    { id: 55, name: 'Aghosh Home (Al-Khidmat) Girls', city: 'Sheikhupura', district: 'Sheikhupura', address: 'Sheikhupura', lat: 31.7200, lng: 73.9750, total_children: 38, staff_count: 10, cameras: 6, status: 'online', risk_level: 'low' },
    { id: 56, name: 'Aghosh Home (Al-Khidmat)', city: 'Murree', district: 'Rawalpindi', address: 'Murree', lat: 33.9100, lng: 73.3900, total_children: 35, staff_count: 9, cameras: 5, status: 'online', risk_level: 'low' },

    // Kashana Home (Government)
    { id: 57, name: 'Kashana Home', city: 'Lahore', district: 'Lahore', address: 'Near Mall Road, Lahore', lat: 31.5620, lng: 74.3280, total_children: 60, staff_count: 16, cameras: 10, status: 'online', risk_level: 'low' },

    // Pakistan Sweet Home
    { id: 58, name: 'Pakistan Sweet Home', city: 'Rawalpindi', district: 'Rawalpindi', address: 'Rawalpindi', lat: 33.5550, lng: 73.0100, total_children: 80, staff_count: 22, cameras: 16, status: 'online', risk_level: 'low' },

    // Other Known NGOs
    { id: 59, name: 'Mera Ghar Orphanage', city: 'Rawalpindi', district: 'Rawalpindi', address: 'Rawalpindi', lat: 33.5650, lng: 73.0250, total_children: 32, staff_count: 8, cameras: 5, status: 'online', risk_level: 'low' },
    { id: 60, name: 'Saba Homes', city: 'Rawalpindi', district: 'Rawalpindi', address: 'Rawalpindi', lat: 33.5750, lng: 73.0100, total_children: 28, staff_count: 7, cameras: 4, status: 'online', risk_level: 'low' },
    { id: 61, name: 'Roshni Homes', city: 'Gujranwala', district: 'Gujranwala', address: 'Gujranwala', lat: 32.1950, lng: 74.1850, total_children: 35, staff_count: 9, cameras: 5, status: 'online', risk_level: 'low' },
    { id: 62, name: 'Almarah Foundation', city: 'Lahore', district: 'Lahore', address: 'Lahore', lat: 31.5000, lng: 74.3600, total_children: 25, staff_count: 7, cameras: 4, status: 'online', risk_level: 'low' },
    { id: 63, name: 'Quba Foundation', city: 'Lahore', district: 'Lahore', address: 'Lahore', lat: 31.4900, lng: 74.3300, total_children: 22, staff_count: 6, cameras: 3, status: 'online', risk_level: 'medium' },
    { id: 64, name: 'Aasra Welfare Society', city: 'Lahore', district: 'Lahore', address: 'Lahore', lat: 31.5500, lng: 74.3700, total_children: 20, staff_count: 6, cameras: 3, status: 'online', risk_level: 'low' },
    { id: 65, name: 'Blessed Orphan Centre', city: 'Lahore', district: 'Lahore', address: 'Lahore', lat: 31.5250, lng: 74.3800, total_children: 30, staff_count: 8, cameras: 4, status: 'online', risk_level: 'low' },

    // Additional NGO/Edhi/Al-Khidmat branches across remaining districts
    { id: 66, name: 'Edhi Foundation Child Home', city: 'Sahiwal', district: 'Sahiwal', address: 'Sahiwal', lat: 30.6600, lng: 73.1000, total_children: 25, staff_count: 7, cameras: 3, status: 'online', risk_level: 'low' },
    { id: 67, name: 'Edhi Foundation Child Home', city: 'Rahim Yar Khan', district: 'Rahim Yar Khan', address: 'Rahim Yar Khan', lat: 28.4300, lng: 70.3100, total_children: 28, staff_count: 7, cameras: 4, status: 'online', risk_level: 'low' },
    { id: 68, name: 'Edhi Foundation Child Home', city: 'Sargodha', district: 'Sargodha', address: 'Sargodha', lat: 32.0600, lng: 72.7100, total_children: 26, staff_count: 7, cameras: 3, status: 'online', risk_level: 'low' },
    { id: 69, name: 'Edhi Foundation Child Home', city: 'Jhang', district: 'Jhang', address: 'Jhang', lat: 31.2681, lng: 72.3181, total_children: 22, staff_count: 6, cameras: 3, status: 'online', risk_level: 'medium' },
    { id: 70, name: 'Al-Khidmat Foundation Orphanage', city: 'Multan', district: 'Multan', address: 'Bosan Road, Multan', lat: 30.1575, lng: 71.5249, total_children: 55, staff_count: 14, cameras: 10, status: 'online', risk_level: 'low' },
    { id: 71, name: 'Edhi Foundation Child Home', city: 'Gujarat', district: 'Gujarat', address: 'Gujarat', lat: 32.5731, lng: 74.0789, total_children: 24, staff_count: 6, cameras: 3, status: 'online', risk_level: 'low' },
    { id: 72, name: 'Al-Khidmat Foundation Orphanage', city: 'Gujarat', district: 'Gujarat', address: 'Gujarat', lat: 32.5800, lng: 74.0900, total_children: 30, staff_count: 8, cameras: 4, status: 'online', risk_level: 'low' },
    { id: 73, name: 'Edhi Foundation Child Home', city: 'Jhelum', district: 'Jhelum', address: 'Jhelum', lat: 32.9341, lng: 73.7257, total_children: 22, staff_count: 6, cameras: 3, status: 'online', risk_level: 'low' },
    { id: 74, name: 'Edhi Foundation Child Home', city: 'Okara', district: 'Okara', address: 'Okara', lat: 30.8138, lng: 73.4534, total_children: 20, staff_count: 5, cameras: 3, status: 'online', risk_level: 'low' },
    { id: 75, name: 'Edhi Foundation Child Home', city: 'Vehari', district: 'Vehari', address: 'Vehari', lat: 30.0452, lng: 72.3489, total_children: 18, staff_count: 5, cameras: 2, status: 'online', risk_level: 'medium' },
    { id: 76, name: 'Al-Khidmat Foundation Orphanage', city: 'Khanewal', district: 'Khanewal', address: 'Khanewal', lat: 30.3018, lng: 71.9321, total_children: 25, staff_count: 7, cameras: 3, status: 'online', risk_level: 'low' },
    { id: 77, name: 'Edhi Foundation Child Home', city: 'Muzaffargarh', district: 'Muzaffargarh', address: 'Muzaffargarh', lat: 30.0729, lng: 71.1943, total_children: 20, staff_count: 5, cameras: 2, status: 'offline', risk_level: 'high' },
    { id: 78, name: 'Al-Khidmat Foundation Orphanage', city: 'Bahawalnagar', district: 'Bahawalnagar', address: 'Bahawalnagar', lat: 29.9944, lng: 73.2533, total_children: 22, staff_count: 6, cameras: 3, status: 'online', risk_level: 'low' },
    { id: 79, name: 'Edhi Foundation Child Home', city: 'Mandi Bahauddin', district: 'Mandi Bahauddin', address: 'Mandi Bahauddin', lat: 32.5861, lng: 73.4917, total_children: 18, staff_count: 5, cameras: 2, status: 'online', risk_level: 'low' },
    { id: 80, name: 'Al-Khidmat Foundation Orphanage', city: 'Chiniot', district: 'Chiniot', address: 'Chiniot', lat: 31.7200, lng: 72.9789, total_children: 20, staff_count: 5, cameras: 3, status: 'online', risk_level: 'low' },
    { id: 81, name: 'Edhi Foundation Child Home', city: 'Toba Tek Singh', district: 'Toba Tek Singh', address: 'Toba Tek Singh', lat: 30.9709, lng: 72.4826, total_children: 18, staff_count: 5, cameras: 2, status: 'online', risk_level: 'low' },
    { id: 82, name: 'Al-Khidmat Foundation Orphanage', city: 'Mianwali', district: 'Mianwali', address: 'Mianwali', lat: 32.5853, lng: 71.5436, total_children: 22, staff_count: 6, cameras: 3, status: 'online', risk_level: 'medium' },
    { id: 83, name: 'Edhi Foundation Child Home', city: 'Khushab', district: 'Khushab', address: 'Khushab', lat: 32.2967, lng: 72.3533, total_children: 16, staff_count: 4, cameras: 2, status: 'online', risk_level: 'low' },
    { id: 84, name: 'Edhi Foundation Child Home', city: 'Layyah', district: 'Layyah', address: 'Layyah', lat: 30.9693, lng: 70.9428, total_children: 15, staff_count: 4, cameras: 2, status: 'online', risk_level: 'medium' },
    { id: 85, name: 'Edhi Foundation Child Home', city: 'Pakpattan', district: 'Pakpattan', address: 'Pakpattan', lat: 30.3500, lng: 73.3900, total_children: 16, staff_count: 4, cameras: 2, status: 'online', risk_level: 'low' },
  ],
  children: [
    { id: 1, orphanage_id: 1, name: 'Ahmed Khan', age: 8, gender: 'Male', photo_url: null, admitted_date: '2024-01-15', medical_notes: 'Healthy, regular checkups', status: 'active', created_at: new Date().toISOString() },
    { id: 2, orphanage_id: 1, name: 'Fatima Ali', age: 6, gender: 'Female', photo_url: null, admitted_date: '2024-03-20', medical_notes: 'Mild asthma, inhaler prescribed', status: 'active', created_at: new Date().toISOString() },
    { id: 3, orphanage_id: 1, name: 'Hassan Raza', age: 10, gender: 'Male', photo_url: null, admitted_date: '2023-11-01', medical_notes: 'No known conditions', status: 'active', created_at: new Date().toISOString() },
    { id: 4, orphanage_id: 2, name: 'Ayesha Bibi', age: 7, gender: 'Female', photo_url: null, admitted_date: '2024-05-10', medical_notes: 'Allergic to peanuts', status: 'active', created_at: new Date().toISOString() },
    { id: 5, orphanage_id: 2, name: 'Usman Tariq', age: 9, gender: 'Male', photo_url: null, admitted_date: '2023-08-22', medical_notes: 'Wears glasses, annual eye checkup', status: 'active', created_at: new Date().toISOString() },
    { id: 6, orphanage_id: 3, name: 'Zainab Noor', age: 5, gender: 'Female', photo_url: null, admitted_date: '2024-07-01', medical_notes: 'Vaccinations up to date', status: 'active', created_at: new Date().toISOString() },
    { id: 7, orphanage_id: 4, name: 'Bilal Ahmed', age: 11, gender: 'Male', photo_url: null, admitted_date: '2023-06-15', medical_notes: 'Fractured arm (healed)', status: 'active', created_at: new Date().toISOString() },
    { id: 8, orphanage_id: 5, name: 'Sana Malik', age: 8, gender: 'Female', photo_url: null, admitted_date: '2024-02-28', medical_notes: 'Regular dental checkups needed', status: 'active', created_at: new Date().toISOString() },
  ],
  health_records: [],
  visitors: [],
  alerts: [],
  incidents: [],
  zones: [
    { id: 1, orphanage_id: 1, name: 'Main Hall', description: 'Central play and activity area', expected_count: 15, current_count: 0, status: 'active' },
    { id: 2, orphanage_id: 1, name: 'Dormitory A', description: 'Boys sleeping quarters', expected_count: 10, current_count: 0, status: 'active' },
    { id: 3, orphanage_id: 1, name: 'Dormitory B', description: 'Girls sleeping quarters', expected_count: 10, current_count: 0, status: 'active' },
    { id: 4, orphanage_id: 1, name: 'Kitchen', description: 'Restricted area', expected_count: 3, current_count: 0, status: 'active' },
    { id: 5, orphanage_id: 1, name: 'Garden', description: 'Outdoor play area', expected_count: 12, current_count: 0, status: 'active' },
    { id: 6, orphanage_id: 1, name: 'Main Gate', description: 'Entry and exit', expected_count: 0, current_count: 0, status: 'active' },
    { id: 7, orphanage_id: 1, name: 'Study Room', description: 'Homework area', expected_count: 8, current_count: 0, status: 'active' },
  ],
  activity_log: [],
  growth_records: [],
  notifications: [],
  emotion_detections: [],
  counters: { children: 8, health_records: 0, visitors: 0, alerts: 0, incidents: 0, activity_log: 0, orphanages: 85, growth_records: 0, notifications: 0, emotion_detections: 0 }
};

class Store {
  constructor() {
    this.data = this.load();
    if (!this.data.orphanages) this.data = JSON.parse(JSON.stringify(defaultData));
    if (!this.data.incidents) this.data.incidents = [];
    if (!this.data.counters.incidents) this.data.counters.incidents = 0;
    if (!this.data.growth_records) this.data.growth_records = [];
    if (!this.data.counters.growth_records) this.data.counters.growth_records = 0;
    if (!this.data.notifications) this.data.notifications = [];
    if (!this.data.counters.notifications) this.data.counters.notifications = 0;
    if (!this.data.emotion_detections) this.data.emotion_detections = [];
    if (!this.data.counters.emotion_detections) this.data.counters.emotion_detections = 0;
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) { /* ignore */ }
    return JSON.parse(JSON.stringify(defaultData));
  }

  save() {
    try { fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2)); }
    catch (e) { console.error('Save failed:', e.message); }
  }

  nextId(table) {
    this.data.counters[table] = (this.data.counters[table] || 0) + 1;
    return this.data.counters[table];
  }

  // Orphanages
  getOrphanages() { return this.data.orphanages; }

  getOrphanage(id) { return this.data.orphanages.find(o => o.id === parseInt(id)); }

  addOrphanage(orphanage) {
    orphanage.id = this.nextId('orphanages');
    orphanage.status = 'online';
    orphanage.risk_level = 'low';
    this.data.orphanages.push(orphanage);
    this.save();
    return orphanage;
  }

  updateOrphanage(id, updates) {
    const o = this.data.orphanages.find(x => x.id === parseInt(id));
    if (o) { Object.assign(o, updates); this.save(); }
    return o;
  }

  // Children
  getChildren(orphanageId) {
    let list = this.data.children.filter(c => c.status === 'active');
    if (orphanageId) list = list.filter(c => c.orphanage_id === parseInt(orphanageId));
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }

  addChild(child) {
    child.id = this.nextId('children');
    child.created_at = new Date().toISOString();
    child.status = 'active';
    child.admitted_date = child.admitted_date || new Date().toISOString().split('T')[0];
    this.data.children.push(child);
    this.save();
    return child;
  }

  updateChild(id, updates) {
    const child = this.data.children.find(c => c.id === parseInt(id));
    if (child) { Object.assign(child, updates); this.save(); }
    return child;
  }

  getHealthRecords(childId) {
    return this.data.health_records
      .filter(r => r.child_id === parseInt(childId))
      .sort((a, b) => new Date(b.record_date) - new Date(a.record_date));
  }

  addHealthRecord(childId, record) {
    record.id = this.nextId('health_records');
    record.child_id = parseInt(childId);
    record.record_date = record.record_date || new Date().toISOString().split('T')[0];
    record.created_at = new Date().toISOString();
    this.data.health_records.push(record);
    this.save();
    return record;
  }

  // Visitors
  getVisitors(orphanageId, limit = 50) {
    let list = this.data.visitors;
    if (orphanageId) list = list.filter(v => v.orphanage_id === parseInt(orphanageId));
    return list.sort((a, b) => new Date(b.check_in) - new Date(a.check_in)).slice(0, limit);
  }

  addVisitor(visitor) {
    visitor.id = this.nextId('visitors');
    visitor.check_in = new Date().toISOString();
    visitor.check_out = null;
    visitor.status = 'checked_in';
    this.data.visitors.push(visitor);
    this.save();
    return visitor;
  }

  checkoutVisitor(id) {
    const visitor = this.data.visitors.find(v => v.id === parseInt(id));
    if (visitor) { visitor.check_out = new Date().toISOString(); visitor.status = 'checked_out'; this.save(); }
    return visitor;
  }

  // Alerts
  getAlerts(orphanageId, limit = 50) {
    let list = this.data.alerts;
    if (orphanageId) list = list.filter(a => a.orphanage_id === parseInt(orphanageId));
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, limit);
  }

  addAlert(alert) {
    alert.id = this.nextId('alerts');
    alert.acknowledged = false;
    alert.created_at = new Date().toISOString();
    this.data.alerts.push(alert);
    this.save();
    return alert;
  }

  acknowledgeAlert(id) {
    const alert = this.data.alerts.find(a => a.id === parseInt(id));
    if (alert) { alert.acknowledged = true; this.save(); }
    return alert;
  }

  // Incidents (violence/harassment)
  getIncidents(orphanageId, limit = 50) {
    let list = this.data.incidents;
    if (orphanageId) list = list.filter(i => i.orphanage_id === parseInt(orphanageId));
    return list.sort((a, b) => new Date(b.detected_at) - new Date(a.detected_at)).slice(0, limit);
  }

  addIncident(incident) {
    incident.id = this.nextId('incidents');
    incident.detected_at = new Date().toISOString();
    incident.status = 'open';
    incident.reviewed = false;
    this.data.incidents.push(incident);
    this.save();
    return incident;
  }

  updateIncident(id, updates) {
    const inc = this.data.incidents.find(i => i.id === parseInt(id));
    if (inc) { Object.assign(inc, updates); this.save(); }
    return inc;
  }

  // Zones
  getZones(orphanageId) {
    let list = this.data.zones;
    if (orphanageId) list = list.filter(z => z.orphanage_id === parseInt(orphanageId));
    return list.sort((a, b) => a.id - b.id);
  }

  updateZoneCount(zoneName, count) {
    const zone = this.data.zones.find(z => z.name === zoneName);
    if (zone) zone.current_count = count;
  }

  // Activity
  getActivity(orphanageId, limit = 30) {
    let list = this.data.activity_log;
    if (orphanageId) list = list.filter(a => a.orphanage_id === parseInt(orphanageId));
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, limit).map(a => {
      const zone = this.data.zones.find(z => z.id === a.zone_id);
      return { ...a, zone_name: zone ? zone.name : null };
    });
  }

  addActivity(event) {
    event.id = this.nextId('activity_log');
    event.created_at = new Date().toISOString();
    this.data.activity_log.push(event);
    if (this.data.activity_log.length > 500) this.data.activity_log = this.data.activity_log.slice(-250);
    this.save();
    return event;
  }

  // Growth Records
  getGrowthRecords(childId) {
    return this.data.growth_records
      .filter(r => r.child_id === parseInt(childId))
      .sort((a, b) => new Date(b.recorded_date) - new Date(a.recorded_date));
  }

  addGrowthRecord(childId, record) {
    record.id = this.nextId('growth_records');
    record.child_id = parseInt(childId);
    record.recorded_date = record.recorded_date || new Date().toISOString().split('T')[0];
    record.created_at = new Date().toISOString();
    this.data.growth_records.push(record);
    this.save();
    return record;
  }

  // Notifications
  getNotifications(limit = 50) {
    return this.data.notifications
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
  }

  addNotification(notification) {
    notification.id = this.nextId('notifications');
    notification.read = false;
    notification.created_at = new Date().toISOString();
    this.data.notifications.push(notification);
    if (this.data.notifications.length > 500) this.data.notifications = this.data.notifications.slice(-250);
    this.save();
    return notification;
  }

  markNotificationRead(id) {
    const notif = this.data.notifications.find(n => n.id === parseInt(id));
    if (notif) { notif.read = true; this.save(); }
    return notif;
  }

  markAllNotificationsRead() {
    this.data.notifications.forEach(n => { n.read = true; });
    this.save();
  }

  getUnreadCount() {
    return this.data.notifications.filter(n => !n.read).length;
  }

  // Emotion Detections
  getEmotionDetections(orphanageId, limit = 50) {
    let list = this.data.emotion_detections;
    if (orphanageId) list = list.filter(e => e.orphanage_id === parseInt(orphanageId));
    return list.sort((a, b) => new Date(b.detected_at) - new Date(a.detected_at)).slice(0, limit);
  }

  addEmotionDetection(detection) {
    detection.id = this.nextId('emotion_detections');
    detection.detected_at = new Date().toISOString();
    this.data.emotion_detections.push(detection);
    if (this.data.emotion_detections.length > 500) this.data.emotion_detections = this.data.emotion_detections.slice(-250);
    this.save();
    return detection;
  }

  // Rankings
  getRankings() {
    return this.data.orphanages.map(o => {
      const incidents = this.data.incidents.filter(i => i.orphanage_id === o.id);
      const alerts = this.data.alerts.filter(a => a.orphanage_id === o.id);
      const openIncidents = incidents.filter(i => !i.reviewed).length;
      const criticalIncidents = incidents.filter(i => i.severity === 'critical' && !i.reviewed).length;
      const unresolvedAlerts = alerts.filter(a => !a.acknowledged).length;
      const totalIncidents = incidents.length;
      const reviewedIncidents = incidents.filter(i => i.reviewed).length;
      const responseRate = totalIncidents > 0 ? Math.round((reviewedIncidents / totalIncidents) * 100) : 100;
      const staffRatio = o.total_children > 0 ? (o.staff_count / o.total_children) : 0;
      const cameraCoverage = o.cameras > 0 ? Math.min(100, Math.round((o.cameras / Math.max(1, Math.ceil(o.total_children / 8))) * 100)) : 0;

      let score = 100;
      score -= criticalIncidents * 8;
      score -= openIncidents * 4;
      score -= unresolvedAlerts * 2;
      score -= (o.risk_level === 'high' ? 15 : o.risk_level === 'medium' ? 5 : 0);
      score += (responseRate >= 90 ? 5 : responseRate >= 70 ? 2 : 0);
      score += (staffRatio >= 0.3 ? 5 : staffRatio >= 0.2 ? 2 : 0);
      score += (cameraCoverage >= 80 ? 5 : cameraCoverage >= 50 ? 2 : 0);
      score -= (o.status === 'offline' ? 10 : 0);
      score = Math.max(0, Math.min(100, Math.round(score)));

      const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 50 ? 'D' : 'F';
      return {
        ...o, score, grade, responseRate, staffRatio: Math.round(staffRatio * 100),
        cameraCoverage, openIncidents, criticalIncidents, unresolvedAlerts,
        totalIncidents, reviewedIncidents
      };
    }).sort((a, b) => b.score - a.score).map((o, i) => ({ ...o, rank: i + 1 }));
  }

  // Stats
  getStats(orphanageId) {
    const filter = orphanageId ? parseInt(orphanageId) : null;
    return {
      totalChildren: this.data.children.filter(c => c.status === 'active' && (!filter || c.orphanage_id === filter)).length,
      activeVisitors: this.data.visitors.filter(v => v.status === 'checked_in' && (!filter || v.orphanage_id === filter)).length,
      pendingAlerts: this.data.alerts.filter(a => !a.acknowledged && (!filter || a.orphanage_id === filter)).length,
      openIncidents: this.data.incidents.filter(i => i.status === 'open' && (!filter || i.orphanage_id === filter)).length,
      zones: this.getZones(orphanageId),
      totalOrphanages: this.data.orphanages.length,
      onlineOrphanages: this.data.orphanages.filter(o => o.status === 'online').length,
    };
  }
}

module.exports = new Store();
