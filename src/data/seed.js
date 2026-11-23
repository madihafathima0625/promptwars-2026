/**
 * @fileoverview LabLink demo seed data.
 * All timestamps are generated relative to `now` so the demo works on any date.
 *
 * @typedef {Object} Equipment
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {string} department
 * @property {string} lab
 * @property {string} description
 * @property {number} quantity
 * @property {number} maxSessionHours
 *
 * @typedef {Object} Persona
 * @property {string} id          - 'asha' | 'ravi' | 'drrao'
 * @property {string} studentId   - student ID used in requests
 * @property {string} name
 * @property {string} role        - 'student' | 'admin'
 * @property {string} department
 * @property {string} bio
 *
 * @typedef {Object} Request
 * @property {string} id
 * @property {string} studentId
 * @property {string} equipmentId
 * @property {string} projectTitle
 * @property {'capstone'|'mini-project'|'coursework'|'practice'} projectStage
 * @property {string} deadline
 * @property {string} startAt
 * @property {string} endAt
 * @property {string} createdAt
 * @property {'pending'|'approved'|'rejected'|'no_show'|'cancelled'} status
 * @property {Object|null} decision  - stored engine decision snapshot
 *
 * @typedef {Object} AlternativeNextSlot
 * @property {'next_slot'} type
 * @property {string} startAt
 * @property {string} endAt
 *
 * @typedef {Object} AlternativeEquivalent
 * @property {'equivalent'} type
 * @property {string} equipmentId
 * @property {string} name
 * @property {string} category
 */

// ── Equipment catalogue ──────────────────────────────────────────────────────

/** @type {Equipment[]} */
export const SEED_EQUIPMENT = [
  {
    id: 'eq-osc-a',
    name: 'Rigol DS1054Z Oscilloscope',
    category: 'oscilloscope',
    department: 'Electronics',
    lab: 'Lab A101',
    description: '4-channel, 50 MHz bandwidth digital oscilloscope. Ideal for signal analysis and debugging embedded systems.',
    quantity: 2,
    maxSessionHours: 4,
  },
  {
    id: 'eq-osc-b',
    name: 'Siglent SDS1202X-E Oscilloscope',
    category: 'oscilloscope',
    department: 'Electronics',
    lab: 'Lab A102',
    description: '2-channel, 200 MHz bandwidth oscilloscope with built-in serial decode.',
    quantity: 1,
    maxSessionHours: 4,
  },
  {
    id: 'eq-la-a',
    name: 'Saleae Logic Pro 16',
    category: 'logic-analyser',
    department: 'Electronics',
    lab: 'Lab A101',
    description: '16-channel USB logic analyser. Supports I²C, SPI, UART and CAN protocol decoding.',
    quantity: 3,
    maxSessionHours: 6,
  },
  {
    id: 'eq-esp32-a',
    name: 'ESP32 Development Kit (×5)',
    category: 'microcontroller-kit',
    department: 'IoT & Embedded',
    lab: 'Lab B201',
    description: 'Set of 5 ESP32-WROOM-32 devkits with USB cables, breadboards, and jumper wires. Wi-Fi + Bluetooth.',
    quantity: 4,
    maxSessionHours: 8,
  },
  {
    id: 'eq-esp32-b',
    name: 'ESP32-S3 Feather Kit',
    category: 'microcontroller-kit',
    department: 'IoT & Embedded',
    lab: 'Lab B202',
    description: 'Adafruit ESP32-S3 Feather with LiPo charger, e-ink display, and sensor breakout pack.',
    quantity: 2,
    maxSessionHours: 6,
  },
  {
    id: 'eq-rpi-a',
    name: 'Raspberry Pi 4 Model B (4 GB)',
    category: 'single-board-computer',
    department: 'IoT & Embedded',
    lab: 'Lab B201',
    description: 'Pi 4 with microSD, case, fan, and official power supply. Linux pre-installed.',
    quantity: 3,
    maxSessionHours: 8,
  },
  {
    id: 'eq-rpi-b',
    name: 'Raspberry Pi 5 (8 GB)',
    category: 'single-board-computer',
    department: 'Computer Science',
    lab: 'Lab C301',
    description: 'Latest Raspberry Pi 5 with NVMe HAT and active cooling. High-performance edge computing.',
    quantity: 1,
    maxSessionHours: 6,
  },
  {
    id: 'eq-3dp-a',
    name: 'Bambu Lab X1-Carbon 3D Printer',
    category: '3d-printer',
    department: 'Mechanical',
    lab: 'Lab D401',
    description: 'Multi-material, high-speed FDM printer. PLA, PETG, TPU, ABS supported. 15-min setup.',
    quantity: 1,
    maxSessionHours: 10,
  },
  {
    id: 'eq-3dp-b',
    name: 'Prusa MK4 3D Printer',
    category: '3d-printer',
    department: 'Mechanical',
    lab: 'Lab D401',
    description: 'Reliable FDM printer with automatic mesh bed levelling. Great for first-time users.',
    quantity: 2,
    maxSessionHours: 10,
  },
  {
    id: 'eq-sol-a',
    name: 'Hakko FX-951 Soldering Station',
    category: 'soldering-station',
    department: 'Electronics',
    lab: 'Lab A103',
    description: 'Professional temperature-controlled soldering station. Includes chisel and fine-tip cartridges.',
    quantity: 6,
    maxSessionHours: 4,
  },
  {
    id: 'eq-fpga-a',
    name: 'Xilinx Artix-7 FPGA Board (Nexys A7)',
    category: 'fpga-board',
    department: 'Electronics',
    lab: 'Lab A104',
    description: 'Digilent Nexys A7-100T. 100M gate FPGA, VGA, USB-HID, Ethernet. Vivado compatible.',
    quantity: 2,
    maxSessionHours: 6,
  },
  {
    id: 'eq-mm-a',
    name: 'Fluke 87V Multimeter',
    category: 'multimeter',
    department: 'Electronics',
    lab: 'Lab A101',
    description: 'True-RMS industrial multimeter. Measures AC/DC voltage, current, resistance, capacitance, and temperature.',
    quantity: 8,
    maxSessionHours: 4,
  },
]

