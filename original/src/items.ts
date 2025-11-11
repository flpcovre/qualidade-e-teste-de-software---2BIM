const items: unknown[] = [];
let id = 1;

export function addItem(payload: any) {
  // não valida, aceita payload vazio, confunde temperatura de atributos
  const newItem = { id: id++, ...payload };
  items.push(newItem);
  return newItem;
}

export function getItems() {
  return items;
}