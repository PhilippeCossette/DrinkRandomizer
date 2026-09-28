// Shape of a drink or shooter in drinks.json / shots.json.

export type Drink = {
  name: string
  salePrice: number // price during the crash
  regularPrice: number // normal price, before the crash
  imgSrc: string
}