// ── Personas ─────────────────────────────────────────────────────────────────

/** @type {Persona[]} */
export const PERSONAS = [
  {
    id: 'asha',
    studentId: 'stu-asha',
    name: 'Asha Krishnan',
    role: 'student',
    department: 'Electronics',
    bio: 'Final-year Electronics student working on a capstone BLE sensor network. No prior bookings this month.',
  },
  {
    id: 'ravi',
    studentId: 'stu-ravi',
    name: 'Ravi Sharma',
    role: 'student',
    department: 'IoT & Embedded',
    bio: 'Third-year IoT student with an active mini-project. Has used 12 hours of equipment time recently.',
  },
  {
    id: 'drrao',
    studentId: 'stu-drrao',
    name: 'Dr. Priya Rao',
    role: 'admin',
    department: 'Lab Administration',
    bio: 'Lab administrator responsible for equipment allocation and policy.',
  },
]

// ── History helper ────────────────────────────────────────────────────────────

/**
 * Build a completed request record (approved or no_show) in the past.
 *
 * @param {string} id
 * @param {string} studentId
 * @param {string} equipmentId
 * @param {string} stage
 * @param {'approved'|'no_show'} status
 * @param {number} daysAgo     - how many days in the past the session was
 * @param {number} durationH   - session length in hours
 * @param {string} now         - ISO string for current time
 * @returns {Request}
 */
function pastRequest(id, studentId, equipmentId, stage, status, daysAgo, durationH, now) {
  const base = new Date(now).getTime() - daysAgo * 24 * 3600 * 1000
  const start = new Date(base).toISOString()
  const end   = new Date(base + durationH * 3600 * 1000).toISOString()
  const created = new Date(base - 2 * 24 * 3600 * 1000).toISOString()
  const deadline = new Date(base + 7 * 24 * 3600 * 1000).toISOString()
  return {
    id,
    studentId,
    equipmentId,
    projectTitle: 'Historical session',
    projectStage: stage,
    deadline,
    startAt: start,
    endAt: end,
    createdAt: created,
    status,
    decision: null,
  }
}

// ── Seed requests ─────────────────────────────────────────────────────────────

/**
 * Generate the initial set of historical requests relative to `now`.
 * Ravi has ~12 approved hours in the last 30 days and 1 no-show in 60 days.
 *
 * @param {string} now - ISO 8601 current time
 * @returns {Request[]}
 */
export function createSeedRequests(now) {
  return [
    // Ravi: 3 approved sessions (4 h each = 12 h total) in last 30 days
    pastRequest('hist-r1', 'stu-ravi', 'eq-esp32-a', 'mini-project', 'approved', 5,  4, now),
    pastRequest('hist-r2', 'stu-ravi', 'eq-esp32-a', 'mini-project', 'approved', 12, 4, now),
    pastRequest('hist-r3', 'stu-ravi', 'eq-rpi-a',   'mini-project', 'approved', 20, 4, now),
    // Ravi: 1 no-show (within 60 days)
    pastRequest('hist-r4', 'stu-ravi', 'eq-osc-a',   'practice',     'no_show',  40, 2, now),
    // Asha: no history (0 hours approved this month)
  ]
}

// ── Demo conflict ─────────────────────────────────────────────────────────────

/**
 * Create two pending requests from Asha and Ravi for the same single-quantity
 * item (eq-osc-b, quantity=1) in overlapping slots.
 * Asha has a closer deadline (capstone) → higher score → she wins.
 * Ravi has a later deadline (mini-project) → lower score → he loses and gets an alternative.
 *
 * @param {string} now - ISO 8601 current time
 * @returns {Request[]}
 */
export function createDemoConflict(now) {
  const nowMs = new Date(now).getTime()
  const h = 3600 * 1000

  // Session: tomorrow 10:00 to 12:00
  const tomorrow10 = new Date(nowMs + 26 * h)
  tomorrow10.setUTCMinutes(0, 0, 0)
  const sessionStart = tomorrow10.toISOString()
  const sessionEnd   = new Date(tomorrow10.getTime() + 2 * h).toISOString()

  // Asha: capstone, deadline in 4 days
  const ashaDeadline = new Date(nowMs + 4 * 24 * h).toISOString()
  // Ravi: mini-project, deadline in 8 days
  const raviDeadline = new Date(nowMs + 8 * 24 * h).toISOString()

  return [
    {
      id: 'demo-conflict-asha',
      studentId: 'stu-asha',
      equipmentId: 'eq-osc-b',   // quantity = 1 → contention
      projectTitle: 'BLE Sensor Signal Analysis',
      projectStage: 'capstone',
      deadline: ashaDeadline,
      startAt: sessionStart,
      endAt: sessionEnd,
      createdAt: new Date(nowMs - 1 * h).toISOString(),
      status: 'pending',
      decision: null,
    },
    {
      id: 'demo-conflict-ravi',
      studentId: 'stu-ravi',
      equipmentId: 'eq-osc-b',
      projectTitle: 'IoT Gateway Waveform Check',
      projectStage: 'mini-project',
      deadline: raviDeadline,
      startAt: sessionStart,
      endAt: sessionEnd,
      createdAt: new Date(nowMs - 30 * 60 * 1000).toISOString(), // created later
      status: 'pending',
      decision: null,
    },
  ]
}
