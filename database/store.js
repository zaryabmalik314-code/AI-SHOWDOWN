const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data.json');

const defaultData = {
  orphanages: [
    // --- LAHORE (5) ---
    { id: 1, name: 'SOS Children\'s Village Lahore', city: 'Lahore', district: 'Lahore', address: 'Ferozepur Road, Lahore 54600', lat: 31.4505, lng: 74.3150, total_children: 150, staff_count: 45, cameras: 24, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept', org: 'SOS Children\'s Villages Pakistan' },
    { id: 2, name: 'Edhi Home Lahore', city: 'Lahore', district: 'Lahore', address: '17-A Muslim Block, Allama Iqbal Town, Lahore', lat: 31.5082, lng: 74.2891, total_children: 85, staff_count: 22, cameras: 14, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Edhi Foundation', org: 'Edhi Foundation' },
    { id: 3, name: 'Child Protection & Welfare Bureau Lahore', city: 'Lahore', district: 'Lahore', address: 'Jallo Mor, Lahore', lat: 31.5875, lng: 74.3949, total_children: 120, staff_count: 35, cameras: 20, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Home Dept (Govt)', org: 'CPWB Punjab' },
    { id: 4, name: 'Kashana Dar-ul-Atfal Lahore', city: 'Lahore', district: 'Lahore', address: 'Gulberg III, Lahore', lat: 31.5195, lng: 74.3480, total_children: 75, staff_count: 20, cameras: 12, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    { id: 5, name: 'Anjuman Himayat-e-Islam Orphanage Lahore', city: 'Lahore', district: 'Lahore', address: 'Lower Mall Road, Lahore', lat: 31.5590, lng: 74.3230, total_children: 95, staff_count: 28, cameras: 16, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept', org: 'Anjuman Himayat-e-Islam' },
    // --- RAWALPINDI / ISLAMABAD (4) ---
    { id: 6, name: 'Al-Khidmat Aghosh Home Rawalpindi', city: 'Rawalpindi', district: 'Rawalpindi', address: 'Satellite Town, Rawalpindi', lat: 33.5916, lng: 73.0550, total_children: 60, staff_count: 18, cameras: 12, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept', org: 'Al-Khidmat Foundation' },
    { id: 7, name: 'Kashana Rawalpindi', city: 'Rawalpindi', district: 'Rawalpindi', address: 'Committee Chowk, Rawalpindi', lat: 33.5977, lng: 73.0479, total_children: 50, staff_count: 14, cameras: 8, status: 'online', risk_level: 'medium', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    { id: 8, name: 'Pakistan Sweet Home Islamabad', city: 'Islamabad', district: 'Islamabad', address: 'Sector G-9/1, Islamabad', lat: 33.7070, lng: 73.0420, total_children: 200, staff_count: 50, cameras: 32, status: 'online', risk_level: 'low', registered: true, reg_authority: 'ICT Administration', org: 'Pakistan Sweet Home' },
    { id: 9, name: 'Edhi Home Rawalpindi', city: 'Rawalpindi', district: 'Rawalpindi', address: 'Murree Road, Rawalpindi', lat: 33.6150, lng: 73.0710, total_children: 45, staff_count: 12, cameras: 8, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Edhi Foundation', org: 'Edhi Foundation' },
    // --- FAISALABAD (3) ---
    { id: 10, name: 'Al-Khidmat Aghosh Home Faisalabad', city: 'Faisalabad', district: 'Faisalabad', address: 'Peoples Colony No. 1, Faisalabad', lat: 31.4290, lng: 73.0840, total_children: 55, staff_count: 15, cameras: 10, status: 'online', risk_level: 'medium', registered: true, reg_authority: 'Punjab Social Welfare Dept', org: 'Al-Khidmat Foundation' },
    { id: 11, name: 'Kashana Faisalabad', city: 'Faisalabad', district: 'Faisalabad', address: 'Civil Lines, Faisalabad', lat: 31.4180, lng: 73.0760, total_children: 40, staff_count: 12, cameras: 8, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    { id: 12, name: 'Edhi Home Faisalabad', city: 'Faisalabad', district: 'Faisalabad', address: 'Jaranwala Road, Faisalabad', lat: 31.4510, lng: 73.1120, total_children: 38, staff_count: 10, cameras: 6, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Edhi Foundation', org: 'Edhi Foundation' },
    // --- MULTAN (4) ---
    { id: 13, name: 'SOS Children\'s Village Multan', city: 'Multan', district: 'Multan', address: 'Bosan Road, Multan', lat: 30.2150, lng: 71.4430, total_children: 130, staff_count: 38, cameras: 20, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept', org: 'SOS Children\'s Villages Pakistan' },
    { id: 14, name: 'Kashana Multan', city: 'Multan', district: 'Multan', address: 'Kutchery Road, Multan', lat: 30.1960, lng: 71.4750, total_children: 55, staff_count: 16, cameras: 10, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    { id: 15, name: 'Edhi Home Multan', city: 'Multan', district: 'Multan', address: 'Nishtar Road, Multan', lat: 30.1840, lng: 71.4680, total_children: 42, staff_count: 11, cameras: 8, status: 'online', risk_level: 'medium', registered: true, reg_authority: 'Edhi Foundation', org: 'Edhi Foundation' },
    { id: 16, name: 'Al-Khidmat Aghosh Home Multan', city: 'Multan', district: 'Multan', address: 'Shah Rukn-e-Alam Colony, Multan', lat: 30.2280, lng: 71.4590, total_children: 48, staff_count: 14, cameras: 8, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept', org: 'Al-Khidmat Foundation' },
    // --- GUJRANWALA (3) ---
    { id: 17, name: 'Al-Khidmat Aghosh Home Gujranwala', city: 'Gujranwala', district: 'Gujranwala', address: 'Civil Lines, Gujranwala', lat: 32.1617, lng: 74.1883, total_children: 42, staff_count: 11, cameras: 8, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept', org: 'Al-Khidmat Foundation' },
    { id: 18, name: 'Kashana Gujranwala', city: 'Gujranwala', district: 'Gujranwala', address: 'Satellite Town, Gujranwala', lat: 32.1740, lng: 74.2010, total_children: 32, staff_count: 9, cameras: 6, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    { id: 19, name: 'Edhi Home Gujranwala', city: 'Gujranwala', district: 'Gujranwala', address: 'GT Road, Gujranwala', lat: 32.1550, lng: 74.1760, total_children: 28, staff_count: 8, cameras: 6, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Edhi Foundation', org: 'Edhi Foundation' },
    // --- SIALKOT (3) ---
    { id: 20, name: 'Kashana Sialkot', city: 'Sialkot', district: 'Sialkot', address: 'Cantt Area, Sialkot', lat: 32.4945, lng: 74.5229, total_children: 35, staff_count: 10, cameras: 6, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    { id: 21, name: 'Al-Khidmat Aghosh Home Sialkot', city: 'Sialkot', district: 'Sialkot', address: 'Paris Road, Sialkot', lat: 32.5070, lng: 74.5340, total_children: 38, staff_count: 11, cameras: 8, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept', org: 'Al-Khidmat Foundation' },
    { id: 22, name: 'Edhi Home Sialkot', city: 'Sialkot', district: 'Sialkot', address: 'Kutchery Road, Sialkot', lat: 32.4870, lng: 74.5180, total_children: 25, staff_count: 7, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Edhi Foundation', org: 'Edhi Foundation' },
    // --- SARGODHA (2) ---
    { id: 23, name: 'Kashana Sargodha', city: 'Sargodha', district: 'Sargodha', address: 'University Road, Sargodha', lat: 32.0836, lng: 72.6711, total_children: 35, staff_count: 10, cameras: 6, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    { id: 24, name: 'Al-Khidmat Aghosh Home Sargodha', city: 'Sargodha', district: 'Sargodha', address: 'Fatima Jinnah Road, Sargodha', lat: 32.0740, lng: 72.6820, total_children: 30, staff_count: 9, cameras: 6, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept', org: 'Al-Khidmat Foundation' },
    // --- BAHAWALPUR (3) ---
    { id: 25, name: 'Kashana Bahawalpur', city: 'Bahawalpur', district: 'Bahawalpur', address: 'Model Town, Bahawalpur', lat: 29.3940, lng: 71.6830, total_children: 40, staff_count: 12, cameras: 8, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    { id: 26, name: 'Edhi Home Bahawalpur', city: 'Bahawalpur', district: 'Bahawalpur', address: 'Circular Road, Bahawalpur', lat: 29.3850, lng: 71.6720, total_children: 30, staff_count: 8, cameras: 6, status: 'online', risk_level: 'medium', registered: true, reg_authority: 'Edhi Foundation', org: 'Edhi Foundation' },
    { id: 27, name: 'Al-Khidmat Aghosh Home Bahawalpur', city: 'Bahawalpur', district: 'Bahawalpur', address: 'Ahmadpur Road, Bahawalpur', lat: 29.3780, lng: 71.6900, total_children: 28, staff_count: 8, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept', org: 'Al-Khidmat Foundation' },
    // --- SAHIWAL (2) ---
    { id: 28, name: 'Kashana Sahiwal', city: 'Sahiwal', district: 'Sahiwal', address: 'Farid Town, Sahiwal', lat: 30.6680, lng: 73.1060, total_children: 32, staff_count: 9, cameras: 6, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    { id: 29, name: 'Edhi Home Sahiwal', city: 'Sahiwal', district: 'Sahiwal', address: 'Railway Road, Sahiwal', lat: 30.6590, lng: 73.1130, total_children: 22, staff_count: 6, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Edhi Foundation', org: 'Edhi Foundation' },
    // --- GUJRAT (2) ---
    { id: 30, name: 'Kashana Gujrat', city: 'Gujrat', district: 'Gujrat', address: 'GT Road, Gujrat', lat: 32.5740, lng: 74.0790, total_children: 30, staff_count: 9, cameras: 6, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    { id: 31, name: 'Al-Khidmat Aghosh Home Gujrat', city: 'Gujrat', district: 'Gujrat', address: 'Civil Lines, Gujrat', lat: 32.5810, lng: 74.0860, total_children: 35, staff_count: 10, cameras: 6, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept', org: 'Al-Khidmat Foundation' },
    // --- JHELUM (2) ---
    { id: 32, name: 'Kashana Jhelum', city: 'Jhelum', district: 'Jhelum', address: 'Cantt Road, Jhelum', lat: 32.9400, lng: 73.7310, total_children: 28, staff_count: 8, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    { id: 33, name: 'Edhi Home Jhelum', city: 'Jhelum', district: 'Jhelum', address: 'GT Road, Jhelum', lat: 32.9340, lng: 73.7250, total_children: 20, staff_count: 6, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Edhi Foundation', org: 'Edhi Foundation' },
    // --- RAHIM YAR KHAN (2) ---
    { id: 34, name: 'Kashana Rahim Yar Khan', city: 'Rahim Yar Khan', district: 'Rahim Yar Khan', address: 'Shahbazpur Road, Rahim Yar Khan', lat: 28.4200, lng: 70.3010, total_children: 35, staff_count: 10, cameras: 6, status: 'online', risk_level: 'medium', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    { id: 35, name: 'Edhi Home Rahim Yar Khan', city: 'Rahim Yar Khan', district: 'Rahim Yar Khan', address: 'Khanpur Road, Rahim Yar Khan', lat: 28.4130, lng: 70.3100, total_children: 22, staff_count: 6, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Edhi Foundation', org: 'Edhi Foundation' },
    // --- DERA GHAZI KHAN (2) ---
    { id: 36, name: 'Kashana D.G. Khan', city: 'Dera Ghazi Khan', district: 'Dera Ghazi Khan', address: 'Block No. 12, D.G. Khan', lat: 30.0560, lng: 70.6410, total_children: 30, staff_count: 9, cameras: 6, status: 'online', risk_level: 'medium', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    { id: 37, name: 'Edhi Home D.G. Khan', city: 'Dera Ghazi Khan', district: 'Dera Ghazi Khan', address: 'Jampur Road, D.G. Khan', lat: 30.0480, lng: 70.6350, total_children: 18, staff_count: 5, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Edhi Foundation', org: 'Edhi Foundation' },
    // --- SHEIKHUPURA (2) ---
    { id: 38, name: 'Kashana Sheikhupura', city: 'Sheikhupura', district: 'Sheikhupura', address: 'Faisalabad Road, Sheikhupura', lat: 31.7130, lng: 73.9850, total_children: 28, staff_count: 8, cameras: 6, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    { id: 39, name: 'CPWB Centre Sheikhupura', city: 'Sheikhupura', district: 'Sheikhupura', address: 'GT Road, Sheikhupura', lat: 31.7060, lng: 73.9780, total_children: 35, staff_count: 10, cameras: 8, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Home Dept (Govt)', org: 'CPWB Punjab' },
    // --- JHANG (2) ---
    { id: 40, name: 'Kashana Jhang', city: 'Jhang', district: 'Jhang', address: 'Toba Road, Jhang', lat: 31.2700, lng: 72.3230, total_children: 25, staff_count: 7, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    { id: 41, name: 'Edhi Home Jhang', city: 'Jhang', district: 'Jhang', address: 'Chiniot Road, Jhang', lat: 31.2760, lng: 72.3310, total_children: 18, staff_count: 5, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Edhi Foundation', org: 'Edhi Foundation' },
    // --- KASUR (2) ---
    { id: 42, name: 'Kashana Kasur', city: 'Kasur', district: 'Kasur', address: 'Multan Road, Kasur', lat: 31.1180, lng: 74.4530, total_children: 30, staff_count: 9, cameras: 6, status: 'online', risk_level: 'medium', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    { id: 43, name: 'CPWB Centre Kasur', city: 'Kasur', district: 'Kasur', address: 'GT Road, Kasur', lat: 31.1120, lng: 74.4470, total_children: 40, staff_count: 12, cameras: 8, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Home Dept (Govt)', org: 'CPWB Punjab' },
    // --- OKARA (2) ---
    { id: 44, name: 'Kashana Okara', city: 'Okara', district: 'Okara', address: 'Multan Road, Okara', lat: 30.8100, lng: 73.4480, total_children: 25, staff_count: 7, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    { id: 45, name: 'Edhi Home Okara', city: 'Okara', district: 'Okara', address: 'Railway Road, Okara', lat: 30.8040, lng: 73.4530, total_children: 18, staff_count: 5, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Edhi Foundation', org: 'Edhi Foundation' },
    // --- VEHARI (2) ---
    { id: 46, name: 'Kashana Vehari', city: 'Vehari', district: 'Vehari', address: 'Multan Road, Vehari', lat: 30.0440, lng: 72.3530, total_children: 22, staff_count: 6, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    { id: 47, name: 'Al-Khidmat Aghosh Home Vehari', city: 'Vehari', district: 'Vehari', address: 'Burewala Road, Vehari', lat: 30.0370, lng: 72.3470, total_children: 20, staff_count: 6, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept', org: 'Al-Khidmat Foundation' },
    // --- MIANWALI (2) ---
    { id: 48, name: 'Kashana Mianwali', city: 'Mianwali', district: 'Mianwali', address: 'Sargodha Road, Mianwali', lat: 32.5820, lng: 71.5340, total_children: 20, staff_count: 6, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    { id: 49, name: 'Edhi Home Mianwali', city: 'Mianwali', district: 'Mianwali', address: 'Bannu Road, Mianwali', lat: 32.5870, lng: 71.5280, total_children: 15, staff_count: 4, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Edhi Foundation', org: 'Edhi Foundation' },
    // --- CHAKWAL (1) ---
    { id: 50, name: 'Kashana Chakwal', city: 'Chakwal', district: 'Chakwal', address: 'Talagang Road, Chakwal', lat: 32.9300, lng: 72.8570, total_children: 22, staff_count: 6, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    // --- ATTOCK (2) ---
    { id: 51, name: 'Kashana Attock', city: 'Attock', district: 'Attock', address: 'Kamra Road, Attock', lat: 33.7690, lng: 72.3610, total_children: 20, staff_count: 6, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    { id: 52, name: 'Pakistan Bait-ul-Mal Centre Attock', city: 'Attock', district: 'Attock', address: 'GT Road, Attock', lat: 33.7750, lng: 72.3680, total_children: 25, staff_count: 7, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Pakistan Bait-ul-Mal (Govt)', org: 'Pakistan Bait-ul-Mal' },
    // --- KHUSHAB (1) ---
    { id: 53, name: 'Kashana Khushab', city: 'Khushab', district: 'Khushab', address: 'Sargodha Road, Khushab', lat: 32.2960, lng: 72.3520, total_children: 18, staff_count: 5, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    // --- HAFIZABAD (1) ---
    { id: 54, name: 'Kashana Hafizabad', city: 'Hafizabad', district: 'Hafizabad', address: 'Gujranwala Road, Hafizabad', lat: 32.0710, lng: 73.6880, total_children: 18, staff_count: 5, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    // --- MANDI BAHAUDDIN (1) ---
    { id: 55, name: 'Kashana Mandi Bahauddin', city: 'Mandi Bahauddin', district: 'Mandi Bahauddin', address: 'Sargodha Road, Mandi Bahauddin', lat: 32.5870, lng: 73.4910, total_children: 20, staff_count: 6, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    // --- NAROWAL (1) ---
    { id: 56, name: 'Kashana Narowal', city: 'Narowal', district: 'Narowal', address: 'Shakargarh Road, Narowal', lat: 32.1020, lng: 74.8730, total_children: 15, staff_count: 4, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    // --- BHAKKAR (1) ---
    { id: 57, name: 'Kashana Bhakkar', city: 'Bhakkar', district: 'Bhakkar', address: 'Darya Khan Road, Bhakkar', lat: 31.6310, lng: 71.0680, total_children: 16, staff_count: 5, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    // --- MUZAFFARGARH (2) ---
    { id: 58, name: 'Kashana Muzaffargarh', city: 'Muzaffargarh', district: 'Muzaffargarh', address: 'Multan Road, Muzaffargarh', lat: 30.0730, lng: 71.1920, total_children: 22, staff_count: 6, cameras: 4, status: 'online', risk_level: 'medium', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    { id: 59, name: 'Edhi Home Muzaffargarh', city: 'Muzaffargarh', district: 'Muzaffargarh', address: 'Alipur Road, Muzaffargarh', lat: 30.0670, lng: 71.1850, total_children: 15, staff_count: 4, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Edhi Foundation', org: 'Edhi Foundation' },
    // --- LAYYAH (1) ---
    { id: 60, name: 'Kashana Layyah', city: 'Layyah', district: 'Layyah', address: 'D.G. Khan Road, Layyah', lat: 30.9680, lng: 70.9410, total_children: 18, staff_count: 5, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    // --- RAJANPUR (1) ---
    { id: 61, name: 'Kashana Rajanpur', city: 'Rajanpur', district: 'Rajanpur', address: 'Jampur Road, Rajanpur', lat: 29.1040, lng: 70.3290, total_children: 15, staff_count: 4, cameras: 4, status: 'online', risk_level: 'medium', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    // --- TOBA TEK SINGH (2) ---
    { id: 62, name: 'Kashana Toba Tek Singh', city: 'Toba Tek Singh', district: 'Toba Tek Singh', address: 'Faisalabad Road, Toba Tek Singh', lat: 30.9710, lng: 72.4830, total_children: 20, staff_count: 6, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    { id: 63, name: 'Pakistan Bait-ul-Mal Centre T.T. Singh', city: 'Toba Tek Singh', district: 'Toba Tek Singh', address: 'Gojra Road, Toba Tek Singh', lat: 30.9760, lng: 72.4900, total_children: 18, staff_count: 5, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Pakistan Bait-ul-Mal (Govt)', org: 'Pakistan Bait-ul-Mal' },
    // --- CHINIOT (1) ---
    { id: 64, name: 'Kashana Chiniot', city: 'Chiniot', district: 'Chiniot', address: 'Faisalabad Road, Chiniot', lat: 31.7200, lng: 72.9790, total_children: 18, staff_count: 5, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    // --- NANKANA SAHIB (1) ---
    { id: 65, name: 'Kashana Nankana Sahib', city: 'Nankana Sahib', district: 'Nankana Sahib', address: 'Lahore Road, Nankana Sahib', lat: 31.4500, lng: 73.7060, total_children: 16, staff_count: 4, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    // --- PAKPATTAN (1) ---
    { id: 66, name: 'Kashana Pakpattan', city: 'Pakpattan', district: 'Pakpattan', address: 'Sahiwal Road, Pakpattan', lat: 30.3430, lng: 73.3870, total_children: 18, staff_count: 5, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    // --- LODHRAN (1) ---
    { id: 67, name: 'Kashana Lodhran', city: 'Lodhran', district: 'Lodhran', address: 'Multan Road, Lodhran', lat: 29.5380, lng: 71.6320, total_children: 15, staff_count: 4, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    // --- KHANEWAL (2) ---
    { id: 68, name: 'Kashana Khanewal', city: 'Khanewal', district: 'Khanewal', address: 'Multan Road, Khanewal', lat: 30.3020, lng: 71.9320, total_children: 22, staff_count: 6, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    { id: 69, name: 'Edhi Home Khanewal', city: 'Khanewal', district: 'Khanewal', address: 'Railway Road, Khanewal', lat: 30.2960, lng: 71.9260, total_children: 14, staff_count: 4, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Edhi Foundation', org: 'Edhi Foundation' },
    // --- BAHAWALNAGAR (2) ---
    { id: 70, name: 'Kashana Bahawalnagar', city: 'Bahawalnagar', district: 'Bahawalnagar', address: 'Fortabbas Road, Bahawalnagar', lat: 29.9940, lng: 73.2530, total_children: 20, staff_count: 6, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    { id: 71, name: 'Edhi Home Bahawalnagar', city: 'Bahawalnagar', district: 'Bahawalnagar', address: 'Chishtian Road, Bahawalnagar', lat: 29.9880, lng: 73.2470, total_children: 12, staff_count: 3, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Edhi Foundation', org: 'Edhi Foundation' },
    // --- CPWB District Centres (6) ---
    { id: 72, name: 'CPWB Centre Faisalabad', city: 'Faisalabad', district: 'Faisalabad', address: 'Jail Road, Faisalabad', lat: 31.4050, lng: 73.0680, total_children: 55, staff_count: 16, cameras: 10, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Home Dept (Govt)', org: 'CPWB Punjab' },
    { id: 73, name: 'CPWB Centre Rawalpindi', city: 'Rawalpindi', district: 'Rawalpindi', address: 'Benazir Bhutto Road, Rawalpindi', lat: 33.6050, lng: 73.0380, total_children: 48, staff_count: 14, cameras: 10, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Home Dept (Govt)', org: 'CPWB Punjab' },
    { id: 74, name: 'CPWB Centre Multan', city: 'Multan', district: 'Multan', address: 'Vehari Road, Multan', lat: 30.1730, lng: 71.4870, total_children: 42, staff_count: 12, cameras: 8, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Home Dept (Govt)', org: 'CPWB Punjab' },
    { id: 75, name: 'CPWB Centre Bahawalpur', city: 'Bahawalpur', district: 'Bahawalpur', address: 'Yazman Road, Bahawalpur', lat: 29.4010, lng: 71.6950, total_children: 35, staff_count: 10, cameras: 6, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Home Dept (Govt)', org: 'CPWB Punjab' },
    { id: 76, name: 'CPWB Centre Sargodha', city: 'Sargodha', district: 'Sargodha', address: 'Lahore Road, Sargodha', lat: 32.0910, lng: 72.6790, total_children: 30, staff_count: 9, cameras: 6, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Home Dept (Govt)', org: 'CPWB Punjab' },
    { id: 77, name: 'CPWB Centre D.G. Khan', city: 'Dera Ghazi Khan', district: 'Dera Ghazi Khan', address: 'Block No. 8, D.G. Khan', lat: 30.0620, lng: 70.6480, total_children: 28, staff_count: 8, cameras: 6, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Home Dept (Govt)', org: 'CPWB Punjab' },
    // --- Pakistan Bait-ul-Mal (3 more) ---
    { id: 78, name: 'Pakistan Bait-ul-Mal Centre Lahore', city: 'Lahore', district: 'Lahore', address: 'Ferozpur Road, Lahore', lat: 31.4680, lng: 74.3080, total_children: 60, staff_count: 18, cameras: 10, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Pakistan Bait-ul-Mal (Govt)', org: 'Pakistan Bait-ul-Mal' },
    { id: 79, name: 'Pakistan Bait-ul-Mal Centre Multan', city: 'Multan', district: 'Multan', address: 'LMQ Road, Multan', lat: 30.2030, lng: 71.4540, total_children: 35, staff_count: 10, cameras: 6, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Pakistan Bait-ul-Mal (Govt)', org: 'Pakistan Bait-ul-Mal' },
    { id: 80, name: 'Pakistan Bait-ul-Mal Centre Rawalpindi', city: 'Rawalpindi', district: 'Rawalpindi', address: 'Liaquat Road, Rawalpindi', lat: 33.6020, lng: 73.0560, total_children: 30, staff_count: 9, cameras: 6, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Pakistan Bait-ul-Mal (Govt)', org: 'Pakistan Bait-ul-Mal' },
    // --- Additional Al-Khidmat Aghosh (3 more) ---
    { id: 81, name: 'Al-Khidmat Aghosh Home Lahore', city: 'Lahore', district: 'Lahore', address: 'Township, Lahore', lat: 31.4520, lng: 74.2680, total_children: 65, staff_count: 19, cameras: 12, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept', org: 'Al-Khidmat Foundation' },
    { id: 82, name: 'Al-Khidmat Aghosh Home Sahiwal', city: 'Sahiwal', district: 'Sahiwal', address: 'Pakpattan Road, Sahiwal', lat: 30.6730, lng: 73.0980, total_children: 28, staff_count: 8, cameras: 6, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept', org: 'Al-Khidmat Foundation' },
    { id: 83, name: 'Al-Khidmat Aghosh Home Jhelum', city: 'Jhelum', district: 'Jhelum', address: 'Pind Dadan Khan Road, Jhelum', lat: 32.9460, lng: 73.7380, total_children: 22, staff_count: 6, cameras: 4, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept', org: 'Al-Khidmat Foundation' },
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
  police_stations: [
    { id: 1, name: 'Mozang Police Station', city: 'Lahore', phone: '042-37230015', lat: 31.5460, lng: 74.3370, address: 'Mozang, Lahore' },
    { id: 2, name: 'Iqbal Town Police Station', city: 'Lahore', phone: '042-35430012', lat: 31.5100, lng: 74.2850, address: 'Allama Iqbal Town, Lahore' },
    { id: 3, name: 'Gulberg Police Station', city: 'Lahore', phone: '042-35761002', lat: 31.5210, lng: 74.3500, address: 'Gulberg III, Lahore' },
    { id: 4, name: 'Jallo Mor Police Post', city: 'Lahore', phone: '042-35310099', lat: 31.5890, lng: 74.3900, address: 'Jallo Mor, GT Road, Lahore' },
    { id: 5, name: 'Township Police Station', city: 'Lahore', phone: '042-35160005', lat: 31.4540, lng: 74.2700, address: 'Township, Lahore' },
    { id: 6, name: 'Satellite Town Police Station', city: 'Rawalpindi', phone: '051-9290003', lat: 33.5940, lng: 73.0580, address: 'Satellite Town, Rawalpindi' },
    { id: 7, name: 'City Police Station Rawalpindi', city: 'Rawalpindi', phone: '051-9270019', lat: 33.5990, lng: 73.0500, address: 'Committee Chowk, Rawalpindi' },
    { id: 8, name: 'Margalla Police Station', city: 'Islamabad', phone: '051-9261006', lat: 33.7090, lng: 73.0450, address: 'G-9, Islamabad' },
    { id: 9, name: 'Peoples Colony Police Station', city: 'Faisalabad', phone: '041-8730004', lat: 31.4310, lng: 73.0860, address: 'Peoples Colony, Faisalabad' },
    { id: 10, name: 'Civil Lines Police Station Faisalabad', city: 'Faisalabad', phone: '041-9200010', lat: 31.4170, lng: 73.0750, address: 'Civil Lines, Faisalabad' },
    { id: 11, name: 'Bosan Road Police Station', city: 'Multan', phone: '061-9200011', lat: 30.2170, lng: 71.4450, address: 'Bosan Road, Multan' },
    { id: 12, name: 'Kutchery Police Station Multan', city: 'Multan', phone: '061-9200012', lat: 30.1980, lng: 71.4770, address: 'Kutchery Road, Multan' },
    { id: 13, name: 'Civil Lines Police Station Gujranwala', city: 'Gujranwala', phone: '055-9200007', lat: 32.1630, lng: 74.1900, address: 'Civil Lines, Gujranwala' },
    { id: 14, name: 'Cantt Police Station Sialkot', city: 'Sialkot', phone: '052-9250014', lat: 32.4960, lng: 74.5250, address: 'Cantt Area, Sialkot' },
    { id: 15, name: 'University Road Police Station', city: 'Sargodha', phone: '048-9230010', lat: 32.0850, lng: 72.6730, address: 'University Road, Sargodha' },
    { id: 16, name: 'Model Town Police Station', city: 'Bahawalpur', phone: '062-9250016', lat: 29.3960, lng: 71.6850, address: 'Model Town, Bahawalpur' },
    { id: 17, name: 'Farid Town Police Station', city: 'Sahiwal', phone: '040-9200017', lat: 30.6700, lng: 73.1080, address: 'Farid Town, Sahiwal' },
    { id: 18, name: 'City Police Station Gujrat', city: 'Gujrat', phone: '053-9200018', lat: 32.5760, lng: 74.0810, address: 'GT Road, Gujrat' },
    { id: 19, name: 'Cantt Police Station Jhelum', city: 'Jhelum', phone: '054-9200019', lat: 32.9420, lng: 73.7330, address: 'Cantt Road, Jhelum' },
    { id: 20, name: 'City Police Station R.Y. Khan', city: 'Rahim Yar Khan', phone: '068-9200020', lat: 28.4220, lng: 70.3030, address: 'Shahbazpur Road, R.Y. Khan' },
    { id: 21, name: 'City Police Station D.G. Khan', city: 'Dera Ghazi Khan', phone: '064-9200021', lat: 30.0580, lng: 70.6430, address: 'Block No. 12, D.G. Khan' },
    { id: 22, name: 'Saddar Police Station Sheikhupura', city: 'Sheikhupura', phone: '056-9200022', lat: 31.7150, lng: 73.9870, address: 'Saddar, Sheikhupura' },
    { id: 23, name: 'City Police Station Jhang', city: 'Jhang', phone: '047-9200023', lat: 31.2720, lng: 72.3250, address: 'Toba Road, Jhang' },
    { id: 24, name: 'City Police Station Kasur', city: 'Kasur', phone: '049-9200024', lat: 31.1200, lng: 74.4550, address: 'Multan Road, Kasur' },
    { id: 25, name: 'City Police Station Okara', city: 'Okara', phone: '044-9200025', lat: 30.8120, lng: 73.4500, address: 'Multan Road, Okara' },
    { id: 26, name: 'City Police Station Vehari', city: 'Vehari', phone: '067-9200026', lat: 30.0460, lng: 72.3550, address: 'Multan Road, Vehari' },
    { id: 27, name: 'City Police Station Mianwali', city: 'Mianwali', phone: '045-9200027', lat: 32.5840, lng: 71.5360, address: 'Sargodha Road, Mianwali' },
    { id: 28, name: 'City Police Station Muzaffargarh', city: 'Muzaffargarh', phone: '066-9200028', lat: 30.0750, lng: 71.1940, address: 'Multan Road, Muzaffargarh' },
    { id: 29, name: 'City Police Station Khanewal', city: 'Khanewal', phone: '065-9200029', lat: 30.3040, lng: 71.9340, address: 'Multan Road, Khanewal' },
    { id: 30, name: 'City Police Station Bahawalnagar', city: 'Bahawalnagar', phone: '063-9200030', lat: 29.9960, lng: 73.2550, address: 'Fortabbas Road, Bahawalnagar' },
  ],
  police_dispatches: [
    { id: 1, incident_id: 101, incident_type: 'physical_violence', incident_label: 'Physical Violence', severity: 'critical', orphanage_id: 17, orphanage_name: 'Al-Khidmat Aghosh Home Gujranwala', orphanage_address: 'Civil Lines, Gujranwala', orphanage_lat: 32.1617, orphanage_lng: 74.1883, station_id: 13, station_name: 'Civil Lines Police Station Gujranwala', station_phone: '055-9200007', station_address: 'Civil Lines, Gujranwala', distance_km: 0.2, zone: 'Main Hall', confidence: 94.3, status: 'on_scene', dispatched_at: new Date(Date.now() - 25 * 60000).toISOString() },
    { id: 2, incident_id: 102, incident_type: 'harassment', incident_label: 'Harassment', severity: 'critical', orphanage_id: 1, orphanage_name: 'SOS Children\'s Village Lahore', orphanage_address: 'Ferozepur Road, Lahore 54600', orphanage_lat: 31.4505, orphanage_lng: 74.3150, station_id: 1, station_name: 'Mozang Police Station', station_phone: '042-37230015', station_address: 'Mozang, Lahore', distance_km: 1.8, zone: 'Garden', confidence: 87.6, status: 'responding', dispatched_at: new Date(Date.now() - 12 * 60000).toISOString() },
    { id: 3, incident_id: 103, incident_type: 'unauthorized_contact', incident_label: 'Unauthorized Contact', severity: 'critical', orphanage_id: 8, orphanage_name: 'Pakistan Sweet Home Islamabad', orphanage_address: 'Sector G-9/1, Islamabad', orphanage_lat: 33.7070, orphanage_lng: 73.0420, station_id: 8, station_name: 'Margalla Police Station', station_phone: '051-9261006', station_address: 'G-9, Islamabad', distance_km: 0.3, zone: 'Main Gate', confidence: 91.2, status: 'dispatched', dispatched_at: new Date(Date.now() - 3 * 60000).toISOString() },
    { id: 4, incident_id: 104, incident_type: 'physical_violence', incident_label: 'Physical Violence', severity: 'critical', orphanage_id: 10, orphanage_name: 'Al-Khidmat Aghosh Home Faisalabad', orphanage_address: 'Peoples Colony No. 1, Faisalabad', orphanage_lat: 31.4290, orphanage_lng: 73.0840, station_id: 9, station_name: 'Peoples Colony Police Station', station_phone: '041-8730004', station_address: 'Peoples Colony, Faisalabad', distance_km: 0.3, zone: 'Dormitory A', confidence: 82.9, status: 'resolved', dispatched_at: new Date(Date.now() - 90 * 60000).toISOString() },
    { id: 5, incident_id: 105, incident_type: 'harassment', incident_label: 'Harassment', severity: 'critical', orphanage_id: 2, orphanage_name: 'Edhi Home Lahore', orphanage_address: '17-A Muslim Block, Allama Iqbal Town, Lahore', orphanage_lat: 31.5082, orphanage_lng: 74.2891, station_id: 2, station_name: 'Iqbal Town Police Station', station_phone: '042-35430012', station_address: 'Allama Iqbal Town, Lahore', distance_km: 0.3, zone: 'Kitchen', confidence: 78.5, status: 'resolved', dispatched_at: new Date(Date.now() - 180 * 60000).toISOString() },
    { id: 6, incident_id: 106, incident_type: 'unauthorized_contact', incident_label: 'Unauthorized Contact', severity: 'critical', orphanage_id: 13, orphanage_name: 'SOS Children\'s Village Multan', orphanage_address: 'Bosan Road, Multan', orphanage_lat: 30.2150, orphanage_lng: 71.4430, station_id: 11, station_name: 'Bosan Road Police Station', station_phone: '061-9200011', station_address: 'Bosan Road, Multan', distance_km: 0.2, zone: 'Main Gate', confidence: 96.1, status: 'resolved', dispatched_at: new Date(Date.now() - 240 * 60000).toISOString() },
  ],
  counters: { children: 8, health_records: 0, visitors: 0, alerts: 0, incidents: 0, activity_log: 0, orphanages: 83, growth_records: 0, notifications: 0, emotion_detections: 0, police_dispatches: 6 }
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
    if (!this.data.police_stations) this.data.police_stations = JSON.parse(JSON.stringify(defaultData.police_stations));
    if (!this.data.police_dispatches) this.data.police_dispatches = [];
    if (!this.data.counters.police_dispatches) this.data.counters.police_dispatches = 0;
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

  // Police Stations & Dispatches
  getPoliceStations() { return this.data.police_stations; }

  getNearestStation(lat, lng) {
    const toRad = d => d * Math.PI / 180;
    let nearest = null;
    let minDist = Infinity;
    this.data.police_stations.forEach(s => {
      const dLat = toRad(s.lat - lat);
      const dLng = toRad(s.lng - lng);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(s.lat)) * Math.sin(dLng / 2) ** 2;
      const dist = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      if (dist < minDist) { minDist = dist; nearest = s; }
    });
    return nearest ? { ...nearest, distance_km: Math.round(minDist * 10) / 10 } : null;
  }

  getDispatches(orphanageId, limit = 50) {
    let list = this.data.police_dispatches;
    if (orphanageId) list = list.filter(d => d.orphanage_id === parseInt(orphanageId));
    return list.sort((a, b) => new Date(b.dispatched_at) - new Date(a.dispatched_at)).slice(0, limit);
  }

  addDispatch(dispatch) {
    dispatch.id = this.nextId('police_dispatches');
    dispatch.dispatched_at = new Date().toISOString();
    dispatch.status = 'dispatched';
    this.data.police_dispatches.push(dispatch);
    if (this.data.police_dispatches.length > 500) this.data.police_dispatches = this.data.police_dispatches.slice(-250);
    this.save();
    return dispatch;
  }

  updateDispatch(id, updates) {
    const d = this.data.police_dispatches.find(x => x.id === parseInt(id));
    if (d) { Object.assign(d, updates); this.save(); }
    return d;
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
