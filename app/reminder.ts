/// <reference path="../typings/big-integer/big-integer.d.ts" />

export interface Reminder {
  name: string;
  dateDue: Date;
  status: number|BigInteger;
  data: any;
}
