import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Province } from '../src/models/Province';
import { District } from '../src/models/District';
import { Hospital } from '../src/models/Hospital';
import { connectDB, disconnectDB } from '../src/db';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function importHospitals() {
  try {
    await connectDB();
    console.log('Starting import...');

    const dataPath = path.resolve(__dirname, '../data/raw/moh_hospitals_2026.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(rawData);

    let stats = {
      provinces: 0,
      districts: 0,
      hospitals: 0,
      errors: 0
    };

    for (const provinceData of data) {
      // 1. Upsert Province
      let province = await Province.findOne({ nameEn: provinceData.province });
      if (!province) {
        province = await Province.create({ nameEn: provinceData.province });
        stats.provinces++;
      }

      for (const districtData of provinceData.districts) {
        // 2. Upsert District
        let district = await District.findOne({ nameEn: districtData.district });
        if (!district) {
          district = await District.create({
            nameEn: districtData.district,
            provinceId: province._id
          });
          stats.districts++;
        }

        // 3. Upsert Hospitals
        for (const hospitalData of districtData.hospitals) {
          try {
            const existingHospital = await Hospital.findOne({ 
              name: hospitalData.name,
              districtId: district._id 
            });

            if (!existingHospital) {
              await Hospital.create({
                name: hospitalData.name,
                type: hospitalData.type,
                provinceId: province._id,
                districtId: district._id,
                address: hospitalData.city,
                services: ['OPD', 'Emergency', 'Pharmacy'], // Base defaults
                verificationStatus: 'Verified',
                sourceName: 'Ministry of Health Sri Lanka',
                lastVerifiedAt: new Date()
              });
              stats.hospitals++;
            }
          } catch (err) {
            console.error(`Failed to import hospital: ${hospitalData.name}`, err);
            stats.errors++;
          }
        }
      }
    }

    console.log('\n--- Import Completed ---');
    console.log(`Provinces Added: ${stats.provinces}`);
    console.log(`Districts Added: ${stats.districts}`);
    console.log(`Hospitals Added: ${stats.hospitals}`);
    console.log(`Errors: ${stats.errors}`);

    // Verification step
    const totalProvinces = await Province.countDocuments();
    const totalDistricts = await District.countDocuments();
    const totalHospitals = await Hospital.countDocuments();
    
    console.log('\n--- Current Database State ---');
    console.log(`Total Provinces: ${totalProvinces}`);
    console.log(`Total Districts: ${totalDistricts}`);
    console.log(`Total Hospitals: ${totalHospitals}`);

    if (totalProvinces !== 9 || totalDistricts !== 25 || totalHospitals === 0) {
      console.warn('\nWARNING: Database state does not match production requirements (9 provinces, 25 districts, >0 hospitals).');
    } else {
      console.log('\nSUCCESS: Database meets production data baseline.');
    }

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('Import failed:', error);
    await disconnectDB();
    process.exit(1);
  }
}

importHospitals();
