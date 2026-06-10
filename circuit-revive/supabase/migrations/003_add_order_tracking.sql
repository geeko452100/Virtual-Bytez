-- Order shipment tracking (UPS and other carriers)
alter table public.orders
  add column if not exists carrier text
    check (carrier is null or carrier in ('ups', 'usps', 'fedex', 'other')),
  add column if not exists tracking_number text,
  add column if not exists shipped_at timestamptz,
  add column if not exists tracking_status jsonb,
  add column if not exists tracking_updated_at timestamptz;

create index if not exists orders_tracking_number_idx
  on public.orders (tracking_number)
  where tracking_number is not null;
