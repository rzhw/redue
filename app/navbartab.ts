export interface NavbarTab {
  name: string;
  filter: (number) => boolean;
}
