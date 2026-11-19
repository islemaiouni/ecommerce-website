create or replace function public.reserve_variant_stock(variant_id uuid, quantity integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
begin
  if quantity < 1 then
    return false;
  end;

  update public.product_variants
  set stock = stock - quantity
  where id = variant_id
    and active = true
    and stock >= quantity;

  get diagnostics updated_count = row_count;
  return updated_count = 1;
end;
$$;

revoke all on function public.reserve_variant_stock(uuid, integer) from public;
revoke all on function public.reserve_variant_stock(uuid, integer) from anon;
grant execute on function public.reserve_variant_stock(uuid, integer) to service_role;
