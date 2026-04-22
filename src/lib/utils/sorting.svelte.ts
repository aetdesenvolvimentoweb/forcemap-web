function getVal(obj: Record<string, any>, key: string): unknown {
  return key.split(".").reduce((o, k) => o?.[k], obj);
}

export function createSorting<T extends Record<string, any>>(
  getData: () => T[],
  initial?: { key: string; dir?: "asc" | "desc" },
) {
  let key = $state<string | null>(initial?.key ?? null);
  let dir = $state<"asc" | "desc">(initial?.dir ?? "asc");

  function sortBy(newKey: string) {
    if (key === newKey) {
      dir = dir === "asc" ? "desc" : "asc";
    } else {
      key = newKey;
      dir = "asc";
    }
  }

  let sorted = $derived.by(() => {
    const data = getData();
    if (!key) return data;

    const k = key;
    return [...data].sort((a, b) => {
      const aVal = getVal(a, k);
      const bVal = getVal(b, k);

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      const cmp =
        typeof aVal === "number" && typeof bVal === "number"
          ? aVal - bVal
          : String(aVal).localeCompare(String(bVal));

      return dir === "asc" ? cmp : -cmp;
    });
  });

  return {
    get sorted() { return sorted; },
    get key() { return key; },
    get dir() { return dir; },
    sortBy,
  };
}
