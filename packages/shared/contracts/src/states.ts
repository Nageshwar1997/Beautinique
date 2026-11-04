/**
 * India's 28 states and 8 union territories: the ids of a `state` scope (ARCHITECTURE §7.3). A
 * union territory is a `state` scope too, so a State Admin of Delhi holds `{ type: 'state', ids:
 * ['DL'] }`. `gstCode` is the two-digit code a GSTIN starts with.
 */
export const INDIAN_STATES = [
  { id: 'AP', name: 'Andhra Pradesh', kind: 'state', gstCode: '37' },
  { id: 'AR', name: 'Arunachal Pradesh', kind: 'state', gstCode: '12' },
  { id: 'AS', name: 'Assam', kind: 'state', gstCode: '18' },
  { id: 'BR', name: 'Bihar', kind: 'state', gstCode: '10' },
  { id: 'CG', name: 'Chhattisgarh', kind: 'state', gstCode: '22' },
  { id: 'GA', name: 'Goa', kind: 'state', gstCode: '30' },
  { id: 'GJ', name: 'Gujarat', kind: 'state', gstCode: '24' },
  { id: 'HR', name: 'Haryana', kind: 'state', gstCode: '06' },
  { id: 'HP', name: 'Himachal Pradesh', kind: 'state', gstCode: '02' },
  { id: 'JH', name: 'Jharkhand', kind: 'state', gstCode: '20' },
  { id: 'KA', name: 'Karnataka', kind: 'state', gstCode: '29' },
  { id: 'KL', name: 'Kerala', kind: 'state', gstCode: '32' },
  { id: 'MP', name: 'Madhya Pradesh', kind: 'state', gstCode: '23' },
  { id: 'MH', name: 'Maharashtra', kind: 'state', gstCode: '27' },
  { id: 'MN', name: 'Manipur', kind: 'state', gstCode: '14' },
  { id: 'ML', name: 'Meghalaya', kind: 'state', gstCode: '17' },
  { id: 'MZ', name: 'Mizoram', kind: 'state', gstCode: '15' },
  { id: 'NL', name: 'Nagaland', kind: 'state', gstCode: '13' },
  { id: 'OD', name: 'Odisha', kind: 'state', gstCode: '21' },
  { id: 'PB', name: 'Punjab', kind: 'state', gstCode: '03' },
  { id: 'RJ', name: 'Rajasthan', kind: 'state', gstCode: '08' },
  { id: 'SK', name: 'Sikkim', kind: 'state', gstCode: '11' },
  { id: 'TN', name: 'Tamil Nadu', kind: 'state', gstCode: '33' },
  { id: 'TG', name: 'Telangana', kind: 'state', gstCode: '36' },
  { id: 'TR', name: 'Tripura', kind: 'state', gstCode: '16' },
  { id: 'UP', name: 'Uttar Pradesh', kind: 'state', gstCode: '09' },
  { id: 'UK', name: 'Uttarakhand', kind: 'state', gstCode: '05' },
  { id: 'WB', name: 'West Bengal', kind: 'state', gstCode: '19' },
  { id: 'AN', name: 'Andaman and Nicobar Islands', kind: 'union-territory', gstCode: '35' },
  { id: 'CH', name: 'Chandigarh', kind: 'union-territory', gstCode: '04' },
  {
    id: 'DH',
    name: 'Dadra and Nagar Haveli and Daman and Diu',
    kind: 'union-territory',
    gstCode: '26',
  },
  { id: 'DL', name: 'Delhi', kind: 'union-territory', gstCode: '07' },
  { id: 'JK', name: 'Jammu and Kashmir', kind: 'union-territory', gstCode: '01' },
  { id: 'LA', name: 'Ladakh', kind: 'union-territory', gstCode: '38' },
  { id: 'LD', name: 'Lakshadweep', kind: 'union-territory', gstCode: '31' },
  { id: 'PY', name: 'Puducherry', kind: 'union-territory', gstCode: '34' },
] as const;

export type IndianState = (typeof INDIAN_STATES)[number];
export type StateId = IndianState['id'];

const STATE_IDS: ReadonlySet<string> = new Set(INDIAN_STATES.map((state) => state.id));

/** True for the id of a state or union territory. */
export const isStateId = (id: string): id is StateId => STATE_IDS.has(id);
