// routes/address.js
const express = require("express");
const pool = require("../db");
const axios = require("axios");

const router = express.Router();

const ROLE_CONFIG = {
  farmer: {
    accountTable: "farmer_account",
    addressTable: "farmer_address",
    idField: "farmer_id",
    nameField: "farm_name",
    phoneField: "phone_no",
  },
  customer: {
    accountTable: "customer_account",
    addressTable: "customer_address",
    idField: "customer_id",
    nameField: "customer_name",
    phoneField: "phone_no",
  },
};

async function getCoordinates(city, district, country) {
  const trySearch = async (query) => {
    try {
      const url = "https://geocoding-api.open-meteo.com/v1/search";
      const params = {
        name: query,
        count: 1,
        language: "en",
        format: "json",
      };

      console.log(`[Geocoding] Attempting search for: "${query}"`);
      const response = await axios.get(url, { params });
      const data = response.data;

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        console.log(`[Geocoding] SUCCESS for "${query}": Lat: ${result.latitude}, Lon: ${result.longitude} (${result.name}, ${result.admin1 || ''}, ${result.country})`);
        return {
          latitude: result.latitude,
          longitude: result.longitude,
        };
      }
      return null;
    } catch (err) {
      console.error(`[Geocoding] API error for "${query}":`, err.message);
      return null;
    }
  };

  let coords = await trySearch(`${city}, ${district}, ${country}`);
  if (coords) return coords;

  coords = await trySearch(`${city}, ${country}`);
  if (coords) return coords;

  coords = await trySearch(city);
  if (coords) return coords;

  coords = await trySearch(`${district}, ${country}`);
  if (coords) return coords;

  console.warn(`[Geocoding] FAILED: No coordinates found for ${city}, ${district}, ${country}`);
  return { latitude: null, longitude: null };
}

async function resolveUserAccount(role, userName, phoneNo) {
  const config = ROLE_CONFIG[role];
  if (!config) return null;

  const result = await pool.query(
    `SELECT ${config.idField} AS user_id, ${config.nameField} AS display_name, ${config.phoneField} AS phone_no
     FROM ${config.accountTable}
     WHERE ${config.nameField} = $1 AND ${config.phoneField} = $2 AND status = 'active'`,
    [userName, phoneNo]
  );

  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    ...config,
    userId: row.user_id,
    displayName: row.display_name,
    phoneNo: row.phone_no,
  };
}

async function resolveUserAccountById(role, userId) {
  const config = ROLE_CONFIG[role];
  const parsedId = parseInt(userId, 10);
  if (!config || Number.isNaN(parsedId)) return null;

  const result = await pool.query(
    `SELECT ${config.idField} AS user_id, ${config.nameField} AS display_name, ${config.phoneField} AS phone_no
     FROM ${config.accountTable}
     WHERE ${config.idField} = $1`,
    [parsedId]
  );

  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    ...config,
    userId: row.user_id,
    displayName: row.display_name,
    phoneNo: row.phone_no,
  };
}

async function lookupRegionIdByPincode(pincode) {
  const pincodeStr = String(pincode).trim();
  if (!pincodeStr) return null;

  const regionResult = await pool.query(
    "SELECT region_id FROM region WHERE pincode = $1 LIMIT 1",
    [pincodeStr]
  );

  return regionResult.rows.length > 0 ? regionResult.rows[0].region_id : null;
}

async function syncAccountRegion(role, userId, regionId) {

  void role;
  void userId;
  void regionId;
}

async function resolveAccountFromRequest(role, { user_id, user_name, phone_no }) {
  if (!ROLE_CONFIG[role]) return null;

  if (user_id) {
    const byId = await resolveUserAccountById(role, user_id);
    if (byId) return byId;
  }

  if (user_name && phone_no) {
    return resolveUserAccount(role, user_name, phone_no);
  }

  return null;
}

async function ensureSingleSelectedAddress(account) {
  const selectedResult = await pool.query(
    `SELECT add_id FROM ${account.addressTable}
     WHERE ${account.idField} = $1 AND status = 'selected'
     ORDER BY created_at DESC`,
    [account.userId]
  );

  if (selectedResult.rows.length <= 1) {
    return selectedResult.rows[0]?.add_id ?? null;
  }

  const keepId = selectedResult.rows[0].add_id;
  await pool.query(
    `UPDATE ${account.addressTable}
     SET status = 'unselected'
     WHERE ${account.idField} = $1 AND status = 'selected' AND add_id <> $2`,
    [account.userId, keepId]
  );
  return keepId;
}

async function selectAddressForUser(account, addId) {
  await unselectOtherAddresses(account.addressTable, account.idField, account.userId, addId);
  const updateResult = await pool.query(
    `UPDATE ${account.addressTable}
     SET status = 'selected'
     WHERE add_id = $1 AND ${account.idField} = $2
     RETURNING *`,
    [addId, account.userId]
  );
  return updateResult.rows[0] ?? null;
}

