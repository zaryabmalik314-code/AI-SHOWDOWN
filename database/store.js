const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data.json');

const defaultData = {
  orphanages: [
    // SOS Children's Villages (6)
    { id: 1, name: "SOS Children's Village", city: 'Lahore', district: 'Lahore', address: 'Johar Town, Lahore', lat: 31.4697, lng: 74.2728, total_children: 120, staff_count: 35, cameras: 24, status: 'online', risk_level: 'low', compliance_score: 96, last_inspection: '2026-09-28' },
    { id: 2, name: "SOS Children's Village", city: 'Rawalpindi', district: 'Rawalpindi', address: 'G.T. Road, opposite High Court, Rawalpindi', lat: 33.5651, lng: 73.0169, total_children: 95, staff_count: 28, cameras: 20, status: 'online', risk_level: 'low', compliance_score: 94, last_inspection: '2026-09-15' },
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
    // SOS Lahore (id:1)
    { id: 1, orphanage_id: 1, name: 'Ahmed Khan', age: 8, gender: 'Male', photo_url: null, admitted_date: '2024-01-15', medical_notes: 'Healthy, regular checkups', status: 'active', created_at: '2024-01-15T09:00:00Z' },
    { id: 2, orphanage_id: 1, name: 'Fatima Ali', age: 6, gender: 'Female', photo_url: null, admitted_date: '2024-03-20', medical_notes: 'Mild asthma, inhaler prescribed', status: 'active', created_at: '2024-03-20T09:00:00Z' },
    { id: 3, orphanage_id: 1, name: 'Hassan Raza', age: 10, gender: 'Male', photo_url: null, admitted_date: '2023-11-01', medical_notes: 'No known conditions', status: 'active', created_at: '2023-11-01T09:00:00Z' },
    { id: 4, orphanage_id: 1, name: 'Maryam Shahid', age: 7, gender: 'Female', photo_url: null, admitted_date: '2024-06-12', medical_notes: 'Iron supplement prescribed', status: 'active', created_at: '2024-06-12T09:00:00Z' },
    { id: 5, orphanage_id: 1, name: 'Abdullah Farooq', age: 12, gender: 'Male', photo_url: null, admitted_date: '2023-04-08', medical_notes: 'Dental braces, quarterly review', status: 'active', created_at: '2023-04-08T09:00:00Z' },
    // SOS Rawalpindi (id:2)
    { id: 6, orphanage_id: 2, name: 'Ayesha Bibi', age: 7, gender: 'Female', photo_url: null, admitted_date: '2024-05-10', medical_notes: 'Allergic to peanuts', status: 'active', created_at: '2024-05-10T09:00:00Z' },
    { id: 7, orphanage_id: 2, name: 'Usman Tariq', age: 9, gender: 'Male', photo_url: null, admitted_date: '2023-08-22', medical_notes: 'Wears glasses, annual eye checkup', status: 'active', created_at: '2023-08-22T09:00:00Z' },
    { id: 8, orphanage_id: 2, name: 'Rabia Naz', age: 5, gender: 'Female', photo_url: null, admitted_date: '2025-01-10', medical_notes: 'Vaccinations up to date', status: 'active', created_at: '2025-01-10T09:00:00Z' },
    { id: 9, orphanage_id: 2, name: 'Kamran Javed', age: 11, gender: 'Male', photo_url: null, admitted_date: '2023-09-15', medical_notes: 'Eczema treatment ongoing', status: 'active', created_at: '2023-09-15T09:00:00Z' },
    // SOS Faisalabad (id:3)
    { id: 10, orphanage_id: 3, name: 'Zainab Noor', age: 5, gender: 'Female', photo_url: null, admitted_date: '2024-07-01', medical_notes: 'Vaccinations up to date', status: 'active', created_at: '2024-07-01T09:00:00Z' },
    { id: 11, orphanage_id: 3, name: 'Hamza Iqbal', age: 9, gender: 'Male', photo_url: null, admitted_date: '2024-02-14', medical_notes: 'Mild hearing loss (left ear), hearing aid fitted', status: 'active', created_at: '2024-02-14T09:00:00Z' },
    { id: 12, orphanage_id: 3, name: 'Nadia Parveen', age: 8, gender: 'Female', photo_url: null, admitted_date: '2023-12-20', medical_notes: 'No known conditions', status: 'active', created_at: '2023-12-20T09:00:00Z' },
    // SOS Multan (id:4)
    { id: 13, orphanage_id: 4, name: 'Bilal Ahmed', age: 11, gender: 'Male', photo_url: null, admitted_date: '2023-06-15', medical_notes: 'Fractured arm (healed)', status: 'active', created_at: '2023-06-15T09:00:00Z' },
    { id: 14, orphanage_id: 4, name: 'Hira Batool', age: 6, gender: 'Female', photo_url: null, admitted_date: '2024-08-05', medical_notes: 'Underweight, nutritional plan active', status: 'active', created_at: '2024-08-05T09:00:00Z' },
    { id: 15, orphanage_id: 4, name: 'Owais Rauf', age: 10, gender: 'Male', photo_url: null, admitted_date: '2023-03-18', medical_notes: 'Asthma, inhaler and nebulizer', status: 'active', created_at: '2023-03-18T09:00:00Z' },
    // SOS Sargodha (id:5)
    { id: 16, orphanage_id: 5, name: 'Sana Malik', age: 8, gender: 'Female', photo_url: null, admitted_date: '2024-02-28', medical_notes: 'Regular dental checkups needed', status: 'active', created_at: '2024-02-28T09:00:00Z' },
    { id: 17, orphanage_id: 5, name: 'Talha Mehmood', age: 13, gender: 'Male', photo_url: null, admitted_date: '2022-11-10', medical_notes: 'Healthy, sports physical cleared', status: 'active', created_at: '2022-11-10T09:00:00Z' },
    // Punjab Model Boys Lahore (id:7)
    { id: 18, orphanage_id: 7, name: 'Arslan Shahzad', age: 9, gender: 'Male', photo_url: null, admitted_date: '2024-04-22', medical_notes: 'Vitamin D deficiency, supplement prescribed', status: 'active', created_at: '2024-04-22T09:00:00Z' },
    { id: 19, orphanage_id: 7, name: 'Faizan Haider', age: 7, gender: 'Male', photo_url: null, admitted_date: '2024-09-01', medical_notes: 'No known conditions', status: 'active', created_at: '2024-09-01T09:00:00Z' },
    { id: 20, orphanage_id: 7, name: 'Rizwan Abbas', age: 12, gender: 'Male', photo_url: null, admitted_date: '2023-02-15', medical_notes: 'Corrective lenses, annual review', status: 'active', created_at: '2023-02-15T09:00:00Z' },
    // Punjab Model Girls Lahore (id:8)
    { id: 21, orphanage_id: 8, name: 'Amna Khalid', age: 6, gender: 'Female', photo_url: null, admitted_date: '2024-11-05', medical_notes: 'Recent tonsillectomy, follow-up in 3 months', status: 'active', created_at: '2024-11-05T09:00:00Z' },
    { id: 22, orphanage_id: 8, name: 'Sadia Anwar', age: 10, gender: 'Female', photo_url: null, admitted_date: '2023-07-20', medical_notes: 'Healthy', status: 'active', created_at: '2023-07-20T09:00:00Z' },
    // CPWB Lahore (id:28)
    { id: 23, orphanage_id: 28, name: 'Imran Yousaf', age: 8, gender: 'Male', photo_url: null, admitted_date: '2024-01-30', medical_notes: 'Hepatitis B vaccinated', status: 'active', created_at: '2024-01-30T09:00:00Z' },
    { id: 24, orphanage_id: 28, name: 'Kiran Aslam', age: 5, gender: 'Female', photo_url: null, admitted_date: '2025-02-14', medical_notes: 'Developmental delay monitoring', status: 'active', created_at: '2025-02-14T09:00:00Z' },
    { id: 25, orphanage_id: 28, name: 'Shoaib Akhtar', age: 14, gender: 'Male', photo_url: null, admitted_date: '2022-06-01', medical_notes: 'Healthy, athletic', status: 'active', created_at: '2022-06-01T09:00:00Z' },
    { id: 26, orphanage_id: 28, name: 'Nimra Fatima', age: 9, gender: 'Female', photo_url: null, admitted_date: '2023-10-10', medical_notes: 'Iron deficiency, monthly blood test', status: 'active', created_at: '2023-10-10T09:00:00Z' },
    // Edhi Lahore (id:42)
    { id: 27, orphanage_id: 42, name: 'Taimoor Shah', age: 7, gender: 'Male', photo_url: null, admitted_date: '2024-05-20', medical_notes: 'No known conditions', status: 'active', created_at: '2024-05-20T09:00:00Z' },
    { id: 28, orphanage_id: 42, name: 'Misbah Qadir', age: 11, gender: 'Female', photo_url: null, admitted_date: '2023-08-15', medical_notes: 'Mild scoliosis, physiotherapy', status: 'active', created_at: '2023-08-15T09:00:00Z' },
    { id: 29, orphanage_id: 42, name: 'Waqas Hussain', age: 6, gender: 'Male', photo_url: null, admitted_date: '2024-12-01', medical_notes: 'Healthy', status: 'active', created_at: '2024-12-01T09:00:00Z' },
    // Aghosh Attock (id:50)
    { id: 30, orphanage_id: 50, name: 'Danish Nawaz', age: 10, gender: 'Male', photo_url: null, admitted_date: '2023-05-05', medical_notes: 'TB treatment completed, follow-up clear', status: 'active', created_at: '2023-05-05T09:00:00Z' },
    { id: 31, orphanage_id: 50, name: 'Arooj Zahra', age: 8, gender: 'Female', photo_url: null, admitted_date: '2024-03-10', medical_notes: 'Epilepsy medication (Levetiracetam)', status: 'active', created_at: '2024-03-10T09:00:00Z' },
    // Kashana Lahore (id:57)
    { id: 32, orphanage_id: 57, name: 'Mehwish Saleem', age: 13, gender: 'Female', photo_url: null, admitted_date: '2022-09-01', medical_notes: 'Healthy, counseling sessions weekly', status: 'active', created_at: '2022-09-01T09:00:00Z' },
    { id: 33, orphanage_id: 57, name: 'Laiba Aftab', age: 7, gender: 'Female', photo_url: null, admitted_date: '2024-07-18', medical_notes: 'Lactose intolerant', status: 'active', created_at: '2024-07-18T09:00:00Z' },
    { id: 34, orphanage_id: 57, name: 'Iqra Bibi', age: 9, gender: 'Female', photo_url: null, admitted_date: '2023-12-01', medical_notes: 'Vaccinations up to date', status: 'active', created_at: '2023-12-01T09:00:00Z' },
    // Pakistan Sweet Home Rwp (id:58)
    { id: 35, orphanage_id: 58, name: 'Saad Rehman', age: 10, gender: 'Male', photo_url: null, admitted_date: '2023-01-20', medical_notes: 'No known conditions', status: 'active', created_at: '2023-01-20T09:00:00Z' },
    { id: 36, orphanage_id: 58, name: 'Aliza Nadeem', age: 6, gender: 'Female', photo_url: null, admitted_date: '2024-10-15', medical_notes: 'Speech therapy ongoing', status: 'active', created_at: '2024-10-15T09:00:00Z' },
    { id: 37, orphanage_id: 58, name: 'Farhan Gill', age: 14, gender: 'Male', photo_url: null, admitted_date: '2022-03-10', medical_notes: 'Healthy, captain of cricket team', status: 'active', created_at: '2022-03-10T09:00:00Z' },
    { id: 38, orphanage_id: 58, name: 'Noor Jehan', age: 8, gender: 'Female', photo_url: null, admitted_date: '2024-04-01', medical_notes: 'Skin allergy, topical cream', status: 'active', created_at: '2024-04-01T09:00:00Z' },
    // CPWB Multan (id:31)
    { id: 39, orphanage_id: 31, name: 'Qasim Ali', age: 9, gender: 'Male', photo_url: null, admitted_date: '2024-06-22', medical_notes: 'Bed-wetting treatment, improving', status: 'active', created_at: '2024-06-22T09:00:00Z' },
    { id: 40, orphanage_id: 31, name: 'Sundas Rafiq', age: 7, gender: 'Female', photo_url: null, admitted_date: '2024-08-14', medical_notes: 'No known conditions', status: 'active', created_at: '2024-08-14T09:00:00Z' },
    // D.G. Khan Girls (id:19 - high risk, offline)
    { id: 41, orphanage_id: 19, name: 'Rubina Khatoon', age: 10, gender: 'Female', photo_url: null, admitted_date: '2023-11-20', medical_notes: 'Malnourished at admission, recovery plan active', status: 'active', created_at: '2023-11-20T09:00:00Z' },
    { id: 42, orphanage_id: 19, name: 'Samina Bano', age: 6, gender: 'Female', photo_url: null, admitted_date: '2024-09-05', medical_notes: 'Scabies treatment completed', status: 'active', created_at: '2024-09-05T09:00:00Z' },
    // Rajanpur (id:38 - high risk, offline)
    { id: 43, orphanage_id: 38, name: 'Adeel Sarwar', age: 12, gender: 'Male', photo_url: null, admitted_date: '2023-07-10', medical_notes: 'Hepatitis C positive, treatment ongoing', status: 'active', created_at: '2023-07-10T09:00:00Z' },
    // Al-Khidmat Multan (id:70)
    { id: 44, orphanage_id: 70, name: 'Haroon Rashid', age: 8, gender: 'Male', photo_url: null, admitted_date: '2024-01-05', medical_notes: 'Healthy', status: 'active', created_at: '2024-01-05T09:00:00Z' },
    { id: 45, orphanage_id: 70, name: 'Sumayya Bibi', age: 11, gender: 'Female', photo_url: null, admitted_date: '2023-06-20', medical_notes: 'Thalassemia minor, regular monitoring', status: 'active', created_at: '2023-06-20T09:00:00Z' },
    { id: 46, orphanage_id: 70, name: 'Naveed Iqbal', age: 5, gender: 'Male', photo_url: null, admitted_date: '2025-03-01', medical_notes: 'Recent admission, initial assessment pending', status: 'active', created_at: '2025-03-01T09:00:00Z' },
    // Edhi Multan (id:45)
    { id: 47, orphanage_id: 45, name: 'Tayyaba Shahzadi', age: 9, gender: 'Female', photo_url: null, admitted_date: '2024-02-10', medical_notes: 'No known conditions', status: 'active', created_at: '2024-02-10T09:00:00Z' },
    { id: 48, orphanage_id: 45, name: 'Junaid Masih', age: 7, gender: 'Male', photo_url: null, admitted_date: '2024-11-20', medical_notes: 'Dental caries, treatment scheduled', status: 'active', created_at: '2024-11-20T09:00:00Z' },
    // Aghosh Gujranwala (id:51)
    { id: 49, orphanage_id: 51, name: 'Zohaib Raza', age: 10, gender: 'Male', photo_url: null, admitted_date: '2023-09-01', medical_notes: 'Healthy, plays football', status: 'active', created_at: '2023-09-01T09:00:00Z' },
    { id: 50, orphanage_id: 51, name: 'Maham Tariq', age: 6, gender: 'Female', photo_url: null, admitted_date: '2024-12-15', medical_notes: 'Growth monitoring — below 3rd percentile', status: 'active', created_at: '2024-12-15T09:00:00Z' },
    // Mera Ghar Rawalpindi (id:59)
    { id: 51, orphanage_id: 59, name: 'Umair Zafar', age: 13, gender: 'Male', photo_url: null, admitted_date: '2022-10-10', medical_notes: 'Healthy, preparing for board exams', status: 'active', created_at: '2022-10-10T09:00:00Z' },
    { id: 52, orphanage_id: 59, name: 'Bushra Kiran', age: 8, gender: 'Female', photo_url: null, admitted_date: '2024-03-25', medical_notes: 'Thyroid medication', status: 'active', created_at: '2024-03-25T09:00:00Z' },
    // CPWB Faisalabad (id:29)
    { id: 53, orphanage_id: 29, name: 'Asad Mehmood', age: 11, gender: 'Male', photo_url: null, admitted_date: '2023-04-12', medical_notes: 'ADHD, behavioral therapy', status: 'active', created_at: '2023-04-12T09:00:00Z' },
    { id: 54, orphanage_id: 29, name: 'Sidra Kanwal', age: 7, gender: 'Female', photo_url: null, admitted_date: '2024-08-30', medical_notes: 'No known conditions', status: 'active', created_at: '2024-08-30T09:00:00Z' },
    // Punjab Model Bahawalpur Boys (id:16)
    { id: 55, orphanage_id: 16, name: 'Irfan Mustafa', age: 9, gender: 'Male', photo_url: null, admitted_date: '2024-05-01', medical_notes: 'Healthy', status: 'active', created_at: '2024-05-01T09:00:00Z' },
    // SOS Sialkot (id:6)
    { id: 56, orphanage_id: 6, name: 'Huma Asghar', age: 8, gender: 'Female', photo_url: null, admitted_date: '2024-06-15', medical_notes: 'Celiac disease, gluten-free diet', status: 'active', created_at: '2024-06-15T09:00:00Z' },
    { id: 57, orphanage_id: 6, name: 'Shayan Ali', age: 12, gender: 'Male', photo_url: null, admitted_date: '2023-01-08', medical_notes: 'No known conditions', status: 'active', created_at: '2023-01-08T09:00:00Z' },
    // Dar-ul-Falah Lahore (id:22)
    { id: 58, orphanage_id: 22, name: 'Anum Riaz', age: 5, gender: 'Female', photo_url: null, admitted_date: '2025-01-20', medical_notes: 'Healthy, settling in well', status: 'active', created_at: '2025-01-20T09:00:00Z' },
    { id: 59, orphanage_id: 22, name: 'Wajid Hussain', age: 10, gender: 'Male', photo_url: null, admitted_date: '2023-10-05', medical_notes: 'Flat feet, orthotic insoles', status: 'active', created_at: '2023-10-05T09:00:00Z' },
    // CPWB Kasur (id:37)
    { id: 60, orphanage_id: 37, name: 'Saima Jabeen', age: 9, gender: 'Female', photo_url: null, admitted_date: '2024-04-14', medical_notes: 'Counseling for trauma, improving', status: 'active', created_at: '2024-04-14T09:00:00Z' },
  ],
  health_records: [
    { id: 1, child_id: 1, record_date: '2026-09-15', type: 'checkup', doctor: 'Dr. Amina Rafiq', notes: 'Routine checkup, all vitals normal. Height 128cm, Weight 26kg.', vitals: { bp: '95/60', temp: 36.7, pulse: 82 }, created_at: '2026-09-15T10:00:00Z' },
    { id: 2, child_id: 1, record_date: '2026-06-10', type: 'vaccination', doctor: 'Dr. Amina Rafiq', notes: 'Hepatitis B booster administered.', vitals: { bp: '92/58', temp: 36.5, pulse: 78 }, created_at: '2026-06-10T10:00:00Z' },
    { id: 3, child_id: 2, record_date: '2026-09-20', type: 'checkup', doctor: 'Dr. Saeed Ahmad', notes: 'Asthma stable, peak flow 210. Continue current medication.', vitals: { bp: '88/55', temp: 36.8, pulse: 88 }, created_at: '2026-09-20T10:00:00Z' },
    { id: 4, child_id: 13, record_date: '2026-08-05', type: 'follow-up', doctor: 'Dr. Nasir Javed', notes: 'Arm fracture fully healed, full range of motion restored. Cleared for sports.', vitals: { bp: '100/65', temp: 36.6, pulse: 76 }, created_at: '2026-08-05T10:00:00Z' },
    { id: 5, child_id: 14, record_date: '2026-09-28', type: 'nutrition', doctor: 'Dr. Farhat Bano', notes: 'Weight gained 1.2kg since last visit. BMI improving. Continue nutritional supplements.', vitals: { bp: '85/52', temp: 36.5, pulse: 90 }, created_at: '2026-09-28T10:00:00Z' },
    { id: 6, child_id: 31, record_date: '2026-10-01', type: 'specialist', doctor: 'Dr. Tahir Mehmood (Neurologist)', notes: 'Seizure-free for 8 months. EEG normal. Continue Levetiracetam 250mg BD.', vitals: { bp: '90/58', temp: 36.6, pulse: 80 }, created_at: '2026-10-01T10:00:00Z' },
    { id: 7, child_id: 41, record_date: '2026-09-10', type: 'nutrition', doctor: 'Dr. Farhat Bano', notes: 'Weight 22kg (up from 18kg at admission). Height 130cm. BMI 13.0 — still underweight but improving.', vitals: { bp: '88/54', temp: 36.7, pulse: 86 }, created_at: '2026-09-10T10:00:00Z' },
    { id: 8, child_id: 53, record_date: '2026-09-25', type: 'behavioral', doctor: 'Dr. Sobia Ashraf (Psychologist)', notes: 'ADHD behavioral therapy session #14. Focus improving, teacher reports better classroom behavior.', vitals: null, created_at: '2026-09-25T10:00:00Z' },
  ],
  visitors: [
    { id: 1, name: 'Col. (R) Shahid Mehmood', cnic: '35201-1234567-1', phone: '0321-5551234', purpose: 'Government Inspection', photo_url: null, orphanage_id: 1, check_in: '2026-10-09T09:15:00Z', check_out: null, status: 'checked_in' },
    { id: 2, name: 'Dr. Nazia Parveen', cnic: '35202-9876543-2', phone: '0300-4567890', purpose: 'Medical Camp', photo_url: null, orphanage_id: 1, check_in: '2026-10-09T08:30:00Z', check_out: null, status: 'checked_in' },
    { id: 3, name: 'Malik Tariq Hussain', cnic: '35201-5555678-3', phone: '0333-1112233', purpose: 'Family Visit (Ahmed Khan)', photo_url: null, orphanage_id: 1, check_in: '2026-10-08T14:00:00Z', check_out: '2026-10-08T16:30:00Z', status: 'checked_out' },
    { id: 4, name: 'Tahira Begum', cnic: '37405-2223344-4', phone: '0345-6667788', purpose: 'NGO Audit (UNICEF)', photo_url: null, orphanage_id: 28, check_in: '2026-10-09T10:00:00Z', check_out: null, status: 'checked_in' },
    { id: 5, name: 'Advocate Sohail Rana', cnic: '35201-8889900-5', phone: '0301-3334455', purpose: 'Legal Review', photo_url: null, orphanage_id: 28, check_in: '2026-10-08T11:00:00Z', check_out: '2026-10-08T13:45:00Z', status: 'checked_out' },
    { id: 6, name: 'Haji Abdul Rashid', cnic: '36302-4445566-6', phone: '0312-7778899', purpose: 'Donation Delivery', photo_url: null, orphanage_id: 42, check_in: '2026-10-09T07:45:00Z', check_out: '2026-10-09T08:30:00Z', status: 'checked_out' },
    { id: 7, name: 'Sarah Johnson', cnic: 'PASSPORT-UK-12345', phone: '+44-7700-900123', purpose: 'International NGO Visit (Save the Children)', photo_url: null, orphanage_id: 1, check_in: '2026-10-07T10:00:00Z', check_out: '2026-10-07T15:00:00Z', status: 'checked_out' },
    { id: 8, name: 'Prof. Dr. Khalid Mahmood', cnic: '35202-1112233-8', phone: '0321-9990011', purpose: 'Academic Research', photo_url: null, orphanage_id: 57, check_in: '2026-10-09T09:00:00Z', check_out: null, status: 'checked_in' },
    { id: 9, name: 'Nasreen Akhtar', cnic: '36601-7778899-9', phone: '0300-1234567', purpose: 'Family Visit (Qasim Ali)', photo_url: null, orphanage_id: 31, check_in: '2026-10-08T10:30:00Z', check_out: '2026-10-08T12:00:00Z', status: 'checked_out' },
    { id: 10, name: 'Ch. Nadeem Ashraf (MPA)', cnic: '35201-6667788-0', phone: '0333-5556677', purpose: 'Parliamentary Inspection Visit', photo_url: null, orphanage_id: 7, check_in: '2026-10-09T11:00:00Z', check_out: null, status: 'checked_in' },
    { id: 11, name: 'Syed Amir Shah', cnic: '34101-3334455-1', phone: '0345-2223344', purpose: 'Zakat Distribution', photo_url: null, orphanage_id: 50, check_in: '2026-10-07T09:00:00Z', check_out: '2026-10-07T11:30:00Z', status: 'checked_out' },
    { id: 12, name: 'Rukhsana Kausar', cnic: '36302-8889900-2', phone: '0321-4445566', purpose: 'Prospective Foster Parent', photo_url: null, orphanage_id: 58, check_in: '2026-10-09T13:00:00Z', check_out: null, status: 'checked_in' },
    { id: 13, name: 'Inspector Zubair Qureshi', cnic: '35201-2223344-3', phone: '0300-8889900', purpose: 'Police Verification', photo_url: null, orphanage_id: 37, check_in: '2026-10-08T15:00:00Z', check_out: '2026-10-08T16:00:00Z', status: 'checked_out' },
    { id: 14, name: 'Engr. Bilal Saeed', cnic: '35201-9990011-4', phone: '0333-7778899', purpose: 'Building Safety Inspection', photo_url: null, orphanage_id: 19, check_in: '2026-10-06T10:00:00Z', check_out: '2026-10-06T14:00:00Z', status: 'checked_out' },
    { id: 15, name: 'Maulana Qari Abdul Basit', cnic: '36601-5556677-5', phone: '0312-1112233', purpose: 'Religious Education Assessment', photo_url: null, orphanage_id: 70, check_in: '2026-10-09T08:00:00Z', check_out: null, status: 'checked_in' },
    { id: 16, name: 'Dr. Farzana Altaf', cnic: '35202-4445566-6', phone: '0345-9990011', purpose: 'Psychological Assessment', photo_url: null, orphanage_id: 29, check_in: '2026-10-08T09:30:00Z', check_out: '2026-10-08T12:30:00Z', status: 'checked_out' },
    { id: 17, name: 'Kamran Akmal (Volunteer)', cnic: '35201-1112233-7', phone: '0300-3334455', purpose: 'Volunteer Teaching (English)', photo_url: null, orphanage_id: 51, check_in: '2026-10-09T14:00:00Z', check_out: null, status: 'checked_in' },
    { id: 18, name: 'Mrs. Shahida Parveen', cnic: '35202-6667788-8', phone: '0321-5556677', purpose: 'Donation — Winter Clothes', photo_url: null, orphanage_id: 22, check_in: '2026-10-07T11:00:00Z', check_out: '2026-10-07T11:45:00Z', status: 'checked_out' },
  ],
  alerts: (function() {
    const _alerts = [];
    const _alertData = [
      { type: 'headcount_mismatch', severity: 'high', message: 'Headcount mismatch detected at CPWB Child Protection Institution, D.G. Khan', detail: 'Expected: 8, Detected: 12. Scanning adjacent zones.', camera_id: 'CAM-A1 Main Hall', ai_model: 'ProximityAI v1.2', zone: 'Main Hall', orphanage_id: 41, days_ago: 1 },
      { type: 'restricted_zone', severity: 'critical', message: 'Unauthorized person in restricted zone at Punjab Model Children Home (Girls), D.G. Khan', detail: 'Unregistered adult detected via facial recognition. ID match: NONE.', camera_id: 'CAM-C1 Kitchen', ai_model: 'ProximityAI v1.2', zone: 'Kitchen', orphanage_id: 19, days_ago: 0 },
      { type: 'perimeter_breach', severity: 'critical', message: 'Perimeter movement detected after hours at CPWB Child Protection Unit, Rajanpur', detail: 'Motion sensor + thermal camera triggered. Recording flagged for review.', camera_id: 'CAM-E2 Back Gate', ai_model: 'PoseGuard v1.4', zone: 'Main Gate', orphanage_id: 38, days_ago: 2 },
      { type: 'camera_offline', severity: 'medium', message: 'Camera feed interrupted at Edhi Foundation Child Home, Muzaffargarh', detail: 'Feed lost for 38s. Network check in progress. Last frame saved.', camera_id: 'CAM-B1 Dormitory', ai_model: 'System', zone: 'Dormitory A', orphanage_id: 77, days_ago: 0 },
      { type: 'child_missing', severity: 'critical', message: "Child not detected in expected zone at SOS Children's Village, Lahore", detail: 'Last seen 8 minutes ago at Garden. Cross-camera tracking initiated.', camera_id: 'CAM-D1 Playground', ai_model: 'ProximityAI v1.2', zone: 'Garden', orphanage_id: 1, days_ago: 3 },
      { type: 'loitering', severity: 'medium', message: 'Loitering detected near entrance at Edhi Foundation Child Home, Jhang', detail: 'Individual stationary for 12+ minutes at facility perimeter.', camera_id: 'CAM-E1 Main Gate', ai_model: 'PoseGuard v1.4', zone: 'Main Gate', orphanage_id: 69, days_ago: 1 },
      { type: 'headcount_mismatch', severity: 'high', message: "Headcount mismatch detected at SOS Children's Village, Rawalpindi", detail: 'Expected: 10, Detected: 7. Scanning adjacent zones.', camera_id: 'CAM-B2 Washroom Entry', ai_model: 'ProximityAI v1.2', zone: 'Dormitory A', orphanage_id: 2, days_ago: 4 },
      { type: 'restricted_zone', severity: 'critical', message: 'Unauthorized person in restricted zone at Al-Khidmat Foundation Orphanage, Multan', detail: 'Unregistered adult detected via facial recognition. ID match: NONE.', camera_id: 'CAM-C1 Kitchen', ai_model: 'ProximityAI v1.2', zone: 'Kitchen', orphanage_id: 70, days_ago: 5 },
      { type: 'camera_offline', severity: 'medium', message: 'Camera feed interrupted at Punjab Model Children Home (Girls), Sargodha', detail: 'Feed lost for 22s. Network restored. Last frame saved.', camera_id: 'CAM-F1 Study Room', ai_model: 'System', zone: 'Study Room', orphanage_id: 15, days_ago: 2 },
      { type: 'perimeter_breach', severity: 'critical', message: 'Perimeter movement detected after hours at CPWB Child Protection Institution, Rahim Yar Khan', detail: 'Motion sensor + thermal camera triggered. Recording flagged for review.', camera_id: 'CAM-E1 Main Gate', ai_model: 'PoseGuard v1.4', zone: 'Main Gate', orphanage_id: 35, days_ago: 6 },
      { type: 'child_missing', severity: 'critical', message: 'Child not detected in expected zone at Aghosh Home (Al-Khidmat), Attock', detail: 'Last seen 5 minutes ago at Study Room. Cross-camera tracking initiated.', camera_id: 'CAM-F1 Study Room', ai_model: 'ProximityAI v1.2', zone: 'Study Room', orphanage_id: 50, days_ago: 1 },
      { type: 'loitering', severity: 'medium', message: 'Loitering detected near entrance at Dar-ul-Falah, Sargodha', detail: 'Individual stationary for 9+ minutes at facility perimeter.', camera_id: 'CAM-E1 Main Gate', ai_model: 'PoseGuard v1.4', zone: 'Main Gate', orphanage_id: 24, days_ago: 3 },
      { type: 'headcount_mismatch', severity: 'high', message: 'Headcount mismatch detected at CPWB Child Protection Institution, Sahiwal', detail: 'Expected: 6, Detected: 10. Scanning adjacent zones.', camera_id: 'CAM-D1 Playground', ai_model: 'ProximityAI v1.2', zone: 'Garden', orphanage_id: 36, days_ago: 0 },
      { type: 'camera_offline', severity: 'medium', message: 'Camera feed interrupted at CPWB Child Protection Unit, Rajanpur', detail: 'Feed lost for 55s. Network check in progress. Last frame saved.', camera_id: 'CAM-A2 Corridor', ai_model: 'System', zone: 'Main Hall', orphanage_id: 38, days_ago: 0 },
    ];
    const now = Date.now();
    _alertData.forEach((a, i) => {
      const ts = new Date(now - a.days_ago * 86400000 - Math.floor(Math.random() * 43200000));
      _alerts.push({ id: i + 1, type: a.type, severity: a.severity, message: a.message, detail: a.detail, camera_id: a.camera_id, ai_model: a.ai_model, zone: a.zone, orphanage_id: a.orphanage_id, acknowledged: a.days_ago > 2, created_at: ts.toISOString() });
    });
    return _alerts;
  })(),
  incidents: (function() {
    const _incidents = [];
    const _incidentData = [
      { type: 'physical_violence', label: 'Physical Violence', severity: 'critical', orphanage_id: 19, days_ago: 0, confidence: 91.3, ai_model: 'ViolenceNet v2.1', camera_id: 'CAM-A1 Main Hall', zone: 'Main Hall', persons: 3, reviewed: false },
      { type: 'verbal_abuse', label: 'Verbal Abuse', severity: 'high', orphanage_id: 38, days_ago: 1, confidence: 78.5, ai_model: 'AudioSense v2.0', camera_id: 'CAM-C2 Dining', zone: 'Kitchen', persons: 2, reviewed: false },
      { type: 'bullying', label: 'Bullying', severity: 'high', orphanage_id: 19, days_ago: 1, confidence: 82.1, ai_model: 'ViolenceNet v2.1', camera_id: 'CAM-D1 Playground', zone: 'Garden', persons: 4, reviewed: false },
      { type: 'neglect', label: 'Neglect Indicator', severity: 'medium', orphanage_id: 41, days_ago: 2, confidence: 74.6, ai_model: 'ProximityAI v1.2', camera_id: 'CAM-B1 Dormitory', zone: 'Dormitory A', persons: 1, reviewed: true },
      { type: 'rough_handling', label: 'Rough Handling', severity: 'high', orphanage_id: 19, days_ago: 3, confidence: 85.9, ai_model: 'PoseGuard v1.4', camera_id: 'CAM-A2 Corridor', zone: 'Main Hall', persons: 2, reviewed: true },
      { type: 'distress', label: 'Child Distress', severity: 'high', orphanage_id: 38, days_ago: 2, confidence: 79.2, ai_model: 'FaceEmotion v3.0', camera_id: 'CAM-B1 Dormitory', zone: 'Dormitory A', persons: 1, reviewed: false },
      { type: 'harassment', label: 'Harassment', severity: 'critical', orphanage_id: 77, days_ago: 4, confidence: 88.7, ai_model: 'PoseGuard v1.4', camera_id: 'CAM-B2 Washroom Entry', zone: 'Dormitory B', persons: 2, reviewed: true },
      { type: 'unauthorized_contact', label: 'Unauthorized Contact', severity: 'critical', orphanage_id: 38, days_ago: 5, confidence: 92.4, ai_model: 'ProximityAI v1.2', camera_id: 'CAM-E1 Main Gate', zone: 'Main Gate', persons: 3, reviewed: true },
      { type: 'verbal_abuse', label: 'Verbal Abuse', severity: 'high', orphanage_id: 69, days_ago: 1, confidence: 73.8, ai_model: 'AudioSense v2.0', camera_id: 'CAM-C1 Kitchen', zone: 'Kitchen', persons: 2, reviewed: false },
      { type: 'physical_violence', label: 'Physical Violence', severity: 'critical', orphanage_id: 35, days_ago: 3, confidence: 87.2, ai_model: 'ViolenceNet v2.1', camera_id: 'CAM-D1 Playground', zone: 'Garden', persons: 2, reviewed: true },
      { type: 'neglect', label: 'Neglect Indicator', severity: 'medium', orphanage_id: 82, days_ago: 2, confidence: 71.3, ai_model: 'ProximityAI v1.2', camera_id: 'CAM-F1 Study Room', zone: 'Study Room', persons: 1, reviewed: false },
      { type: 'bullying', label: 'Bullying', severity: 'high', orphanage_id: 24, days_ago: 0, confidence: 76.9, ai_model: 'ViolenceNet v2.1', camera_id: 'CAM-D1 Playground', zone: 'Garden', persons: 3, reviewed: false },
      { type: 'distress', label: 'Child Distress', severity: 'high', orphanage_id: 15, days_ago: 4, confidence: 81.5, ai_model: 'FaceEmotion v3.0', camera_id: 'CAM-B1 Dormitory', zone: 'Dormitory B', persons: 1, reviewed: true },
      { type: 'rough_handling', label: 'Rough Handling', severity: 'high', orphanage_id: 49, days_ago: 6, confidence: 80.1, ai_model: 'PoseGuard v1.4', camera_id: 'CAM-A1 Main Hall', zone: 'Main Hall', persons: 2, reviewed: true },
      { type: 'verbal_abuse', label: 'Verbal Abuse', severity: 'high', orphanage_id: 19, days_ago: 5, confidence: 75.0, ai_model: 'AudioSense v2.0', camera_id: 'CAM-C2 Dining', zone: 'Kitchen', persons: 2, reviewed: true },
      { type: 'physical_violence', label: 'Physical Violence', severity: 'critical', orphanage_id: 41, days_ago: 6, confidence: 89.6, ai_model: 'ViolenceNet v2.1', camera_id: 'CAM-A2 Corridor', zone: 'Main Hall', persons: 2, reviewed: true },
      { type: 'neglect', label: 'Neglect Indicator', severity: 'medium', orphanage_id: 84, days_ago: 3, confidence: 69.8, ai_model: 'ProximityAI v1.2', camera_id: 'CAM-B1 Dormitory', zone: 'Dormitory A', persons: 1, reviewed: false },
      { type: 'harassment', label: 'Harassment', severity: 'critical', orphanage_id: 19, days_ago: 7, confidence: 90.2, ai_model: 'PoseGuard v1.4', camera_id: 'CAM-A1 Main Hall', zone: 'Main Hall', persons: 2, reviewed: true },
      { type: 'unauthorized_contact', label: 'Unauthorized Contact', severity: 'critical', orphanage_id: 69, days_ago: 3, confidence: 93.1, ai_model: 'ProximityAI v1.2', camera_id: 'CAM-E2 Back Gate', zone: 'Main Gate', persons: 2, reviewed: true },
      { type: 'bullying', label: 'Bullying', severity: 'high', orphanage_id: 75, days_ago: 2, confidence: 77.4, ai_model: 'ViolenceNet v2.1', camera_id: 'CAM-D1 Playground', zone: 'Garden', persons: 3, reviewed: false },
    ];
    const now = Date.now();
    _incidentData.forEach((inc, i) => {
      const ts = new Date(now - inc.days_ago * 86400000 - Math.floor(Math.random() * 43200000));
      _incidents.push({
        id: i + 1, type: inc.type, label: inc.label, severity: inc.severity, orphanage_id: inc.orphanage_id,
        description: `${inc.label} detected at orphanage #${inc.orphanage_id}. ${inc.persons} person(s) involved. Zone: ${inc.zone}.`,
        zone: inc.zone, confidence: inc.confidence, ai_model: inc.ai_model, model_backbone: 'CNN',
        detection_type: 'action_recognition', camera_id: inc.camera_id, frame_count: Math.floor(Math.random() * 45) + 10,
        persons_detected: inc.persons, bounding_box: { x: 200, y: 100, w: 120, h: 160 },
        inference_ms: Math.floor(Math.random() * 80) + 20, detected_at: ts.toISOString(),
        status: inc.reviewed ? 'reviewed' : 'open', reviewed: inc.reviewed,
      });
    });
    return _incidents;
  })(),
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
  counters: { children: 60, health_records: 8, visitors: 18, alerts: 14, incidents: 20, activity_log: 0, orphanages: 85, growth_records: 0, notifications: 0, emotion_detections: 0 }
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
    this.data.orphanages.forEach(o => {
      if (o.compliance_score == null) {
        const base = o.risk_level === 'high' ? 45 : o.risk_level === 'medium' ? 68 : 82;
        const seed = ((o.id * 7 + 13) % 17);
        o.compliance_score = Math.min(98, base + seed);
        const d = new Date(); d.setDate(d.getDate() - ((o.id * 3 + 5) % 90));
        o.last_inspection = d.toISOString().split('T')[0];
      }
    });
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
      const complianceScore = o.compliance_score || 75;

      let score = 100;
      score -= criticalIncidents * 8;
      score -= openIncidents * 4;
      score -= unresolvedAlerts * 2;
      score -= (o.risk_level === 'high' ? 15 : o.risk_level === 'medium' ? 5 : 0);
      score += (responseRate >= 90 ? 5 : responseRate >= 70 ? 2 : 0);
      score += (staffRatio >= 0.3 ? 5 : staffRatio >= 0.2 ? 2 : 0);
      score += (cameraCoverage >= 80 ? 5 : cameraCoverage >= 50 ? 2 : 0);
      score -= (o.status === 'offline' ? 10 : 0);
      score += (complianceScore >= 90 ? 5 : complianceScore >= 70 ? 2 : complianceScore < 50 ? -5 : 0);
      score = Math.max(0, Math.min(100, Math.round(score)));

      const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 50 ? 'D' : 'F';
      return {
        ...o, score, grade, responseRate, staffRatio: Math.round(staffRatio * 100),
        cameraCoverage, complianceScore, openIncidents, criticalIncidents, unresolvedAlerts,
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
