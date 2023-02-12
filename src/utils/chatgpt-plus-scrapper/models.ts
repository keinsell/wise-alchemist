export namespace ChatgptModel {
  export const turbo = "text-davinci-002-render-sha";
  export const normal = "text-davinci-002-render-paid";
}

export type ChatgptModelType =
  | typeof ChatgptModel.turbo
  | typeof ChatgptModel.normal;
