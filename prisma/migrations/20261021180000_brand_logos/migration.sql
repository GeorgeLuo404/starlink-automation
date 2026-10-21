-- Give the default brands their bundled logos (public/brands). Only rows
-- without a logo are touched, so anything uploaded in the admin is kept.
UPDATE "Partner" AS p
SET "logoUrl" = v.logo
FROM (VALUES
  ('SIEMENS', '/brands/siemens.svg'),
  ('MITSUBISHI', '/brands/mitsubishi-electric.svg'),
  ('OMRON', '/brands/omron.svg'),
  ('INOVANCE', '/brands/inovance.svg'),
  ('DELTA', '/brands/delta.svg'),
  ('BECKHOFF', '/brands/beckhoff.svg'),
  ('FANUC', '/brands/fanuc.svg'),
  ('ABB', '/brands/abb.svg'),
  ('KUKA', '/brands/kuka.svg'),
  ('YASKAWA', '/brands/yaskawa.svg'),
  ('EPSON', '/brands/epson.svg'),
  ('UNIVERSAL ROBOTS', '/brands/universal-robots.svg')
) AS v(name, logo)
WHERE upper(trim(p."name")) = v.name
  AND (p."logoUrl" IS NULL OR p."logoUrl" = '');
