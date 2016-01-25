/// <reference path="../typings/big-integer/big-integer.d.ts" />

export interface Item {
  name: string;
  status: number|BigInteger;
  data: any;
}
