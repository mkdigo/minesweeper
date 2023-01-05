type RandomNumberProps = {
  start: number;
  end: number;
};

export class Helpers {
  static randomNumber({ start, end }: RandomNumberProps): number {
    const number = Math.round(Math.random() * (end - start) + start);

    return number;
  }
}
