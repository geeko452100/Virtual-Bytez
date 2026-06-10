-- Server-side order creation with price validation, stock checks, and atomic inserts.

create or replace function public.compute_customization_price(
  p_base_price numeric,
  p_options jsonb,
  p_selections jsonb
)
returns numeric
language plpgsql
stable
as $$
declare
  opt jsonb;
  choice jsonb;
  val jsonb;
  add_on numeric := 0;
begin
  for opt in select value from jsonb_array_elements(coalesce(p_options, '[]'::jsonb))
  loop
    val := p_selections -> (opt->>'id');

    if opt->>'type' = 'select' and val is not null and val <> 'null'::jsonb then
      for choice in select value from jsonb_array_elements(coalesce(opt->'choices', '[]'::jsonb))
      loop
        if choice->>'value' = val #>> '{}' then
          add_on := add_on + coalesce((choice->>'priceModifier')::numeric, 0);
        end if;
      end loop;
    elsif opt->>'type' = 'checkbox' and jsonb_typeof(val) = 'array' then
      for choice in select value from jsonb_array_elements(coalesce(opt->'choices', '[]'::jsonb))
      loop
        if exists (
          select 1
          from jsonb_array_elements_text(val) as selected(value)
          where selected.value = choice->>'value'
        ) then
          add_on := add_on + coalesce((choice->>'priceModifier')::numeric, 0);
        end if;
      end loop;
    elsif opt->>'type' = 'text' and val is not null then
      if length(trim(coalesce(val #>> '{}', ''))) > 0 then
        add_on := add_on + coalesce((opt->>'priceModifier')::numeric, 0);
      end if;
    end if;
  end loop;

  return round((p_base_price + add_on)::numeric, 2);
end;
$$;

create or replace function public.create_order(
  p_cart_items jsonb,
  p_client_subtotal numeric,
  p_shipping_address jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_item jsonb;
  v_product public.products%rowtype;
  v_quantity integer;
  v_unit_price numeric;
  v_line_total numeric;
  v_computed_subtotal numeric := 0;
  v_order public.orders%rowtype;
  v_order_id uuid;
  v_product_id text;
  v_stock_needed jsonb := '{}'::jsonb;
  v_needed integer;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_shipping_address is null then
    raise exception 'shippingAddress is required';
  end if;

  if p_cart_items is null or jsonb_array_length(p_cart_items) = 0 then
    raise exception 'Order must include at least one item';
  end if;

  for v_item in select value from jsonb_array_elements(p_cart_items)
  loop
    v_product_id := v_item->>'product_id';
    v_quantity := (v_item->>'quantity')::integer;

    if v_product_id is null or v_quantity is null or v_quantity < 1 then
      raise exception 'Invalid cart item';
    end if;

    v_needed := coalesce((v_stock_needed->>v_product_id)::integer, 0) + v_quantity;
    v_stock_needed := jsonb_set(v_stock_needed, array[v_product_id], to_jsonb(v_needed), true);
  end loop;

  for v_product_id in select jsonb_object_keys(v_stock_needed)
  loop
    select * into v_product
    from public.products
    where id = v_product_id
    for update;

    if not found then
      raise exception 'Invalid or unknown product: %', v_product_id;
    end if;

    if not v_product.active then
      raise exception 'Product is not available: %', v_product.name;
    end if;

    v_needed := (v_stock_needed->>v_product_id)::integer;
    if v_product.stock_count < v_needed then
      raise exception 'Insufficient stock for %', v_product.name;
    end if;
  end loop;

  for v_item in select value from jsonb_array_elements(p_cart_items)
  loop
    select * into v_product from public.products where id = v_item->>'product_id';
    v_quantity := (v_item->>'quantity')::integer;
    v_unit_price := public.compute_customization_price(
      v_product.base_price,
      v_product.customization_options,
      coalesce(v_item->'selections', '{}'::jsonb)
    );
    v_line_total := round((v_unit_price * v_quantity)::numeric, 2);
    v_computed_subtotal := round((v_computed_subtotal + v_line_total)::numeric, 2);
  end loop;

  if abs(v_computed_subtotal - round(p_client_subtotal::numeric, 2)) > 0.01 then
    raise exception 'Order subtotal does not match line items';
  end if;

  insert into public.orders (user_id, subtotal, shipping_address, status)
  values (v_user_id, v_computed_subtotal, p_shipping_address, 'pending')
  returning * into v_order;

  v_order_id := v_order.id;

  for v_item in select value from jsonb_array_elements(p_cart_items)
  loop
    select * into v_product from public.products where id = v_item->>'product_id';
    v_quantity := (v_item->>'quantity')::integer;
    v_unit_price := public.compute_customization_price(
      v_product.base_price,
      v_product.customization_options,
      coalesce(v_item->'selections', '{}'::jsonb)
    );
    v_line_total := round((v_unit_price * v_quantity)::numeric, 2);

    insert into public.order_items (
      order_id,
      product_id,
      product_name,
      selections,
      quantity,
      unit_price,
      line_total
    ) values (
      v_order_id,
      v_product.id,
      v_product.name,
      coalesce(v_item->'selections', '{}'::jsonb),
      v_quantity,
      v_unit_price,
      v_line_total
    );

    update public.products
    set stock_count = stock_count - v_quantity
    where id = v_product.id;
  end loop;

  return to_jsonb(v_order);
end;
$$;

revoke all on function public.create_order(jsonb, numeric, jsonb) from public;
grant execute on function public.create_order(jsonb, numeric, jsonb) to authenticated;

-- Realtime replication for live catalog and order updates.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.orders;
    alter publication supabase_realtime add table public.products;
  end if;
exception
  when duplicate_object then
    null;
end $$;

alter table public.orders replica identity full;
alter table public.products replica identity full;
