export function addThousandSeparator(number: number): string {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export const removeDuplicates = (numbers: number[]): number[] => {
  return numbers.reduce<number[]>((uniqueNumbers, number) => {
    if (!uniqueNumbers.includes(number)) {
      uniqueNumbers.push(number);
    }
    return uniqueNumbers;
  }, []);
};
