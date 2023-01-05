import { useEffect, useState } from 'react';
import { Helpers } from '../Helpers';

type Field = {
  hasBomb: boolean;
  numberOfNearbyBombs: number;
  isOpen: boolean;
  isFlagged: boolean;
};

type HandleClickProps = {
  event: React.MouseEvent<HTMLLIElement, MouseEvent>;
  rowIndex: number;
  columnIndex: number;
};

type AutoOpenProps = {
  data: Field[][];
  rowIndex: number;
  columnIndex: number;
};

export function useGame() {
  const size: number = window.innerWidth < 620 ? 12 : 20;
  const bombsAmount: number = window.innerWidth < 620 ? 10 : 40;
  const [data, setData] = useState<Field[][]>([]);
  const [flagsAmount, setFlagsAmount] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isWinner, setIsWinner] = useState<boolean>(false);

  function handleInitalData(): Field[][] {
    let initialData: Field[][] = [];

    for (let i = 0; i < size; i++) {
      initialData.push([]);

      for (let j = 0; j < size; j++) {
        const newData: Field = {
          hasBomb: false,
          numberOfNearbyBombs: 0,
          isOpen: false,
          isFlagged: false,
        };

        initialData[i].push(newData);
      }
    }

    return initialData;
  }

  function handleRandomBombs(data: Field[][]): Field[][] {
    const newData = [...data];

    for (let i = 0; i < bombsAmount; i++) {
      let isSettedBomb = false;
      while (!isSettedBomb) {
        let row = Helpers.randomNumber({ start: 0, end: size - 1 });
        let column = Helpers.randomNumber({ start: 0, end: size - 1 });

        if (!newData[row][column].hasBomb) {
          newData[row][column].hasBomb = true;
          isSettedBomb = true;
        }
      }
    }

    return newData;
  }

  function handleNearbyBombs(data: Field[][]): Field[][] {
    const newData = [...data];

    function setNearbyBomb({
      rowIndex,
      fieldIndex,
    }: {
      rowIndex: number;
      fieldIndex: number;
    }) {
      newData[rowIndex][fieldIndex].numberOfNearbyBombs += 1;

      if (fieldIndex - 1 >= 0) {
        newData[rowIndex][fieldIndex - 1].numberOfNearbyBombs += 1;
      }

      if (fieldIndex + 1 < size) {
        newData[rowIndex][fieldIndex + 1].numberOfNearbyBombs += 1;
      }
    }

    newData.forEach((row, rowIndex) => {
      row.forEach((field, fieldIndex) => {
        if (field.hasBomb) {
          // middle
          setNearbyBomb({ rowIndex, fieldIndex });

          // top
          if (rowIndex - 1 >= 0) {
            setNearbyBomb({ rowIndex: rowIndex - 1, fieldIndex });
          }

          // bottom
          if (rowIndex + 1 < size) {
            setNearbyBomb({ rowIndex: rowIndex + 1, fieldIndex });
          }
        }
      });
    });

    return newData;
  }

  function init() {
    let initialData: Field[][] = handleInitalData();

    initialData = handleRandomBombs(initialData);
    initialData = handleNearbyBombs(initialData);

    setData(initialData);
    setIsGameOver(false);
    setIsWinner(false);
    setFlagsAmount(0);
  }

  function handleExplode() {
    setIsGameOver(true);
  }

  function autoOpenRight({
    data,
    rowIndex,
    columnIndex,
  }: AutoOpenProps): Field[][] {
    let canOpen = true;

    while (canOpen) {
      if (columnIndex >= size) {
        canOpen = false;
        break;
      }

      if (!data[rowIndex][columnIndex].isFlagged)
        data[rowIndex][columnIndex].isOpen = true;

      if (data[rowIndex][columnIndex].numberOfNearbyBombs !== 0) {
        canOpen = false;
        break;
      }

      columnIndex++;
    }

    return data;
  }

  function autoOpenLeft({
    data,
    rowIndex,
    columnIndex,
  }: AutoOpenProps): Field[][] {
    let canOpen = true;

    while (canOpen) {
      if (columnIndex < 0) {
        canOpen = false;
        break;
      }

      if (!data[rowIndex][columnIndex].isFlagged)
        data[rowIndex][columnIndex].isOpen = true;

      if (data[rowIndex][columnIndex].numberOfNearbyBombs !== 0) {
        canOpen = false;
        break;
      }
      columnIndex--;
    }

    return data;
  }

  function autoOpenUp({
    data,
    rowIndex,
    columnIndex,
  }: AutoOpenProps): Field[][] {
    let canOpen = true;

    while (canOpen) {
      if (rowIndex < 0) {
        canOpen = false;
        break;
      }

      if (!data[rowIndex][columnIndex].isFlagged)
        data[rowIndex][columnIndex].isOpen = true;

      if (data[rowIndex][columnIndex].numberOfNearbyBombs !== 0) {
        canOpen = false;
        break;
      }

      data = autoOpenRight({
        data,
        rowIndex,
        columnIndex,
      });

      data = autoOpenLeft({
        data,
        rowIndex,
        columnIndex,
      });

      rowIndex--;
    }

    return data;
  }

  function autoOpenDown({
    data,
    rowIndex,
    columnIndex,
  }: AutoOpenProps): Field[][] {
    let canOpen = true;

    while (canOpen) {
      if (rowIndex >= size) {
        canOpen = false;
        break;
      }

      if (!data[rowIndex][columnIndex].isFlagged)
        data[rowIndex][columnIndex].isOpen = true;

      if (data[rowIndex][columnIndex].numberOfNearbyBombs !== 0) {
        canOpen = false;
        break;
      }

      data = autoOpenRight({
        data,
        rowIndex,
        columnIndex,
      });

      data = autoOpenLeft({
        data,
        rowIndex,
        columnIndex,
      });

      rowIndex++;
    }

    return data;
  }

  function autoOpen({ data, rowIndex, columnIndex }: AutoOpenProps): Field[][] {
    data = autoOpenUp({ data, rowIndex, columnIndex });
    data = autoOpenDown({ data, rowIndex, columnIndex });
    return data;
  }

  function handleOpen({ event, rowIndex, columnIndex }: HandleClickProps) {
    event.preventDefault();

    let newData = [...data];

    if (
      newData[rowIndex][columnIndex].isOpen ||
      newData[rowIndex][columnIndex].isFlagged ||
      isGameOver ||
      isWinner
    )
      return;

    newData[rowIndex][columnIndex].isOpen = true;

    if (newData[rowIndex][columnIndex].hasBomb) {
      handleExplode();
      setData(newData);
      return;
    }

    if (newData[rowIndex][columnIndex].numberOfNearbyBombs > 0) {
      setData(newData);
      return;
    }

    newData = autoOpen({ data: newData, rowIndex, columnIndex });

    setData(newData);
  }

  function handleFlag({ event, rowIndex, columnIndex }: HandleClickProps) {
    event.preventDefault();

    const newData = [...data];

    if (newData[rowIndex][columnIndex].isOpen) return;

    newData[rowIndex][columnIndex].isFlagged =
      !newData[rowIndex][columnIndex].isFlagged;

    setData(newData);
    setFlagsAmount((prev) => {
      if (newData[rowIndex][columnIndex].isFlagged) return prev + 1;

      return prev - 1;
    });
  }

  function checkIfIsWinner(): boolean {
    const fieldsAmount = size * size;
    let openFieldsAmount = 0;

    function reducer(previousValue: number, currentValue: Field): number {
      return previousValue + (currentValue.isOpen ? 1 : 0);
    }

    data.forEach((row) => {
      openFieldsAmount += row.reduce(reducer, 0);
    });

    return fieldsAmount - bombsAmount === openFieldsAmount;
  }

  useEffect(() => {
    if (checkIfIsWinner()) setIsWinner(true);
  }, [data]);

  return {
    data,
    bombsAmount,
    flagsAmount,
    init,
    handleOpen,
    handleFlag,
    isGameOver,
    isWinner,
  };
}
