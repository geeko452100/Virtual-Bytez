-- Let customers refresh mock tracking on their own orders without opening full order updates.
-- Admins keep full control via public.is_admin().

create policy "Users update own orders"
  on public.orders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.guard_customer_order_update()
returns trigger
language plpgsql
as $$
begin
  if public.is_admin() then
    return NEW;
  end if;

  if NEW.user_id is distinct from OLD.user_id
     or NEW.status is distinct from OLD.status
     or NEW.subtotal is distinct from OLD.subtotal
     or NEW.shipping_address is distinct from OLD.shipping_address
     or NEW.carrier is distinct from OLD.carrier
     or NEW.tracking_number is distinct from OLD.tracking_number
     or NEW.shipped_at is distinct from OLD.shipped_at
     or NEW.created_at is distinct from OLD.created_at then
    raise exception 'Customers may only update tracking status fields';
  end if;

  return NEW;
end;
$$;

create trigger orders_guard_customer_update
  before update on public.orders
  for each row execute function public.guard_customer_order_update();
