import assert from "node:assert/strict";
import test from "node:test";
import {
  formatProductSku,
  generateNextProductSku,
  isProductSkuUniqueConflict,
  isValidProductSku,
  normalizeSku,
  withServerProductSku,
} from "../lib/sku";

function counterStartingAt(initialValue: number) {
  let value = initialValue;
  return {
    productSkuCounter: {
      upsert: async () => ({ lastValue: ++value }),
    },
  };
}

test("first SKU generation is DSC-000001", async () => {
  assert.equal(await generateNextProductSku(counterStartingAt(0) as never), "DSC-000001");
});

test("SKU allocation increments to DSC-000002", async () => {
  const counter = counterStartingAt(0);
  assert.equal(await generateNextProductSku(counter as never), "DSC-000001");
  assert.equal(await generateNextProductSku(counter as never), "DSC-000002");
});

test("highest DSC-000024 allocates DSC-000025", async () => {
  assert.equal(await generateNextProductSku(counterStartingAt(24) as never), "DSC-000025");
});

test("deleted or gapped records are not reused", async () => {
  assert.equal(await generateNextProductSku(counterStartingAt(3) as never), "DSC-000004");
});

test("duplicate protection recognizes only SKU unique conflicts", () => {
  assert.equal(isProductSkuUniqueConflict({ code: "P2002", meta: { target: ["sku"], modelName: "Product" } }), true);
  assert.equal(isProductSkuUniqueConflict({ code: "P2002", meta: { target: ["slug"], modelName: "Product" } }), false);
});

test("concurrent allocations return unique sequential SKUs", async () => {
  const counter = counterStartingAt(0);
  const values = await Promise.all(Array.from({ length: 20 }, () => generateNextProductSku(counter as never)));
  assert.equal(new Set(values).size, 20);
  assert.equal(values[0], "DSC-000001");
  assert.equal(values[19], "DSC-000020");
});

test("product edits preserve SKU across name changes", () => {
  const data = withServerProductSku({ name: "Changed name", slug: "original-slug", sku: "FORGED" }, "DSC-000024");
  assert.deepEqual(data, { name: "Changed name", slug: "original-slug", sku: "DSC-000024" });
});

test("product edits preserve SKU across slug changes", () => {
  const data = withServerProductSku({ name: "Original name", slug: "changed-slug", sku: "DSC-999999" }, "DSC-000024");
  assert.deepEqual(data, { name: "Original name", slug: "changed-slug", sku: "DSC-000024" });
});

test("invalid client SKU is rejected and cannot influence generated SKU", async () => {
  assert.equal(isValidProductSku("client-value"), false);
  const generatedSku = await generateNextProductSku(counterStartingAt(0) as never);
  assert.deepEqual(withServerProductSku({ name: "Shirt", sku: "client-value" }, generatedSku), { name: "Shirt", sku: "DSC-000001" });
});

test("SKU normalization and format validation are uppercase and strict", () => {
  assert.equal(normalizeSku("  dsc-000024  "), "DSC-000024");
  assert.equal(isValidProductSku("dsc-000024"), true);
  assert.equal(isValidProductSku("DSC-0024"), false);
  assert.equal(formatProductSku(24), "DSC-000024");
});
