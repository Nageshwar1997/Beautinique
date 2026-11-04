// Playground: the pickers in working examples, each with its value shown under it.
import { type ReactNode, useEffect, useState } from 'react';

import {
  ColorPicker,
  ComboBox,
  DatePicker,
  type DateRange,
  DateRangePicker,
  type HierarchyOption,
  HierarchySelect,
  type PickerOption,
  Select,
  todayInIndia,
} from '../src/index';

const SKIN_TYPES: PickerOption[] = [
  { value: 'dry', label: 'Dry' },
  { value: 'oily', label: 'Oily' },
  { value: 'combination', label: 'Combination', description: 'Oily T-zone, dry cheeks' },
  { value: 'normal', label: 'Normal' },
  { value: 'sensitive', label: 'Sensitive', disabled: true, description: 'Coming with the quiz' },
];

const CONCERNS: PickerOption[] = [
  { value: 'acne', label: 'Acne' },
  { value: 'dullness', label: 'Dullness' },
  { value: 'pigmentation', label: 'Pigmentation' },
  { value: 'dark-circles', label: 'Dark circles' },
  { value: 'fine-lines', label: 'Fine lines' },
];

const STATES: PickerOption[] = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
].map((name) => ({ value: name.toLowerCase().replaceAll(' ', '-'), label: name }));

// dummy brands for the "server" search
const BRANDS = [
  'Rosewood Labs',
  'Plum Petal',
  'Kesar Glow',
  'Mitti Naturals',
  'Neem & Co',
  'Gulabi Beauty',
  'Chandan House',
  'Haldi Kitchen',
].map((name) => ({ value: name.toLowerCase().replaceAll(/\W+/g, '-'), label: name }));

const CATEGORIES: HierarchyOption[] = [
  {
    value: 'makeup',
    label: 'Makeup',
    children: [
      {
        value: 'face',
        label: 'Face',
        children: [
          { value: 'foundation', label: 'Foundation' },
          { value: 'concealer', label: 'Concealer' },
          { value: 'blush', label: 'Blush' },
        ],
      },
      {
        value: 'eyes',
        label: 'Eyes',
        children: [
          { value: 'kajal', label: 'Kajal' },
          { value: 'mascara', label: 'Mascara' },
          { value: 'eyeliner', label: 'Eyeliner' },
        ],
      },
      {
        value: 'lips',
        label: 'Lips',
        children: [
          { value: 'lipstick', label: 'Lipstick' },
          { value: 'lip-gloss', label: 'Lip gloss' },
          { value: 'lip-liner', label: 'Lip liner', disabled: true },
        ],
      },
    ],
  },
  {
    value: 'skincare',
    label: 'Skincare',
    children: [
      { value: 'cleansers', label: 'Cleansers' },
      { value: 'moisturisers', label: 'Moisturisers' },
      { value: 'serums', label: 'Serums' },
      { value: 'sunscreen', label: 'Sunscreen' },
    ],
  },
  {
    value: 'haircare',
    label: 'Haircare',
    children: [
      { value: 'shampoo', label: 'Shampoo' },
      { value: 'conditioner', label: 'Conditioner' },
      { value: 'hair-oil', label: 'Hair oil' },
    ],
  },
];

const AREAS: HierarchyOption[] = [
  {
    value: 'mh',
    label: 'Maharashtra',
    children: [
      { value: 'mh-pune', label: 'Pune' },
      { value: 'mh-mumbai', label: 'Mumbai' },
      { value: 'mh-nagpur', label: 'Nagpur' },
    ],
  },
  {
    value: 'ka',
    label: 'Karnataka',
    children: [
      { value: 'ka-bengaluru', label: 'Bengaluru Urban' },
      { value: 'ka-mysuru', label: 'Mysuru' },
    ],
  },
  {
    value: 'dl',
    label: 'Delhi',
    children: [
      { value: 'dl-new-delhi', label: 'New Delhi' },
      { value: 'dl-south', label: 'South Delhi' },
    ],
  },
];

const SHADES = ['#8B1E3F', '#B83B5E', '#D6336C', '#E07A5F', '#C8A27C', '#5C3A2E'];

function Card({ title, id, children }: { title: string; id: string; children: ReactNode }) {
  return (
    <section className="border-border bg-surface rounded-2xl border p-5" aria-labelledby={id}>
      <h2 id={id} className="font-display text-xl font-medium">
        {title}
      </h2>
      <div className="mt-4 space-y-5">{children}</div>
    </section>
  );
}

const Value = ({ children }: { children: ReactNode }) => (
  <output className="bg-surface-muted block rounded-lg px-3 py-2 font-mono text-xs break-all">
    {children}
  </output>
);