async function autoSelectLatestAddress(account) {
  const nextResult = await pool.query(
    `SELECT add_id FROM ${account.addressTable}
     WHERE ${account.idField} = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [account.userId]
  );

  if (nextResult.rows.length === 0) return null;
  return selectAddressForUser(account, nextResult.rows[0].add_id);
}

async function unselectOtherAddresses(addressTable, idField, userId, exceptAddId = null) {
  if (exceptAddId) {
    await pool.query(
      `UPDATE ${addressTable}
       SET status = 'unselected'
       WHERE ${idField} = $1 AND add_id <> $2`,
      [userId, exceptAddId]
    );
  } else {
    await pool.query(
      `UPDATE ${addressTable} SET status = 'unselected' WHERE ${idField} = $1`,
      [userId]
    );
  }
}

function mapAddressRow(row, userName, phoneNo) {
  return {
    add_id: row.add_id,
    name: userName,
    phone: phoneNo,
    street: row.street_address || "",
    city: row.city,
    district: row.district,
    country: row.country,
    pincode: String(row.pincode),
    latitude: row.latitude ? parseFloat(row.latitude) : null,
    longitude: row.longitude ? parseFloat(row.longitude) : null,
    isDefault: row.status === "selected",
    status: row.status,
    created_at: row.created_at,
  };
}

router.get("/", async (req, res) => {
  try {
    const { user_name, phone_no, role, user_id } = req.query;

    if (!role || !ROLE_CONFIG[role]) {
      return res.status(400).json({ error: "Missing or unsupported role" });
    }

    const account = await resolveAccountFromRequest(role, { user_id, user_name, phone_no });
    if (!account) {
      return res.status(404).json({ error: "User not found" });
    }

    await ensureSingleSelectedAddress(account);

    const result = await pool.query(
      `SELECT * FROM ${account.addressTable}
       WHERE ${account.idField} = $1
       ORDER BY
         CASE WHEN status = 'selected' THEN 0 ELSE 1 END,
         created_at DESC`,
      [account.userId]
    );

    res.json({
      addresses: result.rows.map((row) =>
        mapAddressRow(row, account.displayName, account.phoneNo)
      ),
    });
  } catch (err) {
    console.error("Address fetch error:", err);
    res.status(500).json({ error: "Server error while fetching addresses" });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      user_name,
      phone_no,
      user_id,
      role,
      city,
      district,
      country,
      pincode,
      street_address,
      set_as_selected,
    } = req.body;

    if (!role || !city || !district || !country || !pincode) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!user_id && (!user_name || !phone_no)) {
      return res.status(400).json({ error: "Provide user_id or user_name and phone_no" });
    }

    const account = await resolveAccountFromRequest(role, { user_id, user_name, phone_no });
    if (!account) {
      return res.status(404).json({ error: "User not found" });
    }

    const pincodeInt = parseInt(String(pincode).trim(), 10);
    if (Number.isNaN(pincodeInt)) {
      return res.status(400).json({ error: "Invalid pincode" });
    }

    const { latitude, longitude } = await getCoordinates(city, district, country);

    console.log('---------------------------------------------------------');
    console.log(`[VERIFICATION] Geocoding Result for ${city}:`);
    console.log(`  - Latitude:  ${latitude}`);
    console.log(`  - Longitude: ${longitude}`);
    console.log('---------------------------------------------------------');

    const existingCount = await pool.query(
      `SELECT COUNT(*)::int AS count FROM ${account.addressTable} WHERE ${account.idField} = $1`,
      [account.userId]
    );
    const isFirstAddress = existingCount.rows[0].count === 0;
    const shouldSelect = Boolean(set_as_selected) || isFirstAddress;

    if (shouldSelect) {
      await unselectOtherAddresses(account.addressTable, account.idField, account.userId);
    }

    console.log(`[DB] Inserting into ${account.addressTable} with coordinates: ${latitude}, ${longitude}`);
    const insertResult = await pool.query(
      `INSERT INTO ${account.addressTable}
        (${account.idField}, city, district, country, pincode, street_address, status, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        account.userId,
        city.trim(),
        district.trim(),
        country.trim(),
        pincodeInt,
        street_address ? street_address.trim() : null,
        shouldSelect ? "selected" : "unselected",
        latitude,
        longitude,
      ]
    );

    await ensureSingleSelectedAddress(account);

    const saved = insertResult.rows[0];
    res.status(201).json({
      message: "Address saved successfully",
      address: mapAddressRow(saved, account.displayName, account.phoneNo),
    });
  } catch (err) {
    console.error("Address save error:", err);
    res.status(500).json({
      error: "Server error while saving address",
      message: err.message,
    });
  }
});

