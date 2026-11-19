insert into public.wilayas(code,name_ar,name_fr) values
(1,'أدرار','Adrar'),(2,'الشلف','Chlef'),(3,'الأغواط','Laghouat'),(4,'أم البواقي','Oum El Bouaghi'),
(5,'باتنة','Batna'),(6,'بجاية','Bejaia'),(7,'بسكرة','Biskra'),(8,'بشار','Bechar'),
(9,'البليدة','Blida'),(10,'البويرة','Bouira'),(11,'تمنراست','Tamanrasset'),(12,'تبسة','Tebessa'),
(13,'تلمسان','Tlemcen'),(14,'تيارت','Tiaret'),(15,'تيزي وزو','Tizi Ouzou'),(16,'الجزائر','Alger'),
(17,'الجلفة','Djelfa'),(18,'جيجل','Jijel'),(19,'سطيف','Setif'),(20,'سعيدة','Saida'),
(21,'سكيكدة','Skikda'),(22,'سيدي بلعباس','Sidi Bel Abbes'),(23,'عنابة','Annaba'),(24,'غليزان','Guelma'),
(25,'قسنطينة','Constantine'),(26,'المدية','Medea'),(27,'مستغانم','Mostaganem'),(28,'المسيلة','Msila'),
(29,'معسكر','Mascara'),(30,'ورقلة','Ouargla'),(31,'وهران','Oran'),(32,'البيض','El Bayadh'),
(33,'إليزي','Illizi'),(34,'برج بوعريريج','Bordj Bou Arreridj'),(35,'بومرداس','Boumerdes'),(36,'الطارف','El Tarf'),
(37,'تندوف','Tindouf'),(38,'تيسمسيلت','Tissemsilt'),(39,'الوادي','El Oued'),(40,'خنشلة','Khenchela'),
(41,'سوق أهراس','Souk Ahras'),(42,'تيبازة','Tipaza'),(43,'ميلة','Mila'),(44,'عين الدفلى','Ain Defla'),
(45,'نعامة','Naama'),(46,'عين تموشنت','Ain Temouchent'),(47,'غرداية','Ghardaia'),(48,'غليزان','Relizane'),
(49,'تيميمون','Timimoun'),(50,'برج باجي مختار','Bordj Badji Mokhtar'),(51,'أولاد جلال','Ouled Djellal'),
(52,'بني عباس','Beni Abbes'),(53,'عين صالح','In Salah'),(54,'عين قزام','In Guezzam'),
(55,'تقرت','Touggourt'),(56,'جانت','Djanet'),(57,'المغير','El Mghair'),(58,'المنيعة','El Meniaa')
on conflict (code) do update set name_ar=excluded.name_ar,name_fr=excluded.name_fr;

insert into public.products(id,slug,name,name_ar,description,description_ar,active,notes_top,notes_heart,notes_base,longevity_hours)
values
('2e4f6f84-9d75-4f9e-8d48-111111111111','sultan-noir','Sultan Noir','سلطان نوير','A powerful modern woody fragrance.','عطر خشبي عصري قوي.',true,array['Bergamot','Black Pepper'],array['Leather','Incense'],array['Oud','Amber'],10),
('2e4f6f84-9d75-4f9e-8d48-222222222222','royal-oud','Royal Oud','رويال عود','An elegant oud composition for evenings.','تركيبة عود أنيقة للسهرات.',true,array['Saffron','Cardamom'],array['Rose','Oud'],array['Musk','Sandalwood'],12)
on conflict (slug) do nothing;

insert into public.product_variants(id,product_id,size_ml,price_dzd,stock)
select 'a1111111-1111-4111-8111-111111111111',id,50,6500,25 from public.products where slug='sultan-noir'
union all select 'a1111111-1111-4111-8111-111111111112',id,100,9800,18 from public.products where slug='sultan-noir'
union all select 'a2222222-2222-4222-8222-222222222222',id,50,7200,20 from public.products where slug='royal-oud'
union all select 'a2222222-2222-4222-8222-222222222223',id,100,10500,15 from public.products where slug='royal-oud'
on conflict (product_id,size_ml) do nothing;

insert into public.shipping_rates(wilaya_code,delivery_type,fee_dzd)
select code,'home',
  case when code in (16,31,25,9,35) then 600 else 900 end
from public.wilayas
on conflict (wilaya_code,delivery_type) do nothing;

insert into public.shipping_rates(wilaya_code,delivery_type,fee_dzd)
select code,'bureau',
  case when code in (16,31,25,9,35) then 400 else 650 end
from public.wilayas
on conflict (wilaya_code,delivery_type) do nothing;