function Selects() {
  const [skin, setSkin] = useState<string | null>('combination');
  const [concerns, setConcerns] = useState<string[]>(['acne']);
  const [state, setState] = useState<string | null>(null);
  const [brand, setBrand] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [found, setFound] = useState<PickerOption[]>(BRANDS);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    // a pretend server: 600 ms per search
    const timer = setTimeout(() => {
      const needle = query.trim().toLowerCase();
      setFound(BRANDS.filter((one) => one.label.toLowerCase().includes(needle)));
      setLoading(false);
    }, 600);
    return () => {
      clearTimeout(timer);
    };
  }, [query]);
  return (
    <Card title="Select, ComboBox" id="selects">
      <Select
        label="Skin type"
        options={SKIN_TYPES}
        value={skin}
        onChange={setSkin}
        clearable
        hint="Clearable; one option disabled"
      />
      <Select
        label="Concerns"
        selectionMode="multiple"
        options={CONCERNS}
        value={concerns}
        onChange={setConcerns}
        isRequired
        error={concerns.length === 0 ? 'Choose at least one concern' : ''}
      />
      <Value>
        skin: {String(skin)} · concerns: {JSON.stringify(concerns)}
      </Value>
      <ComboBox
        label="State"
        options={STATES}
        value={state}
        onChange={setState}
        placeholder="Search states"
        hint="36 states and union territories"
      />
      <ComboBox
        label="Brand"
        options={found}
        onSearch={(text) => {
          setQuery(text);
          setLoading(true);
        }}
        loading={loading}
        value={brand}
        onChange={setBrand}
        placeholder="Search brands"
        hint="Searches a pretend server (600 ms)"
      />
      <Select label="Disabled" options={SKIN_TYPES} isDisabled defaultValue="dry" />
      <Value>
        state: {String(state)} · brand: {String(brand)}
      </Value>
    </Card>
  );
}

function Dates() {
  const [dob, setDob] = useState<string | null>(null);
  const [start, setStart] = useState<string | null>(null);
  const [validity, setValidity] = useState<DateRange | null>(null);
  const [period, setPeriod] = useState<DateRange | null>(null);
  return (
    <Card title="DatePicker, DateRangePicker" id="dates">
      <DatePicker
        label="Date of birth"
        value={dob}
        onChange={setDob}
        maxValue={todayInIndia()}
        hint="dd/mm/yyyy, not after today"
      />
      <DatePicker
        label="Offer starts"
        withTime
        value={start}
        onChange={setStart}
        minValue={todayInIndia()}
        isRequired
        error={start === null ? 'Choose when the offer starts' : ''}
        hint="India time; Sundays are not available"
        isDateUnavailable={(date) => new Date(`${date}T00:00:00Z`).getUTCDay() === 0}
      />
      <Value>
        dob: {String(dob)} · start: {String(start)}
      </Value>
      <DateRangePicker
        label="Offer valid"
        withTime
        value={validity}
        onChange={setValidity}
        minValue={todayInIndia()}
      />
      <DateRangePicker label="Report period" value={period} onChange={setPeriod} />
      <Value>
        validity: {JSON.stringify(validity)} · period: {JSON.stringify(period)}
      </Value>
    </Card>
  );
}

function Colours() {
  const [shade, setShade] = useState<string | null>('#B83B5E');
  const [empty, setEmpty] = useState<string | null>(null);
  return (
    <Card title="ColorPicker" id="colours">
      <ColorPicker
        label="Shade colour"
        value={shade}
        onChange={setShade}
        swatches={SHADES}
        hint="Type a hex or open the picker"
      />
      <ColorPicker
        label="Empty, required"
        value={empty}
        onChange={setEmpty}
        isRequired
        error={empty === null ? 'Choose a colour' : ''}
      />
      <Value>
        shade: {String(shade)} · second: {String(empty)}
      </Value>
    </Card>
  );
}

function Hierarchies() {
  const [category, setCategory] = useState<string | null>('lipstick');
  const [filter, setFilter] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>(['mh']);
  return (
    <Card title="HierarchySelect" id="hierarchies">
      <HierarchySelect
        label="Product category"
        options={CATEGORIES}
        value={category}
        onChange={setCategory}
        hint="Only the last level; Lip liner is disabled"
      />
      <HierarchySelect
        label="Filter categories"
        selectionMode="multiple"
        selectable="any"
        options={CATEGORIES}
        value={filter}
        onChange={setFilter}
        placeholder="All categories"
      />
      <HierarchySelect
        label="Areas"
        selectionMode="multiple"
        selectable="any"
        options={AREAS}
        value={areas}
        onChange={setAreas}
        isRequired
        error={areas.length === 0 ? 'Choose at least one area' : ''}
      />
      <Value>
        category: {String(category)} · filter: {JSON.stringify(filter)} · areas:{' '}
        {JSON.stringify(areas)}
      </Value>
    </Card>
  );
}

export function Pickers() {
  return (
    <>
      <Selects />
      <Dates />
      <Colours />
      <Hierarchies />
    </>
  );
}
