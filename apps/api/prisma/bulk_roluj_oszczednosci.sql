UPDATE "Budzet" b
SET "roluj" = true
FROM "Kategoria" k
WHERE b."kategoriaId" = k."id"
  AND LOWER(k."nazwa") IN ('oszczednosci','oszczędności');