router.put("/:add_id", async (req, res) => {
  try {
    const addId = parseInt(req.params.add_id, 10);
    const {
      user_name,
      phone_no,
      user_id,
      role,
      city,
      district,
      country,
      pincode,
      street_address,
      set_as_selected,
    } = req.body;

    if (!addId || !role || !city || !district || !country || !pincode) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!user_id && (!user_name || !phone_no)) {
      return res.status(400).json({ error: "Provide user_id or user_name and phone_no" });
    }

    const account = await resolveAccountFromRequest(role, { user_id, user_name, phone_no });
    if (!account) {
      return res.status(404).json({ error: "User not found" });
    }

    const pincodeInt = parseInt(String(pincode).trim(), 10);
    if (Number.isNaN(pincodeInt)) {
      return res.status(400).json({ error: "Invalid pincode" });
    }

    const { latitude, longitude } = await getCoordinates(city, district, country);

    if (set_as_selected) {
      await unselectOtherAddresses(account.addressTable, account.idField, account.userId, addId);
    }

    console.log(`[DB] Updating ${account.addressTable} (ID: ${addId}) with coordinates: ${latitude}, ${longitude}`);
    const updateResult = await pool.query(
      `UPDATE ${account.addressTable}
       SET city = $1,
           district = $2,
           country = $3,
           pincode = $4,
           street_address = $5,
           status = CASE WHEN $6 THEN 'selected' ELSE status END,
           latitude = $7,
           longitude = $8
       WHERE add_id = $9 AND ${account.idField} = $10
       RETURNING *`,
      [
        city.trim(),
        district.trim(),
        country.trim(),
        pincodeInt,
        street_address ? street_address.trim() : null,
        Boolean(set_as_selected),
        latitude,
        longitude,
        addId,
        account.userId,
      ]
    );

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ error: "Address not found" });
    }

    await ensureSingleSelectedAddress(account);

    res.json({
      message: "Address updated successfully",
      address: mapAddressRow(updateResult.rows[0], account.displayName, account.phoneNo),
    });
  } catch (err) {
    console.error("Address update error:", err);
    res.status(500).json({ error: "Server error while updating address" });
  }
});

router.patch("/:add_id/select", async (req, res) => {
  try {
    const addId = parseInt(req.params.add_id, 10);
    const { user_name, phone_no, user_id, role } = req.body;

    console.log(`[PATCH /address/${addId}/select] Received body:`, req.body);

    if (!addId || !role) {
      console.warn(`[PATCH /address/${addId}/select] Missing addId or role`);
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!user_id && (!user_name || !phone_no)) {
      console.warn(`[PATCH /address/${addId}/select] Missing identification fields (user_id or user_name+phone_no)`);
      return res.status(400).json({ error: "Missing required fields" });
    }

    const account = await resolveAccountFromRequest(role, { user_id, user_name, phone_no });
    if (!account) {
      return res.status(404).json({ error: "User not found" });
    }

    const addressResult = await pool.query(
      `SELECT add_id, pincode FROM ${account.addressTable}
       WHERE add_id = $1 AND ${account.idField} = $2`,
      [addId, account.userId]
    );

    if (addressResult.rows.length === 0) {
      return res.status(404).json({ error: "Address not found" });
    }

    const selectedRow = await selectAddressForUser(account, addId);
    await ensureSingleSelectedAddress(account);

    res.json({
      message: "Selected address updated",
      address: mapAddressRow(selectedRow, account.displayName, account.phoneNo),
    });
  } catch (err) {
    console.error("Address select error:", err);
    res.status(500).json({ error: "Server error while selecting address" });
  }
});

router.delete("/:add_id", async (req, res) => {
  try {
    const addId = parseInt(req.params.add_id, 10);
    const { user_name, phone_no, user_id, role } = req.body;

    if (!addId || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!user_id && (!user_name || !phone_no)) {
      return res.status(400).json({ error: "Provide user_id or user_name and phone_no" });
    }

    const account = await resolveAccountFromRequest(role, { user_id, user_name, phone_no });
    if (!account) {
      return res.status(404).json({ error: "User not found" });
    }

    const deleteResult = await pool.query(
      `DELETE FROM ${account.addressTable}
       WHERE add_id = $1 AND ${account.idField} = $2
       RETURNING *`,
      [addId, account.userId]
    );

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ error: "Address not found" });
    }

    if (deleteResult.rows[0].status === "selected") {
      await autoSelectLatestAddress(account);
    }

    await ensureSingleSelectedAddress(account);

    res.json({ message: "Address deleted successfully" });
  } catch (err) {
    console.error("Address delete error:", err);
    res.status(500).json({ error: "Server error while deleting address" });
  }
});

module.exports = router;
