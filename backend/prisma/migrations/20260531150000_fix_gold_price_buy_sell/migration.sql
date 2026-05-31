UPDATE "GoldPrice"
SET "mongolBankPrice" = COALESCE("mongolBankPrice", "pricePerGram")
WHERE "mongolBankPrice" IS NULL;

UPDATE "GoldPrice"
SET
  "buyPrice" = "mongolBankPrice" - 1000,
  "sellPrice" = "mongolBankPrice" + 1000
WHERE "buyPrice" = 0 OR "sellPrice" = 0;
