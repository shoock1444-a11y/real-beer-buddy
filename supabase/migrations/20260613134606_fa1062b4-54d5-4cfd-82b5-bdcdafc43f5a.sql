UPDATE public.products p SET image_url = m.url
FROM (VALUES
  ('svitle','/__l5e/assets-v1/e52a04a0-50ea-4210-ac61-a68b2e6b5f48/cat-svitle.jpg'),
  ('temne','/__l5e/assets-v1/3144b4b4-a6cc-4efe-a0e9-fc967204f5c8/cat-temne.jpg'),
  ('ipa','/__l5e/assets-v1/3ae26336-cf21-404b-96d2-ab06d423c2ea/cat-ipa.jpg'),
  ('pshenychne','/__l5e/assets-v1/d5052c04-4541-43af-96d0-83730bbe1eca/cat-pshenychne.jpg'),
  ('kraft','/__l5e/assets-v1/d97bde71-b274-4e14-b6cf-76d5ae05ae2e/cat-kraft.jpg'),
  ('sydr','/__l5e/assets-v1/385e80ee-9dc6-4cba-bde2-0113ab5dee54/cat-sydr.jpg'),
  ('bezalkoholne','/__l5e/assets-v1/9e8daa6e-7d5f-4805-811b-88f57b7c60e0/cat-bezalkoholne.jpg'),
  ('zakusky','/__l5e/assets-v1/c634667b-7244-4e57-89ce-85aaaca0809d/cat-zakusky.jpg')
) AS m(slug, url)
JOIN public.categories c ON c.slug = m.slug
WHERE p.category_id = c.id;